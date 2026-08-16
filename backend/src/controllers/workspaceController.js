const Workspace = require("../models/Workspace");
const Invite = require("../models/Invite");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

// Create a workspace — creator becomes owner + admin member
exports.createWorkspace = async (req, res) => {
  try {
    const { name } = req.body;

    const workspace = await Workspace.create({
      name,
      owner: req.user._id,
      members: [{ user: req.user._id, role: "admin" }],
    });

    res.status(201).json({ success: true, workspace });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all workspaces the logged-in user belongs to
exports.getMyWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({ "members.user": req.user._id })
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: workspaces.length, workspaces });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single workspace (must be a member)
exports.getWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id).populate(
      "members.user",
      "name email"
    );

    if (!workspace) return res.status(404).json({ message: "Workspace not found" });

    const isMember = workspace.members.some((m) => m.user._id.equals(req.user._id));
    if (!isMember) return res.status(403).json({ message: "Not a member of this workspace" });

    res.json({ success: true, workspace });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Invite a member by email — only admins can invite
exports.inviteMember = async (req, res) => {
  try {
    const { email } = req.body;
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) return res.status(404).json({ message: "Workspace not found" });

    const requester = workspace.members.find((m) => m.user.equals(req.user._id));
    if (!requester || requester.role !== "admin") {
      return res.status(403).json({ message: "Only admins can invite members" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const alreadyMember = workspace.members.some((m) => m.user.equals(existingUser._id));
      if (alreadyMember) {
        return res.status(400).json({ message: "User is already a member" });
      }
    }

    const token = crypto.randomBytes(32).toString("hex");
    const invite = await Invite.create({
      workspace: workspace._id,
      email,
      invitedBy: req.user._id,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    const inviteLink = `${process.env.CLIENT_URL}/invite/${token}`;

    await sendEmail({
      to: email,
      subject: `You're invited to join ${workspace.name} on TaskFlow`,
      html: `<p>${req.user.name} invited you to join <b>${workspace.name}</b> on TaskFlow.</p>
             <p><a href="${inviteLink}">Click here to accept the invite</a></p>
             <p>This link expires in 7 days.</p>`,
    });

    res.status(201).json({ success: true, message: "Invite sent", invite });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Accept an invite (logged in user)
exports.acceptInvite = async (req, res) => {
  try {
    const { token } = req.params;
    const invite = await Invite.findOne({ token });

    if (!invite) return res.status(404).json({ message: "Invite not found" });
    if (invite.status !== "pending") {
      return res.status(400).json({ message: "This invite is no longer valid" });
    }
    if (invite.expiresAt < new Date()) {
      invite.status = "expired";
      await invite.save();
      return res.status(400).json({ message: "This invite has expired" });
    }
    if (invite.email.toLowerCase() !== req.user.email.toLowerCase()) {
      return res.status(403).json({ message: "This invite was sent to a different email" });
    }

    const workspace = await Workspace.findById(invite.workspace);
    if (!workspace) return res.status(404).json({ message: "Workspace not found" });

    const alreadyMember = workspace.members.some((m) => m.user.equals(req.user._id));
    if (!alreadyMember) {
      workspace.members.push({ user: req.user._id, role: "member" });
      await workspace.save();
    }

    invite.status = "accepted";
    await invite.save();

    res.json({ success: true, message: "Joined workspace", workspace });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};