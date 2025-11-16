import mongoose from "mongoose";

const mentionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  source: { type: String, required: true },
  sentiment: {
    type: String,
    enum: ["positive", "neutral", "negative"],
    default: "neutral",
  },
  topic: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("Mention", mentionSchema);
