import { Request, Response } from "express";
import { response } from "../utils/response-handler";
import Products from "../models/products";
import WishList from "../models/wishlist";

export const addToWishList = async (req: Request, res: Response) => {
  try {
    const userId = req.id;
    const { productId } = req.body;

    const product = await Products.findById(productId);
    if (!product) {
      return response(res, 404, "Product not found.");
    }

    let wishList = await WishList.findOne({ user: userId });
    if (!wishList) {
      wishList = new WishList({ user: userId, products: [] });
    }

    if (!wishList.products.includes(productId)) {
      wishList.products.push(productId);
      await wishList.save();
    }
    return response(
      res,
      200,
      "Product added to WishList successfully.",
      wishList,
    );
  } catch (e) {
    console.error(e);
    return response(res, 500, "Internal Server Error, please try again.");
  }
};

export const removeFromWishList = async (req: Request, res: Response) => {
  try {
    const userId = req.id;
    const { productId } = req.params;

    let wishList = await WishList.findOne({ user: userId });
    if (!wishList) {
      return response(res, 404, "WishList not found for this user.");
    }

    wishList.products = wishList.products.filter(
      (id) => id.toString() !== productId,
    );
    await wishList.save();
    return response(res, 200, "Product removed from WishList successfully.");
  } catch (e) {
    console.error(e);
    return response(res, 500, "Internal Server Error, please try again.");
  }
};

export const getWishListByUser = async (req: Request, res: Response) => {
  try {
    const userId = req?.id;
    let wishList = await WishList.findOne({ user: userId }).populate(
      "products",
    );
    if (!wishList) {
      return response(res, 404, "WishList is empty.", { products: [] });
    }
    await wishList.save();
    return response(res, 200, "User WishList get successfully.", wishList);
  } catch (e) {
    console.error(e);
    return response(res, 500, "Internal Server Error, please try again.");
  }
};
