const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createWorkspace,
  getMyWorkspaces,
  getWorkspace,
  inviteMember,
  acceptInvite,
} = require("../controllers/workspaceController");

router.use(protect); // every route below requires login

router.post("/", createWorkspace);
router.get("/", getMyWorkspaces);
router.get("/:id", getWorkspace);
router.post("/:id/invite", inviteMember);
router.post("/invite/:token/accept", acceptInvite);

module.exports = router;