import express from "express";
import { getDropOffStatsController } from "../controllers/analyticsController.js";
import { authenticateToken } from "../config/helper.js";

const router = express.Router();

// All onboarding routes require authentication

router.get("/dropoff", authenticateToken, getDropOffStatsController);

export default router;
