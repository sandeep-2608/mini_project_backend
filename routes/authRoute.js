import express from "express";
import {
  registerController,
  loginController,
  testController,
} from "../controllers/authController.js";
import { authenticateToken } from "../config/helper.js";

// router object
const router = express.Router();

// routing
//REGISTER || METHOD POST
router.post("/register", registerController);

// LOGIN || METHOD POST
router.post("/login", loginController);

router.get("/test", authenticateToken, testController);

export default router;
