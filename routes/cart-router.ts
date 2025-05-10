import { Router } from "express";
import * as cartController from "../controllers/cart-controller";
import { authenticatedUser } from "../middleware/auth-middleware";
import { multerMiddleware } from "../config/cloudinary-config";

const router = Router();

router.post(
  "/add",
  authenticatedUser,
  multerMiddleware,
  cartController.addToCart,
);
router.delete(
  "/remove/:productId",
  authenticatedUser,
  cartController.removeFromCart,
);
router.get("/:userId", authenticatedUser, cartController.getCartByUser);

export default router;
