import { Router } from "express";
import { uploadController } from "./upload.controller";
import { upload } from "./upload.service";
import { requireAuth } from "../../middlewares/requireAuth";

const router = Router();

router.use(requireAuth);
router.post("/", upload.single("file"), uploadController.create);

export const uploadRoutes = router;
