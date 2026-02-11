import { Router } from "express";
import { getCurrentUser } from "../controllers/auth.controllers.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

// Get current authenticated user
router.get("/me", requireAuth, getCurrentUser);

export default router;
