import express from "express";
import {
  createScreenController,
  getScreensController,
  updateScreenController,
  deleteScreenController,
} from "../controllers/screenController.js";
import { authenticateToken } from "../config/helper.js";

const router = express.Router();

router.post("/", authenticateToken, createScreenController);
router.get("/all", authenticateToken, getScreensController);
router.put("/:screenId", authenticateToken, updateScreenController);
router.delete("/:screenId", authenticateToken, deleteScreenController);

export default router;
