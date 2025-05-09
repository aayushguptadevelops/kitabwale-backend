import { NextFunction, Request, Response } from "express";
import { response } from "../utils/response-handler";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

const authenticatedUser = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.access_token;

  if (!token) {
    return response(res, 401, "User not authenticated, or no token available.");
  }

  try {
    const decode = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as jwt.JwtPayload;

    if (!decode) {
      return response(res, 401, "Not authorized, user not found.");
    }

    req.id = decode.userId;
    next();
  } catch (e) {
    return response(res, 401, "Not authorized, token not valid or expired.");
  }
};

export { authenticatedUser };
