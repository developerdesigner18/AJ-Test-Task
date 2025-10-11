import "reflect-metadata";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { container } from "./inversify.config";
import { TYPES } from "./types";
import { IVerificationController } from "./controllers/Verification.controller";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;
const MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://localhost:27017/kube-credential";

app.use(cors());
app.use(express.json());

// Get controller from container
const verificationController = container.get<IVerificationController>(
    TYPES.VerificationController
);

// Routes
app.get(
    "/credentials/verify/:id",
    verificationController.verifyCredential.bind(verificationController)
);
app.get(
    "/health",
    verificationController.healthCheck.bind(verificationController)
);

// Connect to MongoDB and start server
mongoose
    .connect(MONGODB_URI)
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(PORT, () => {
            console.log(`Verification Service running on port ${PORT}`);
            console.log(
                `Worker: ${process.env.HOSTNAME || require("os").hostname()}`
            );
        });
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    });
