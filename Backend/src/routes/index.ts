import { Router } from "express";
import authRoutes from "./auth.route.js";
import technicianRoutes from "./technician.route.js";
import bookingRoutes from "./booking.route.js";
import userRoutes from "./user.route.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/technicians", technicianRoutes);
router.use("/bookings", bookingRoutes);
router.use("/users", userRoutes);

export default router;
