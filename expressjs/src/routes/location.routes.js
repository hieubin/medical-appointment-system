import { Router } from "express";
import { listLocations, getLocation } from "../controllers/location.controller.js";

export const locationRouter = Router();

locationRouter.get("/", listLocations);
locationRouter.get("/:id", getLocation);
