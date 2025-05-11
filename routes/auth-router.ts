import { NextFunction, Request, Response, Router } from "express";
import * as authController from "../controllers/auth-controller";
import { authenticatedUser } from "../middleware/auth-middleware";
import passport from "passport";
import { IUser } from "../models/user";
import { generateToken } from "../utils/generate-token";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/verify-email/:token", authController.verifyEmail);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);
router.get("/logout", authController.logout);

router.get("/verify-auth", authenticatedUser, authController.checkUserAuth);
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}`,
    session: false,
  }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user as IUser;
      const accessToken = generateToken(user);
      res.cookie("access_token", accessToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.redirect(`${process.env.FRONTEND_URL}`);
    } catch (e) {
      next(e);
    }
  },
);

export default router;
