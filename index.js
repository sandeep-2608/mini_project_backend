import "dotenv/config";
import express from "express";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoute.js";
import screenRoutes from "./routes/screenRoute.js";
import sessionRoutes from "./routes/sessionRoute.js";
import analyticsRoutes from "./routes/analyticsRoute.js";
import cors from "cors";

// Import and start the background job
import "./jobs/markAbandonedSessions.js";

// rest object
const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// database config
connectDB();

// routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/screen", screenRoutes);
app.use("/api/v1/session", sessionRoutes);
app.use("/api/v1/analytics", analyticsRoutes);

app.get("/", (req, res) => {
  res.send("Hello from backend");
});

// PORT
const PORT = process.env.PORT || 5000;

// listen
app.listen(PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
