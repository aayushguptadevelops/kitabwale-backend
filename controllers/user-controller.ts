import { Request, Response } from "express";
import { response } from "../utils/response-handler";
import User from "../models/user";

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return response(res, 400, "User Id is required.");
    }

    const { name, email, phoneNumber } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        email,
        phoneNumber,
      },
      { new: true, runValidators: true },
    ).select(
      "-password -verificationToken -resetPasswordToken -resetPasswordExpires",
    );

    if (!updatedUser) {
      return response(res, 400, "User not found.");
    }

    return response(
      res,
      200,
      "User Profile updated successfully.",
      updatedUser,
    );
  } catch (e) {
    console.error(e);
    return response(res, 500, "Internal Server Error, please try again.");
  }
};
