import { Router } from "express";
import technicianRoutes from "./technician.route.js";
import bookingRoutes from "./booking.route.js";
import userRoutes from "./user.route.js";

const router = Router();

// Note: /api/auth is handled by Better Auth in app.ts
router.use("/technicians", technicianRoutes);
router.use("/bookings", bookingRoutes);
router.use("/users", userRoutes);

export default router;
