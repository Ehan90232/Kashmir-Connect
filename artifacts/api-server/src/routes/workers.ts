import { Router, type IRouter } from "express";
import { eq, and, sql } from "drizzle-orm";
import { db, workersTable } from "@workspace/db";
import {
  ListWorkersQueryParams,
  CreateWorkerBody,
  GetWorkerParams,
  UpdateWorkerParams,
  UpdateWorkerBody,
  DeleteWorkerParams,
  UpdateWorkerAvailabilityParams,
  UpdateWorkerAvailabilityBody,
  UpdateWorkerMembershipParams,
  UpdateWorkerMembershipBody,
  GetNearbyWorkersQueryParams,
  ListWorkersResponse,
  GetNearbyWorkersResponse,
  GetWorkerResponse,
  UpdateWorkerResponse,
  UpdateWorkerAvailabilityResponse,
  UpdateWorkerMembershipResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

router.get("/workers/nearby", async (req, res): Promise<void> => {
  const parsed = GetNearbyWorkersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { lat, lng, category, limit } = parsed.data;

  const conditions = [eq(workersTable.isApproved, true)];
  if (category) conditions.push(eq(workersTable.category, category));

  const workers = await db
    .select()
    .from(workersTable)
    .where(and(...conditions));

  const withDistance = workers
    .map((w) => ({ ...w, distanceKm: haversineKm(lat, lng, w.latitude, w.longitude) }))
    .sort((a, b) => {
      if (b.membershipType !== a.membershipType) {
        const rank: Record<string, number> = { premium_plus: 2, premium: 1, free: 0 };
        return rank[b.membershipType] - rank[a.membershipType];
      }
      return a.distanceKm - b.distanceKm;
    })
    .slice(0, limit ?? 50);

  res.json(GetNearbyWorkersResponse.parse(withDistance.map((w) => ({ ...w, createdAt: w.createdAt.toISOString() }))));
});

router.get("/workers", async (req, res): Promise<void> => {
  const parsed = ListWorkersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { lat, lng, radius = 20, category, available, sort } = parsed.data;

  const conditions = [eq(workersTable.isApproved, true)];
  if (category) conditions.push(eq(workersTable.category, category));
  if (available !== undefined) conditions.push(eq(workersTable.isAvailable, available));

  let workers = await db
    .select()
    .from(workersTable)
    .where(and(...conditions));

  // Filter by radius if location provided
  if (lat != null && lng != null) {
    workers = workers.filter((w) => haversineKm(lat, lng, w.latitude, w.longitude) <= radius);
  }

  // Sort
  if (sort === "rating") {
    workers.sort((a, b) => b.averageRating - a.averageRating);
  } else if (sort === "membership") {
    const rank: Record<string, number> = { premium_plus: 2, premium: 1, free: 0 };
    workers.sort((a, b) => rank[b.membershipType] - rank[a.membershipType]);
  } else if (sort === "distance" && lat != null && lng != null) {
    workers.sort(
      (a, b) =>
        haversineKm(lat, lng, a.latitude, a.longitude) -
        haversineKm(lat, lng, b.latitude, b.longitude)
    );
  } else {
    // Default: premium_plus first, then premium, then free; within tier sort by rating
    const rank: Record<string, number> = { premium_plus: 2, premium: 1, free: 0 };
    workers.sort((a, b) => {
      const tierDiff = rank[b.membershipType] - rank[a.membershipType];
      if (tierDiff !== 0) return tierDiff;
      return b.averageRating - a.averageRating;
    });
  }

  res.json(ListWorkersResponse.parse(workers.map((w) => ({ ...w, createdAt: w.createdAt.toISOString() }))));
});

router.post("/workers", async (req, res): Promise<void> => {
  const parsed = CreateWorkerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [worker] = await db
    .insert(workersTable)
    .values({ ...parsed.data, isApproved: false })
    .returning();

  res.status(201).json(GetWorkerResponse.parse({ ...worker, createdAt: worker.createdAt.toISOString() }));
});

router.get("/workers/:id", async (req, res): Promise<void> => {
  const params = GetWorkerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [worker] = await db.select().from(workersTable).where(eq(workersTable.id, params.data.id));
  if (!worker) {
    res.status(404).json({ error: "Worker not found" });
    return;
  }

  res.json(GetWorkerResponse.parse({ ...worker, createdAt: worker.createdAt.toISOString() }));
});

router.patch("/workers/:id", async (req, res): Promise<void> => {
  const params = UpdateWorkerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateWorkerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [worker] = await db
    .update(workersTable)
    .set(parsed.data)
    .where(eq(workersTable.id, params.data.id))
    .returning();

  if (!worker) {
    res.status(404).json({ error: "Worker not found" });
    return;
  }

  res.json(UpdateWorkerResponse.parse({ ...worker, createdAt: worker.createdAt.toISOString() }));
});

router.delete("/workers/:id", async (req, res): Promise<void> => {
  const params = DeleteWorkerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [worker] = await db.delete(workersTable).where(eq(workersTable.id, params.data.id)).returning();
  if (!worker) {
    res.status(404).json({ error: "Worker not found" });
    return;
  }

  res.sendStatus(204);
});

router.patch("/workers/:id/availability", async (req, res): Promise<void> => {
  const params = UpdateWorkerAvailabilityParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateWorkerAvailabilityBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [worker] = await db
    .update(workersTable)
    .set({ isAvailable: parsed.data.isAvailable })
    .where(eq(workersTable.id, params.data.id))
    .returning();

  if (!worker) {
    res.status(404).json({ error: "Worker not found" });
    return;
  }

  res.json(UpdateWorkerAvailabilityResponse.parse({ ...worker, createdAt: worker.createdAt.toISOString() }));
});

router.patch("/workers/:id/membership", async (req, res): Promise<void> => {
  const params = UpdateWorkerMembershipParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateWorkerMembershipBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [worker] = await db
    .update(workersTable)
    .set({ membershipType: parsed.data.membershipType })
    .where(eq(workersTable.id, params.data.id))
    .returning();

  if (!worker) {
    res.status(404).json({ error: "Worker not found" });
    return;
  }

  res.json(UpdateWorkerMembershipResponse.parse({ ...worker, createdAt: worker.createdAt.toISOString() }));
});

export default router;
