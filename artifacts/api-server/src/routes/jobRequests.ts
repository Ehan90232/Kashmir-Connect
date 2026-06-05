import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, jobRequestsTable } from "@workspace/db";
import {
  ListJobRequestsQueryParams,
  ListJobRequestsResponse,
  CreateJobRequestBody,
  ListJobRequestsResponseItem,
  UpdateJobRequestStatusParams,
  UpdateJobRequestStatusBody,
  UpdateJobRequestStatusResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/job-requests", async (req, res) => {
  const query = ListJobRequestsQueryParams.parse(req.query);

  const conditions = [];
  if (query.status) conditions.push(eq(jobRequestsTable.status, query.status));
  if (query.category) conditions.push(eq(jobRequestsTable.category, query.category));

  const rows = await db
    .select()
    .from(jobRequestsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(jobRequestsTable.createdAt);

  res.json(ListJobRequestsResponse.parse(rows.map(r => ({ ...r, createdAt: r.createdAt.toISOString() }))));
});

router.post("/job-requests", async (req, res) => {
  const body = CreateJobRequestBody.parse(req.body);
  const [row] = await db.insert(jobRequestsTable).values(body).returning();
  res.status(201).json(ListJobRequestsResponseItem.parse({ ...row, createdAt: row.createdAt.toISOString() }));
});

router.patch("/job-requests/:id/status", async (req, res) => {
  const { id } = UpdateJobRequestStatusParams.parse(req.params);
  const body = UpdateJobRequestStatusBody.parse(req.body);

  const [row] = await db
    .update(jobRequestsTable)
    .set({ status: body.status })
    .where(eq(jobRequestsTable.id, id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Job request not found" });
    return;
  }

  res.json(UpdateJobRequestStatusResponse.parse({ ...row, createdAt: row.createdAt.toISOString() }));
});

export default router;
