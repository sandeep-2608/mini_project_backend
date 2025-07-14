import mongoose from "mongoose";

const schema = mongoose.Schema(
  {
    screenId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
    order: {
      type: Number,
      required: true,
    },
    questionType: {
      type: String,
      enum: ["single_choice", "multiple_choice", "text", "info"],
      default: "info",
    },
    options: [String],
    createdBy: { type: mongoose.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Screen", schema);
