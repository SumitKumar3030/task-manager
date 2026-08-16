const Audit = require("../models/Audit");

exports.getAuditLogs = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;

    const logs = await Audit.find({ entityType, entityId })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: logs.length, logs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};