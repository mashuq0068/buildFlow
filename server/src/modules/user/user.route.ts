import { Router } from "express";
import { userController } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { userValidation } from "./user.validation";
import { requireAuth } from "../../middlewares/requireAuth";

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.get("/", userController.listMembers);
router.post("/", validateRequest(userValidation.addMember), userController.addMember);
router.patch(
  "/:userId/role",
  validateRequest(userValidation.updateRole),
  userController.updateMemberRole
);

export const userRoutes = router;
