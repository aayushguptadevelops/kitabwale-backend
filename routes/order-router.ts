import { Router } from "express";
import { authenticatedUser } from "../middleware/auth-middleware";
import * as orderController from "../controllers/order-controller";

const router = Router();

router.post("/", authenticatedUser, orderController.createOrUpdateOrder);
router.get("/", authenticatedUser, orderController.getOrderByUser);
router.get("/:id", authenticatedUser, orderController.getOrderById);
router.post(
  "/payment-razorpay",
  authenticatedUser,
  orderController.createPaymentWithRazorpay,
);
router.post(
  "/razorpay-webhook",
  authenticatedUser,
  orderController.handleRazorpayWebhook,
);

export default router;
