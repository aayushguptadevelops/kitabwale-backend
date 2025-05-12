import { Router } from "express";
import * as addressController from "../controllers/address-controller";
import { authenticatedUser } from "../middleware/auth-middleware";

const router = Router();

router.post(
  "/create-or-update",
  authenticatedUser,
  addressController.createOrUpdateAddressByUserId,
);
router.get("/", authenticatedUser, addressController.getAddressByUserId);

export default router;
