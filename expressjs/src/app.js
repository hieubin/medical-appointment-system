import cors from "cors";
import express from "express";
import { errorHandler, notFound } from "./middleware/error.middleware.js";
import { router } from "./routes/index.js";

export const app = express();

app.use(cors({ origin: true }));
app.use(express.json());
app.use("/api", router);
app.use(notFound);
app.use(errorHandler);
