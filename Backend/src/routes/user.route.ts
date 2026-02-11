import { Router } from "express";
import { updateProfile, getProfile } from "../controllers/user.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

// Get user profile
router.get("/profile", requireAuth, getProfile);

// Update user profile
router.put("/profile", requireAuth, updateProfile);

export default router;
