import mongoose from "mongoose";

const templateSchema = new mongoose.Schema(
  {
    name: String,
    subject: String,
    htmlBody: String,
    editorJson: Object,
    fromEmailUsername: String,
    isComponent: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Template", templateSchema);
