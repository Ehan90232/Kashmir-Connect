import { Router, type IRouter } from "express";
import { eq, count, avg, sql } from "drizzle-orm";
import { db, workersTable, reviewsTable } from "@workspace/db";
import { GetStatsSummaryResponse, GetStatsByCategoryResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/stats/summary", async (_req, res): Promise<void> => {
  const workers = await db.select().from(workersTable);
  const reviews = await db.select().from(reviewsTable);

  const totalWorkers = workers.length;
  const activeWorkers = workers.filter((w) => w.isAvailable && w.isApproved).length;
  const premiumWorkers = workers.filter((w) => w.membershipType === "premium").length;
  const premiumPlusWorkers = workers.filter((w) => w.membershipType === "premium_plus").length;
  const pendingApprovals = workers.filter((w) => !w.isApproved).length;
  const totalReviews = reviews.length;
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  res.json(
    GetStatsSummaryResponse.parse({
      totalWorkers,
      activeWorkers,
      premiumWorkers,
      premiumPlusWorkers,
      totalReviews,
      avgRating: Math.round(avgRating * 10) / 10,
      pendingApprovals,
    })
  );
});

router.get("/stats/by-category", async (_req, res): Promise<void> => {
  const workers = await db.select().from(workersTable).where(eq(workersTable.isApproved, true));

  const grouped: Record<string, { count: number; available: number }> = {};
  for (const w of workers) {
    if (!grouped[w.category]) grouped[w.category] = { count: 0, available: 0 };
    grouped[w.category].count++;
    if (w.isAvailable) grouped[w.category].available++;
  }

  const result = Object.entries(grouped).map(([category, data]) => ({
    category,
    count: data.count,
    available: data.available,
  }));

  res.json(GetStatsByCategoryResponse.parse(result));
});

export default router;
