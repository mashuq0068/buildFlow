import { Router } from "express";
import { labelController } from "./label.controller";
import { requireAuth } from "../../middlewares/requireAuth";

const router = Router();

router.use(requireAuth);
router.get("/", labelController.getAll);

export const labelRoutes = router;
