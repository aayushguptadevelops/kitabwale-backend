import { Router } from "express";
import * as cartController from "../controllers/cart-controller";
import { authenticatedUser } from "../middleware/auth-middleware";

const router = Router();

router.post("/add", authenticatedUser, cartController.addToCart);
router.delete(
  "/remove/:productId",
  authenticatedUser,
  cartController.removeFromCart,
);
router.get("/:userId", authenticatedUser, cartController.getCartByUser);

export default router;
