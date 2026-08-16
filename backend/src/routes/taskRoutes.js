const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createTask,
  getTasksByProject,
  getTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

router.use(protect);

router.post("/", createTask);
router.get("/project/:projectId", getTasksByProject);
router.get("/:id", getTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

module.exports = router;