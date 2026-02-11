import mongoose, { Schema, Document } from "mongoose";

export interface IBooking extends Document {
  userId: string;
  technician: mongoose.Types.ObjectId;
  slot: Date;
  status: "confirmed" | "cancelled" | "completed";
  notes?: string;
}

const BookingSchema = new Schema<IBooking>(
  {
    userId: { type: String, required: true },
    technician: { type: Schema.Types.ObjectId, ref: "Technician", required: true },
    slot: { type: Date, required: true },
    status: { type: String, enum: ["confirmed", "cancelled", "completed"], default: "confirmed" },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IBooking>("Booking", BookingSchema);
