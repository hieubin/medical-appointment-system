import { Router } from "express";
import {
	getSpecialty,
	listSpecialties,
} from "../controllers/specialty.controller.js";

export const specialtyRouter = Router();

specialtyRouter.get("/", listSpecialties);
specialtyRouter.get("/:id", getSpecialty);