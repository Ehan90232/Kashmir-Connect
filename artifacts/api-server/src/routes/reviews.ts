import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, reviewsTable, workersTable } from "@workspace/db";
import {
  ListWorkerReviewsParams,
  CreateReviewParams,
  CreateReviewBody,
  ListWorkerReviewsResponse,
  GetWorkerResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/workers/:workerId/reviews", async (req, res): Promise<void> => {
  const params = ListWorkerReviewsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const reviews = await db
    .select()
    .from(reviewsTable)
    .where(eq(reviewsTable.workerId, params.data.workerId))
    .orderBy(reviewsTable.createdAt);

  res.json(ListWorkerReviewsResponse.parse(reviews.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))));
});

router.post("/workers/:workerId/reviews", async (req, res): Promise<void> => {
  const params = CreateReviewParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = CreateReviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Insert review
  const [review] = await db
    .insert(reviewsTable)
    .values({ workerId: params.data.workerId, ...parsed.data })
    .returning();

  // Recalculate worker's average rating
  const allReviews = await db
    .select()
    .from(reviewsTable)
    .where(eq(reviewsTable.workerId, params.data.workerId));

  const totalRatings = allReviews.length;
  const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / totalRatings;

  await db
    .update(workersTable)
    .set({ averageRating, totalRatings })
    .where(eq(workersTable.id, params.data.workerId));

  res.status(201).json({ ...review, createdAt: review.createdAt.toISOString() });
});

export default router;
