import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoute from "./routes/auth.routes.js";
import userRoute from "./routes/user.routes.js";
import rideRoute from "./routes/ride.routes.js";

const app = express();
dotenv.config();

const PORT = process.env.PORT || 8080;

// Hardcode the MongoDB connection string here
const mongoURL = "mongodb+srv://pasamyagnesh:0ifXpp0M7hJuwr1n@cluster0.1xql9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const connectDB = async () => {
  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(mongoURL); // Use the hardcoded mongoURL
    console.log("Database connected");
  } catch (error) {
    console.log("Database connection failed:", error);
    process.exit(1); // Exit if connection fails
  }
};

// Middlewares
app.use(cors({
  origin: process.env.ORIGIN,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/rides", rideRoute);

// Error handler
app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong";
  return res.status(errorStatus).json({
    success: false,
    status: errorStatus,
    error: errorMessage,
  });
});

app.listen(PORT, () => {
  connectDB(); // Call connectDB without parameters
  console.log(`Connected to backend on PORT: ${PORT}`);
});