const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createProject,
  getProjectsByWorkspace,
  getProject,
  deleteProject,
} = require("../controllers/projectController");

router.use(protect);

router.post("/", createProject);
router.get("/workspace/:workspaceId", getProjectsByWorkspace);
router.get("/:id", getProject);
router.delete("/:id", deleteProject);

module.exports = router;