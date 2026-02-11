import { Router } from "express";
import {
  createBooking,
  cancelBooking,
  getUserBookings,
  getUpcomingBookings,
  rescheduleBooking,
} from "../controllers/booking.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

// Get user's bookings
router.get("/user", requireAuth, getUserBookings);

// Get upcoming bookings
router.get("/upcoming", requireAuth, getUpcomingBookings);

// Create a new booking
router.post("/", requireAuth, createBooking);

// Cancel a booking
router.delete("/:id", requireAuth, cancelBooking);

// Reschedule a booking
router.put("/:id/reschedule", requireAuth, rescheduleBooking);

export default router;
