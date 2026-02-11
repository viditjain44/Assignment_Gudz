import mongoose, { Schema, Document } from "mongoose";

export interface ITechnician extends Document {
  userId?: string;
  name: string;
  skill: string;
  rating: number;
  email: string;
  phone?: string;
  availability: Date[];
  bio?: string;
  hourlyRate?: number;
}

const TechnicianSchema = new Schema<ITechnician>(
  {
    userId: { type: String, index: true },
    name: { type: String, required: true },
    skill: { type: String, required: true },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    availability: [{ type: Date }],
    bio: { type: String },
    hourlyRate: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.model<ITechnician>("Technician", TechnicianSchema);
