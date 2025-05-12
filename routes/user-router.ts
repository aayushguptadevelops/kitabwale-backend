import { Router } from "express";
import { authenticatedUser } from "../middleware/auth-middleware";
import * as userController from "../controllers/user-controller";

const router = Router();

router.put(
  "/profile/update/:userId",
  authenticatedUser,
  userController.updateUserProfile,
);

export default router;
