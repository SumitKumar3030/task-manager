const Project = require("../models/Project");
const Workspace = require("../models/Workspace");

// helper: check requester is a member of the workspace
const assertMember = async (workspaceId, userId) => {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) return { error: "Workspace not found", status: 404 };
  const isMember = workspace.members.some((m) => m.user.equals(userId));
  if (!isMember) return { error: "Not a member of this workspace", status: 403 };
  return { workspace };
};

exports.createProject = async (req, res) => {
  try {
    const { name, description, workspaceId } = req.body;

    const check = await assertMember(workspaceId, req.user._id);
    if (check.error) return res.status(check.status).json({ message: check.error });

    const project = await Project.create({
      name,
      description,
      workspace: workspaceId,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjectsByWorkspace = async (req, res) => {
  try {
    const check = await assertMember(req.params.workspaceId, req.user._id);
    if (check.error) return res.status(check.status).json({ message: check.error });

    const projects = await Project.find({ workspace: req.params.workspaceId })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: projects.length, projects });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate("createdBy", "name email");
    if (!project) return res.status(404).json({ message: "Project not found" });

    const check = await assertMember(project.workspace, req.user._id);
    if (check.error) return res.status(check.status).json({ message: check.error });

    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const check = await assertMember(project.workspace, req.user._id);
    if (check.error) return res.status(check.status).json({ message: check.error });

    await project.deleteOne();
    res.json({ success: true, message: "Project deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};