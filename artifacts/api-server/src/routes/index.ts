import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import eventsRouter from "./events";
import progressRouter from "./progress";
import aiRouter from "./ai";
import dashboardRouter from "./dashboard";
import usersRouter from "./users";
import departmentsRouter from "./departments";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(eventsRouter);
router.use(progressRouter);
router.use(aiRouter);
router.use(dashboardRouter);
router.use(usersRouter);
router.use(departmentsRouter);

export default router;
