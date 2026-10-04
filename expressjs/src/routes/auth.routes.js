import { Router } from "express";
import { login, register, logout, me } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { loginBodySchema, registerBodySchema } from "../schemas/auth.schema.js";

export const authRouter = Router();

authRouter.post("/login", validate({ body: loginBodySchema }), login);
authRouter.post("/register", validate({ body: registerBodySchema }), register);
authRouter.post("/logout", authenticate, logout);
authRouter.get("/me", authenticate, me);