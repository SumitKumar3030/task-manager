const Task = require("../models/Task");
const Project = require("../models/Project");
const Workspace = require("../models/Workspace");
const Audit = require("../models/Audit");

const assertMember = async (workspaceId, userId) => {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) return { error: "Workspace not found", status: 404 };
  const isMember = workspace.members.some((m) => m.user.equals(userId));
  if (!isMember) return { error: "Not a member of this workspace", status: 403 };
  return { workspace };
};

const logAction = async (entityId, userId, action, req) => {
  await Audit.create({
    entityType: "Task",
    entityId,
    userId,
    action,
    ipAddress: req.ip,
  });
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, projectId, priority, assignee, dueDate } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const check = await assertMember(project.workspace, req.user._id);
    if (check.error) return res.status(check.status).json({ message: check.error });

    const task = await Task.create({
      title,
      description,
      project: projectId,
      workspace: project.workspace,
      priority,
      assignee: assignee || null,
      dueDate,
      createdBy: req.user._id,
    });

    await logAction(task._id, req.user._id, "created task", req);

    const populatedTask = await Task.findById(task._id)
      .populate("assignee", "name email")
      .populate("createdBy", "name email");

    req.app.get("io").to(projectId).emit("task-created", populatedTask);

    res.status(201).json({ success: true, task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTasksByProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const check = await assertMember(project.workspace, req.user._id);
    if (check.error) return res.status(check.status).json({ message: check.error });

    const tasks = await Task.find({ project: req.params.projectId })
      .populate("assignee", "name email")
      .populate("createdBy", "name email")
      .sort({ order: 1, createdAt: -1 });

    res.json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignee", "name email")
      .populate("createdBy", "name email");

    if (!task) return res.status(404).json({ message: "Task not found" });

    const check = await assertMember(task.workspace, req.user._id);
    if (check.error) return res.status(check.status).json({ message: check.error });

    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Handles editing fields AND status/assignee changes — logs meaningful actions
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const check = await assertMember(task.workspace, req.user._id);
    if (check.error) return res.status(check.status).json({ message: check.error });

    const { title, description, priority, assignee, dueDate, status, order } = req.body;

    if (status && status !== task.status) {
      await logAction(task._id, req.user._id, `moved task to "${status}"`, req);
      task.status = status;
    }

    if (assignee !== undefined && String(assignee) !== String(task.assignee)) {
      await logAction(task._id, req.user._id, "changed assignee", req);
      task.assignee = assignee || null;
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (order !== undefined) task.order = order;

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate("assignee", "name email")
      .populate("createdBy", "name email");

    req.app.get("io").to(String(task.project)).emit("task-updated", populatedTask);

    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const check = await assertMember(task.workspace, req.user._id);
    if (check.error) return res.status(check.status).json({ message: check.error });

    const projectId = String(task.project);
    const taskId = String(task._id);

    await task.deleteOne();

    req.app.get("io").to(projectId).emit("task-deleted", taskId);

    res.json({ success: true, message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};