import mongoose, { Document, Schema } from "mongoose";
import { IAddress } from "./address";

export interface IOrderItem extends Document {
  product: mongoose.Types.ObjectId;
  quantity: number;
}

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  shippingAddress: mongoose.Types.ObjectId | IAddress;
  paymentStatus: "pending" | "complete" | "failed";
  paymentMethod: string;
  paymentDetails: {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  };
  status: "processing" | "shipped" | "delivered" | "canceled";
}

const orderItemsSchema = new Schema<IOrderItem>({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
});

const orderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemsSchema],
    totalAmount: { type: Number },
    shippingAddress: { type: Schema.Types.ObjectId, ref: "Address" },
    paymentStatus: {
      type: String,
      enum: ["pending", "complete", "failed"],
      default: "pending",
    },
    paymentMethod: { type: String },
    paymentDetails: {
      razorpay_order_id: { type: String },
      razorpay_payment_id: { type: String },
      razorpay_signature: { type: String },
    },
    status: {
      type: String,
      enum: ["processing", "shipped", "delivered", "canceled"],
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model<IOrder>("Order", orderSchema);
