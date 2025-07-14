import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "abandoned"],
      default: "active",
    },
    currentScreen: String,
    viewedScreens: [
      {
        screenId: String,
        viewedAt: { type: Date, default: Date.now },
      },
    ],
    // Simple responses as key-value pairs
    responses: {
      type: Map,
      of: String,
      default: new Map(),
    },
  },
  { timestamps: true }
);

export default mongoose.model("Session", sessionSchema);
