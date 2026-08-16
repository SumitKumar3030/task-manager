const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getAuditLogs } = require("../controllers/auditController");

router.use(protect);

router.get("/:entityType/:entityId", getAuditLogs);

module.exports = router;