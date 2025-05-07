import mongoose from "mongoose";

const connectDb = async (): Promise<void> => {
  try {
    const connection = await mongoose.connect(
      process.env.MONGODB_URI as string,
    );
    console.log(`MongoDB connection success: ${connection.connection.host}`);
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
};

export default connectDb;
