import { Response } from "express";
import Booking from "../models/Booking.js";
import Technician from "../models/Technician.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { sendBookingEmail, sendBookingConfirmationToUser } from "../utils/sendEmail.js";

export const createBooking = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { technicianId, slot, notes } = req.body;

    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Check if slot is already booked
    const existing = await Booking.findOne({
      technician: technicianId,
      slot: new Date(slot),
      status: "confirmed",
    });

    if (existing) {
      res.status(400).json({ message: "This time slot is already booked" });
      return;
    }

    // Get technician details
    const technician = await Technician.findById(technicianId);
    if (!technician) {
      res.status(404).json({ message: "Technician not found" });
      return;
    }

    const booking = await Booking.create({
      userId: req.user.id,
      technician: technicianId,
      slot: new Date(slot),
      notes,
    });

    // Send email notification to technician
    await sendBookingEmail(technicianId, new Date(slot), req.user.name);
    
    // Send confirmation to user
    await sendBookingConfirmationToUser(
      req.user.email,
      technician.name,
      new Date(slot)
    );

    const populatedBooking = await Booking.findById(booking._id).populate("technician");
    res.status(201).json(populatedBooking);
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Failed to create booking" });
  }
};

export const getUserBookings = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { status } = req.query;
    const filter: any = { userId: req.user.id };
    
    if (status && status !== "all") {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate("technician")
      .sort({ slot: -1 });

    res.json(bookings);
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

export const getUpcomingBookings = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const bookings = await Booking.find({
      userId: req.user.id,
      status: "confirmed",
      slot: { $gte: new Date() },
    })
      .populate("technician")
      .sort({ slot: 1 })
      .limit(5);

    res.json(bookings);
  } catch (error) {
    console.error("Error fetching upcoming bookings:", error);
    res.status(500).json({ message: "Failed to fetch upcoming bookings" });
  }
};

export const cancelBooking = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    if (booking.status === "cancelled") {
      res.status(400).json({ message: "Booking is already cancelled" });
      return;
    }

    booking.status = "cancelled";
    await booking.save();

    const updatedBooking = await Booking.findById(booking._id).populate("technician");
    res.json(updatedBooking);
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ message: "Failed to cancel booking" });
  }
};

export const rescheduleBooking = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { newSlot } = req.body;

    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    if (booking.status !== "confirmed") {
      res.status(400).json({ message: "Can only reschedule confirmed bookings" });
      return;
    }

    // Check if new slot is available
    const existing = await Booking.findOne({
      technician: booking.technician,
      slot: new Date(newSlot),
      status: "confirmed",
      _id: { $ne: booking._id },
    });

    if (existing) {
      res.status(400).json({ message: "This time slot is already booked" });
      return;
    }

    booking.slot = new Date(newSlot);
    await booking.save();

    const updatedBooking = await Booking.findById(booking._id).populate("technician");
    res.json(updatedBooking);
  } catch (error) {
    console.error("Error rescheduling booking:", error);
    res.status(500).json({ message: "Failed to reschedule booking" });
  }
};
