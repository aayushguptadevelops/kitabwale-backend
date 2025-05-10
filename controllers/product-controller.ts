import { Request, Response } from "express";
import { response } from "../utils/response-handler";
import { uploadToCloudinary } from "../config/cloudinary-config";
import Products from "../models/products";

export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      title,
      subject,
      category,
      condition,
      classType,
      price,
      author,
      edition,
      description,
      finalPrice,
      shippingCharge,
      paymentMode,
      paymentDetails,
    } = req.body;

    const sellerId = req.id;

    const images = req.files as Express.Multer.File[];
    if (!images || images.length === 0) {
      return response(res, 400, "Image is required.");
    }

    let parsedPaymentDetails = JSON.parse(paymentDetails);
    if (
      paymentMode === "UPI" &&
      (!parsedPaymentDetails || !parsedPaymentDetails.upiId)
    ) {
      return response(res, 400, "UPI ID is required for payment.");
    }

    if (
      paymentMode === "Bank Account" &&
      (!parsedPaymentDetails ||
        !parsedPaymentDetails.bankDetails ||
        !parsedPaymentDetails.bankDetails.accountNumber ||
        !parsedPaymentDetails.bankDetails.ifscCode ||
        !parsedPaymentDetails.bankDetails.bankName)
    ) {
      return response(
        res,
        400,
        "Bank Account details are required for payment.",
      );
    }

    const uploadPromise = images.map((file) => uploadToCloudinary(file as any));
    const uploadImages = await Promise.all(uploadPromise);
    const imageUrl = uploadImages.map((image) => image.secure_url);

    const product = new Products({
      title,
      description,
      subject,
      category,
      condition,
      classType,
      price,
      finalPrice,
      shippingCharge,
      paymentMode,
      paymentDetails: parsedPaymentDetails,
      author,
      edition,
      seller: sellerId,
      images: imageUrl,
    });

    await product.save();

    return response(res, 200, "Product created successfully.", product);
  } catch (e) {
    console.error(e);
    return response(res, 500, "Internal Server Error, please try again.");
  }
};

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await Products.find()
      .sort({ createdAt: -1 })
      .populate("seller", "name email");

    return response(res, 200, "Products fetched successfully.", products);
  } catch (e) {
    console.error(e);
    return response(res, 500, "Internal Server Error, please try again.");
  }
};
