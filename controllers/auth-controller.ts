import { Request, Response } from "express";
import User from "../models/user";
import { response } from "../utils/response-handler";
import crypto from "crypto";
import {
  sendResetPasswordLinkToEmail,
  sendVerificationEmail,
} from "../config/email-config";
import { generateToken } from "../utils/generate-token";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, agreeTerms } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return response(res, 400, "User already exists.");
    }

    const verificationToken = crypto.randomBytes(20).toString("hex");
    const user = new User({
      name,
      email,
      password,
      agreeTerms,
      verificationToken,
    });
    await user.save();

    const result = await sendVerificationEmail(user.email, verificationToken);

    return response(
      res,
      200,
      "User registration successful, Please check your email to verify your account.",
    );
  } catch (e) {
    console.error(e);
    return response(res, 500, "Internal Server Error, please try again.");
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return response(res, 400, "Invalid or expired verification token.");
    }

    user.isVerified = true;
    user.verificationToken = undefined;

    const accessToken = generateToken(user);
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    await user.save();

    return response(
      res,
      200,
      "Email verified successfully. You can now use our services.",
    );
  } catch (e) {
    console.error(e);
    return response(res, 500, "Internal Server Error, please try again.");
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return response(res, 400, "Invalid email or password.");
    }

    if (!user.isVerified) {
      return response(
        res,
        400,
        "Please verify your email before logging in. Check your inbox for a verification link to complete the process.",
      );
    }

    const accessToken = generateToken(user);
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    return response(res, 200, "User logged in successfully.", {
      user: { name: user.name, email: user.email },
    });
  } catch (e) {
    console.error(e);
    return response(res, 500, "Internal Server Error, please try again.");
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return response(res, 400, "No account found with this email address.");
    }

    const resetPasswordToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);
    await user.save();

    await sendResetPasswordLinkToEmail(user.email, resetPasswordToken);

    return response(
      res,
      200,
      "A password reset link has been sent to your email address.",
    );
  } catch (e) {
    console.error(e);
    return response(res, 500, "Internal Server Error, please try again.");
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return response(res, 400, "Invalid or expired reset password token.");
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return response(
      res,
      200,
      "Your password has been reset successfully. You can now login with your new password",
    );
  } catch (e) {
    console.error(e);
    return response(res, 500, "Internal Server Error, please try again.");
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("access_token", {
      httpOnly: true,
    });

    return response(res, 200, "You have logged out.");
  } catch (e) {
    console.error(e);
    return response(res, 500, "Internal Server Error, please try again.");
  }
};

export const checkUserAuth = async (req: Request, res: Response) => {
  try {
    const userId = req?.id;
    if (!userId) {
      return response(
        res,
        400,
        "Unauthenticated, please login to access our data.",
      );
    }

    const user = await User.findById(userId).select(
      "-password -verificationToken -resetPasswordToken -resetPasswordExpires",
    );

    if (!user) {
      return response(res, 403, "User not found.");
    }

    return response(res, 201, "User retrieved successfully.", user);
  } catch (e) {
    console.error(e);
    return response(res, 500, "Internal Server Error, please try again.");
  }
};
