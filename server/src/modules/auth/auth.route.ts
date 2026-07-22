import { Router } from "express";
import { authController } from "./auth.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { authValidation } from "./auth.validation";
import { requireAuth } from "../../middlewares/requireAuth";

const router = Router();

router.post("/register", validateRequest(authValidation.register), authController.register);
router.post("/login", validateRequest(authValidation.login), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", requireAuth, authController.me);
router.post(
  "/change-password",
  requireAuth,
  validateRequest(authValidation.changePassword),
  authController.changePassword
);

export const authRoutes = router;
