import { Router } from "express";
import { health } from "../controllers/health.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { healthQuerySchema } from "../schemas/health.schema.js";

export const healthRouter = Router();

healthRouter.get("/", validate({ query: healthQuerySchema }), health);
