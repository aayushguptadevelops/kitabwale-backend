import { Router } from "express";
import { authenticatedUser } from "../middleware/auth-middleware";
import { multerMiddleware } from "../config/cloudinary-config";
import * as productController from "../controllers/product-controller";

const router = Router();

router.post(
  "/",
  authenticatedUser,
  multerMiddleware,
  productController.createProduct,
);
router.get("/", authenticatedUser, productController.getAllProducts);
router.get("/:id", authenticatedUser, productController.getProductById);
router.delete(
  "/seller/:productId",
  authenticatedUser,
  productController.deleteProduct,
);
router.get(
  "/seller/:sellerId",
  authenticatedUser,
  productController.getProductBySellerId,
);

export default router;
