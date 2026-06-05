import Stripe from 'stripe';

async function getStripeCredentials(): Promise<{ secretKey: string }> {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? "depl " + process.env.WEB_REPL_RENEWAL
      : null;

  if (!hostname || !xReplitToken) {
    throw new Error('Missing Replit env vars. Ensure Stripe integration is connected.');
  }

  const resp = await fetch(
    `https://${hostname}/api/v2/connection?include_secrets=true&connector_names=stripe`,
    {
      headers: { Accept: "application/json", X_REPLIT_TOKEN: xReplitToken },
      signal: AbortSignal.timeout(10_000),
    }
  );

  if (!resp.ok) throw new Error(`Failed to fetch Stripe credentials: ${resp.status}`);

  const data = await resp.json();
  const settings = data.items?.[0]?.settings;
  if (!settings?.secret_key) throw new Error('Stripe not connected. Connect via Integrations tab.');

  return { secretKey: settings.secret_key };
}

async function seedProducts() {
  const { secretKey } = await getStripeCredentials();
  const stripe = new Stripe(secretKey);

  const plans = [
    {
      name: 'KashWork Premium',
      description: 'Blue verified badge, priority in search results, more job requests',
      amount: 49900,
      currency: 'inr',
    },
    {
      name: 'KashWork Premium Plus',
      description: 'Gold crown badge, top of search results, featured on home page, WhatsApp job alerts',
      amount: 89900,
      currency: 'inr',
    },
  ];

  for (const plan of plans) {
    const existing = await stripe.products.search({ query: `name:'${plan.name}' AND active:'true'` });
    if (existing.data.length > 0) {
      console.log(`✓ "${plan.name}" already exists (${existing.data[0].id})`);
      const prices = await stripe.prices.list({ product: existing.data[0].id, active: true });
      if (prices.data.length > 0) {
        console.log(`  Price: ${prices.data[0].id} — ${prices.data[0].unit_amount} ${prices.data[0].currency}`);
      }
      continue;
    }

    const product = await stripe.products.create({
      name: plan.name,
      description: plan.description,
    });
    console.log(`✓ Created product: ${product.name} (${product.id})`);

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: plan.amount,
      currency: plan.currency,
    });
    console.log(`  Price: ${price.id} — ₹${plan.amount / 100}`);
  }

  console.log('\nDone! Products and prices are ready in Stripe.');
}

seedProducts().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
