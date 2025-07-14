import express from "express";
import {
  recordResponseController,
  startSessionController,
  getNextScreenController,
} from "../controllers/onBoardingController.js";
import { authenticateToken } from "../config/helper.js";

const router = express.Router();

// All onboarding routes require authentication

router.post("/start", authenticateToken, startSessionController);
router.post("/respond", authenticateToken, recordResponseController);
router.get("/:sessionId/next", authenticateToken, getNextScreenController);

export default router;
