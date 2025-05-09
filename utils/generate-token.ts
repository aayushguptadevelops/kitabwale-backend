import jwt from "jsonwebtoken";
import { IUser } from "../models/user";

export const generateToken = (user: IUser): string => {
  return jwt.sign({ userId: user?._id }, process.env.JWT_SECRET as string, {
    expiresIn: "1d",
  });
};
