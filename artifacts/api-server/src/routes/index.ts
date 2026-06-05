import { Router, type IRouter } from "express";
import healthRouter from "./health";
import workersRouter from "./workers";
import reviewsRouter from "./reviews";
import categoriesRouter from "./categories";
import statsRouter from "./stats";
import jobRequestsRouter from "./jobRequests";
import stripeRouter from "./stripe";

const router: IRouter = Router();

router.use(healthRouter);
router.use(workersRouter);
router.use(reviewsRouter);
router.use(categoriesRouter);
router.use(statsRouter);
router.use(jobRequestsRouter);
router.use(stripeRouter);

export default router;
