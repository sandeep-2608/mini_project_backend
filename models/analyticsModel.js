import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  screenId: {
    type: String,
    required: true,
  },
  // Simple metrics
  totalViews: {
    type: Number,
    default: 0,
  },
  completions: {
    type: Number,
    default: 0,
  },
  dropOffs: {
    type: Number,
    default: 0,
  },
});

// Simple compound index
analyticsSchema.index({ date: 1, screenId: 1 }, { unique: true });

export default mongoose.model("Analytics", analyticsSchema);
