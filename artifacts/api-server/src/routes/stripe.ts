import { Router, type IRouter } from 'express';
import { eq, sql } from 'drizzle-orm';
import { db, workersTable } from '@workspace/db';
import { getUncachableStripeClient } from '../stripeClient';

const router: IRouter = Router();

router.post('/stripe/checkout', async (req, res): Promise<void> => {
  const { workerId, membershipType } = req.body as { workerId: number; membershipType: string };

  if (!workerId || !membershipType) {
    res.status(400).json({ error: 'workerId and membershipType are required' });
    return;
  }

  const [worker] = await db.select().from(workersTable).where(eq(workersTable.id, workerId));
  if (!worker) {
    res.status(404).json({ error: 'Worker not found' });
    return;
  }

  const stripe = await getUncachableStripeClient();

  let customerId = worker.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      name: worker.name,
      phone: worker.phone,
      metadata: { workerId: String(workerId) },
    });
    customerId = customer.id;
    await db.update(workersTable).set({ stripeCustomerId: customerId }).where(eq(workersTable.id, workerId));
  }

  const prices = await stripe.prices.list({ active: true, limit: 20 });
  const targetProduct = membershipType === 'premium_plus' ? 'KashWork Premium Plus' : 'KashWork Premium';
  const products = await stripe.products.list({ active: true, limit: 20 });
  const product = products.data.find(p => p.name === targetProduct);

  if (!product) {
    res.status(404).json({ error: `Product "${targetProduct}" not found. Run the seed script first.` });
    return;
  }

  const price = prices.data.find(p => p.product === product.id);
  if (!price) {
    res.status(404).json({ error: 'Price not found for product' });
    return;
  }

  const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: price.id, quantity: 1 }],
    mode: 'payment',
    payment_method_options: {
      card: {
        request_three_d_secure: 'automatic',
      },
    },
    success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&worker_id=${workerId}&membership=${membershipType}`,
    cancel_url: `${baseUrl}/dashboard`,
    metadata: { workerId: String(workerId), membershipType },
  });

  res.json({ url: session.url });
});

router.get('/stripe/verify-session', async (req, res): Promise<void> => {
  const { session_id, worker_id, membership } = req.query as {
    session_id: string;
    worker_id: string;
    membership: string;
  };

  if (!session_id || !worker_id || !membership) {
    res.status(400).json({ error: 'session_id, worker_id and membership are required' });
    return;
  }

  const stripe = await getUncachableStripeClient();
  const session = await stripe.checkout.sessions.retrieve(session_id);

  if (session.payment_status !== 'paid') {
    res.status(402).json({ error: 'Payment not completed', status: session.payment_status });
    return;
  }

  const wid = Number(worker_id);
  const [worker] = await db
    .update(workersTable)
    .set({ membershipType: membership as 'premium' | 'premium_plus' })
    .where(eq(workersTable.id, wid))
    .returning();

  if (!worker) {
    res.status(404).json({ error: 'Worker not found' });
    return;
  }

  res.json({ success: true, membershipType: worker.membershipType });
});

router.get('/stripe/products', async (_req, res): Promise<void> => {
  const result = await db.execute(
    sql`SELECT p.id, p.name, p.description, p.metadata,
               pr.id as price_id, pr.unit_amount, pr.currency
        FROM stripe.products p
        JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
        WHERE p.active = true
        ORDER BY pr.unit_amount`
  );
  res.json({ data: result.rows });
});

export default router;
