import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import connectDb from "./config/db-connect";
import authRoutes from "./routes/auth-router";

dotenv.config();

const PORT = process.env.PORT || 8080;

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

connectDb();

// Api Endpoint
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}...`);
});
