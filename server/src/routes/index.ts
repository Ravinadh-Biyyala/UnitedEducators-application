import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import companionRouter from "./companion.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(companionRouter);

export default router;
