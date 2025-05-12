import { Request, Response } from "express";
import { response } from "../utils/response-handler";
import CartItems from "../models/cart-items";
import Order from "../models/order";

export const createOrUpdateOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.id;
    const {
      orderId,
      shippingAddress,
      paymentMethod,
      totalAmount,
      paymentDetails,
    } = req.body;

    const cart = await CartItems.findOne({ user: userId }).populate(
      "items.product",
    );
    if (!cart || cart.items.length === 0) {
      return response(res, 400, "Cart is empty.");
    }

    let order = await Order.findOne({ _id: orderId });
    if (order) {
      order.shippingAddress = shippingAddress || order.shippingAddress;
      order.paymentMethod = paymentMethod || order.paymentMethod;
      order.totalAmount = totalAmount || order.totalAmount;
      if (paymentDetails) {
        order.paymentDetails = paymentDetails;
        order.paymentStatus = "complete";
        order.status = "processing";
      }
    } else {
      order = new Order({
        user: userId,
        items: cart.items,
        totalAmount,
        shippingAddress,
        paymentMethod,
        paymentDetails,
        paymentStatus: paymentDetails ? "complete" : "pending",
      });
    }
    await order.save();

    if (paymentDetails) {
      await CartItems.findOneAndUpdate(
        { user: userId },
        { $set: { items: [] } },
      );
    }

    return response(res, 200, "Order created or updated successfully.", order);
  } catch (e) {
    console.error(e);
    return response(res, 500, "Internal Server Error, please try again.");
  }
};

export const getOrderByUser = async (req: Request, res: Response) => {
  try {
    const userId = req.id;
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .populate("shippingAddress")
      .populate({
        path: "items.product",
        model: "Product",
      });

    if (!orders) {
      return response(res, 404, "Orders not found.");
    }

    return response(res, 200, "Orders fetched by User successfully.", orders);
  } catch (e) {
    console.error(e);
    return response(res, 500, "Internal Server Error, please try again.");
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("shippingAddress")
      .populate({
        path: "items.product",
        model: "Product",
      });

    if (!order) {
      return response(res, 404, "Order not found.");
    }

    return response(res, 200, "Order fetched by Id successfully.", order);
  } catch (e) {
    console.error(e);
    return response(res, 500, "Internal Server Error, please try again.");
  }
};
