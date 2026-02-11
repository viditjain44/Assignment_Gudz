import { Request, Response } from "express";
import Technician from "../models/Technician.js";

export const getTechnicians = async (req: Request, res: Response): Promise<void> => {
  try {
    const { skill, rating, search } = req.query;

    const filter: any = {};

    if (skill && skill !== "all") {
      filter.skill = { $regex: skill, $options: "i" };
    }
    if (rating) {
      filter.rating = { $gte: Number(rating) };
    }
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const technicians = await Technician.find(filter).sort({ rating: -1 });
    res.json(technicians);
  } catch (error) {
    console.error("Error fetching technicians:", error);
    res.status(500).json({ message: "Failed to fetch technicians" });
  }
};

export const getTechnicianById = async (req: Request, res: Response): Promise<void> => {
  try {
    const technician = await Technician.findById(req.params.id);
    
    if (!technician) {
      res.status(404).json({ message: "Technician not found" });
      return;
    }
    
    res.json(technician);
  } catch (error) {
    console.error("Error fetching technician:", error);
    res.status(500).json({ message: "Failed to fetch technician" });
  }
};

export const createTechnician = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, skill, email, phone, rating, availability, bio, hourlyRate } = req.body;

    // Validate required fields
    if (!name || !skill || !email) {
      res.status(400).json({ message: "Name, skill, and email are required" });
      return;
    }

    // Check for duplicate email
    const existingTechnician = await Technician.findOne({ email: email.toLowerCase() });
    if (existingTechnician) {
      res.status(400).json({ message: "A technician with this email already exists" });
      return;
    }

    const technician = await Technician.create({
      name,
      skill,
      email: email.toLowerCase(),
      phone,
      rating: rating || 5,
      availability: availability || [],
      bio,
      hourlyRate,
    });

    res.status(201).json(technician);
  } catch (error) {
    console.error("Error creating technician:", error);
    res.status(500).json({ message: "Failed to create technician" });
  }
};

export const updateTechnician = async (req: Request, res: Response): Promise<void> => {
  try {
    const technician = await Technician.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!technician) {
      res.status(404).json({ message: "Technician not found" });
      return;
    }
    
    res.json(technician);
  } catch (error) {
    console.error("Error updating technician:", error);
    res.status(500).json({ message: "Failed to update technician" });
  }
};
