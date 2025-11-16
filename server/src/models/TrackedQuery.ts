import mongoose from "mongoose";

const trackedQuerySchema = new mongoose.Schema({
  name: { type: String, required: true }, // brand/topic to track
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("TrackedQuery", trackedQuerySchema);
