import { Request, Response } from "express";
import User from "../models/user";
import { response } from "../utils/response-handler";
import crypto from "crypto";
import { sendVerificationEmail } from "../config/email-config";
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
    const token = req.params;
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
