import { Router } from "express";
import { appointmentRouter } from "./appointment.routes.js";
import { adminRouter } from "./admin.routes.js";
import { authRouter } from "./auth.routes.js";
import { doctorRouter } from "./doctor.routes.js";
import { healthRouter } from "./health.routes.js";
import { medicalRecordRouter } from "./medicalRecord.routes.js";
import { authenticate, requireRoles } from "../middleware/auth.middleware.js";
import { serviceRouter } from "./service.routes.js";
import { specialtyRouter } from "./specialty.routes.js";

export const router = Router();

router.use("/health", healthRouter);
router.use("/auth", authRouter);
router.use("/specialties", specialtyRouter);
router.use("/doctors", doctorRouter);
router.use("/services", serviceRouter);
router.use("/appointments", appointmentRouter);
router.use("/medical-records", medicalRecordRouter);
router.use("/admin", authenticate, requireRoles("ADMIN"), adminRouter);
