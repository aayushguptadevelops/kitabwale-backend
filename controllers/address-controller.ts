import { Request, Response } from "express";
import { response } from "../utils/response-handler";
import Address from "../models/address";
import User from "../models/user";

export const createOrUpdateAddressByUserId = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.id;
    const {
      addressId,
      phoneNumber,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
    } = req.body;

    if (!userId) {
      return response(
        res,
        400,
        "User not found, please provide a valid user id.",
      );
    }

    if (!addressLine1 || !phoneNumber || !city || !state || !pincode) {
      return response(
        res,
        400,
        "Please provide all the required fields to create a new address.",
      );
    }

    if (addressId) {
      const existingAddress = await Address.findById(addressId);
      if (!existingAddress) {
        return response(res, 400, "Address not found.");
      }
      existingAddress.addressLine1 = addressLine1;
      existingAddress.addressLine2 = addressLine2;
      existingAddress.phoneNumber = phoneNumber;
      existingAddress.city = city;
      existingAddress.state = state;
      existingAddress.pincode = pincode;

      await existingAddress.save();
      return response(
        res,
        200,
        "Address updated successfully.",
        existingAddress,
      );
    } else {
      const newAddress = new Address({
        user: userId,
        phoneNumber,
        addressLine1,
        addressLine2,
        city,
        state,
        pincode,
      });

      await newAddress.save();
      await User.findByIdAndUpdate(
        userId,
        {
          $push: { addresses: newAddress._id },
        },
        { new: true },
      );

      return response(
        res,
        200,
        "User Address created successfully.",
        newAddress,
      );
    }
  } catch (e) {
    console.error(e);
    return response(res, 500, "Internal Server Error, please try again.");
  }
};

export const getAddressByUserId = async (req: Request, res: Response) => {
  try {
    const userId = req.id;
    if (!userId) {
      return response(
        res,
        400,
        "User not found, please provide a valid user id.",
      );
    }

    const address = await User.findById(userId).populate("addresses");

    if (!address) {
      return response(res, 404, "User Address not found.");
    }

    return response(res, 200, "User Address get successfully.", address);
  } catch (e) {
    console.error(e);
    return response(res, 500, "Internal Server Error, please try again.");
  }
};
