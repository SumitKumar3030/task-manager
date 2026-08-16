const mongoose = require("mongoose");

const inviteSchema = new mongoose.Schema(
  {
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: String, required: true, unique: true },
    status: { type: String, enum: ["pending", "accepted", "expired"], default: "pending" },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invite", inviteSchema);