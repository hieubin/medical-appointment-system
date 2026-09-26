import { Router } from "express";
import { listServices } from "../controllers/service.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { serviceQuerySchema } from "../schemas/service.schema.js";

export const serviceRouter = Router();

serviceRouter.get("/", validate({ query: serviceQuerySchema }), listServices);