import mongoose, { Document, Schema } from "mongoose";

export interface IWishList extends Document {
  user: mongoose.Types.ObjectId;
  products: mongoose.Types.ObjectId[];
}

const wishListSchema = new Schema<IWishList>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true },
);

export default mongoose.model<IWishList>("WishList", wishListSchema);
