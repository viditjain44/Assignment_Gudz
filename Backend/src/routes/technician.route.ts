import { Router } from "express";
import {
  getTechnicians,
  getTechnicianById,
  createTechnician,
  updateTechnician,
} from "../controllers/technician.controller.js";

const router = Router();

/**
 * GET /api/technicians
 * Query Params: ?skill=plumber&rating=4&search=john
 */
router.get("/", getTechnicians);

/**
 * GET /api/technicians/:id
 */
router.get("/:id", getTechnicianById);

/**
 * POST /api/technicians
 */
router.post("/", createTechnician);

/**
 * PUT /api/technicians/:id
 */
router.put("/:id", updateTechnician);

export default router;
