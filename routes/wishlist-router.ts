import { Router } from "express";
import * as wishListController from "../controllers/wishlist-controller";
import { authenticatedUser } from "../middleware/auth-middleware";

const router = Router();

router.post("/add", authenticatedUser, wishListController.addToWishList);
router.delete(
  "/remove/:productId",
  authenticatedUser,
  wishListController.removeFromWishList,
);
router.get("/:userId", authenticatedUser, wishListController.getWishListByUser);

export default router;
