import { Router } from "express";
import { forgotPassword, login, register, logout, me } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { forgotPasswordSchema, loginBodySchema, registerBodySchema } from "../schemas/auth.schema.js";
import { forgotLimiter, loginLimiter, registerLimiter } from "../security/rate-limit.js";

export const authRouter = Router();

authRouter.post("/login", loginLimiter, validate({ body: loginBodySchema }), login);
authRouter.post("/register", registerLimiter, validate({ body: registerBodySchema }), register);
authRouter.post("/forgot-password", forgotLimiter, validate({ body: forgotPasswordSchema }), forgotPassword);
authRouter.post("/logout", authenticate, logout);
authRouter.get("/me", authenticate, me);