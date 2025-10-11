import "reflect-metadata";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { container } from "./inversify.config";
import { TYPES } from "./types";
import { IIssuanceController } from "./controllers/Issuance.controller";
import morgan from "morgan";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://localhost:27017/kube-credential";

app.use(cors());
app.use(express.json());
app.use(morgan("common"));

// Get controller from container
const issuanceController = container.get<IIssuanceController>(
    TYPES.IssuanceController
);

// Routes
app.post(
    "/credentials/issue",
    issuanceController.issueCredential.bind(issuanceController)
);
app.get("/health", issuanceController.healthCheck.bind(issuanceController));

// Connect to MongoDB and start server
mongoose
    .connect(MONGODB_URI)
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(PORT, () => {
            console.log(`Issuance Service running on port ${PORT}`);
            console.log(
                `Worker: ${process.env.HOSTNAME || require("os").hostname()}`
            );
        });
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    });
