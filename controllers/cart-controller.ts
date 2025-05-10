import { Request, Response } from "express";
import Products from "../models/products";
import { response } from "../utils/response-handler";
import CartItems, { ICartItem } from "../models/cart-items";
import cartItems from "../models/cart-items";

export const addToCart = async (req: Request, res: Response) => {
  try {
    const userId = req.id;
    const { productId, quantity } = req.body;

    const product = await Products.findById(productId);
    if (!product) {
      return response(res, 404, "Product not found.");
    }

    if (product.seller.toString() === userId) {
      return response(res, 400, "You cannot add your product to the cart.");
    }

    let cart = await CartItems.findOne({ user: userId });
    if (!cart) {
      cart = new CartItems({ user: userId, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId,
    );
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      const newItem = {
        product: productId,
        quantity: quantity,
      };
      cart.items.push(newItem as ICartItem);
    }

    await cart.save();
    return response(res, 200, "Item added to cart successfully.", cart);
  } catch (e) {
    console.error(e);
    return response(res, 500, "Internal Server Error, please try again.");
  }
};

export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const userId = req.id;
    const { productId } = req.params;

    let cart = await CartItems.findOne({ user: userId });
    if (!cart) {
      return response(res, 404, "Cart not found for this user.");
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId,
    );

    await cart.save();
    return response(res, 200, "Item removed from cart successfully.");
  } catch (e) {
    console.error(e);
    return response(res, 500, "Internal Server Error, please try again.");
  }
};

export const getCartByUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    let cart = await CartItems.findOne({ user: userId });
    if (!cart) {
      return response(res, 404, "Cart is empty.", { items: [] });
    }

    await cart.save();
    return response(res, 200, "User cart get successfully.", cart);
  } catch (e) {
    console.error(e);
    return response(res, 500, "Internal Server Error, please try again.");
  }
};
