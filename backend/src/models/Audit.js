const mongoose = require("mongoose");

const auditSchema = new mongoose.Schema(
  {
    entityType: {
      type: String,
      required: true,
      enum: ["Task", "Project", "Workspace"],
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "entityType",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    action: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Audit", auditSchema);