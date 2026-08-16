const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
    status: {
      type: String,
      enum: ["todo", "in-progress", "review", "done"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    dueDate: { type: Date },
    order: { type: Number, default: 0 }, // for drag-and-drop position within a status column
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);