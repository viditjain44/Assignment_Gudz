import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { auth } from "../lib/auth.js";
import Technician from "../models/Technician.js";

/**
 * Get current logged-in user from session
 */
export const getCurrentUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    res.status(200).json({
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      emailVerified: req.user.emailVerified,
      createdAt: req.user.createdAt,
      updatedAt: req.user.updatedAt,
    });
  } catch (error) {
    console.error("Error getting current user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Register a new technician
 * Creates both a user account (via BetterAuth) and a technician profile
 */
export const registerTechnician = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password, phone, skill, bio, hourlyRate } = req.body;

    // Validate required fields
    if (!name || !email || !password || !skill) {
      res.status(400).json({ message: "Name, email, password, and skill are required" });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ message: "Password must be at least 8 characters" });
      return;
    }

    // Check if technician email already exists
    const existingTechnician = await Technician.findOne({ email: email.toLowerCase() });
    if (existingTechnician) {
      res.status(400).json({ message: "A technician with this email already exists" });
      return;
    }

    // Create user account via BetterAuth API
    if (!auth) {
      res.status(500).json({ message: "Auth service not configured" });
      return;
    }
    const signUpResult = await auth.api.signUpEmail({
      body: {
        email: email.toLowerCase(),
        password,
        name,
        role: "technician",
      },
    });

    if (!signUpResult || !signUpResult.user) {
      res.status(400).json({ message: "Failed to create user account" });
      return;
    }

    // Create technician profile linked to user
    const technician = await Technician.create({
      userId: signUpResult.user.id,
      name,
      email: email.toLowerCase(),
      phone,
      skill,
      bio,
      hourlyRate,
      rating: 5,
      availability: [],
    });

    res.status(201).json({
      message: "Technician registered successfully",
      technician,
      user: {
        id: signUpResult.user.id,
        email: signUpResult.user.email,
        name: signUpResult.user.name,
      },
    });
  } catch (error: any) {
    console.error("Error registering technician:", error);
    
    // Handle BetterAuth errors
    if (error.message?.includes("User already exists") || error.body?.message?.includes("User already exists")) {
      res.status(400).json({ message: "An account with this email already exists" });
      return;
    }
    
    res.status(500).json({ message: "Failed to register technician" });
  }
};
