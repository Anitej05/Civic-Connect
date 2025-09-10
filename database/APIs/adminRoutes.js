const express = require("express");
const Report = require("../Models/reportModel");

const adminRouter = express.Router();

// 1. Dashboard: filter by dept, category, priority, status, date
adminRouter.get("/reports", async (req, res) => {
  try {
    const { department, category, status, startDate, endDate } = req.query;
    const filter = {};
    if (department) filter.assigned_department = department;
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (startDate && endDate) filter.created_at = { $gte: new Date(startDate), $lte: new Date(endDate) };

    const reports = await Report.find(filter);
    res.json({ message: "Filtered reports", reports });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Report details
adminRouter.get("/report/:id", async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Report details", report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Update status + add notes + upload WIP/Resolved photos
adminRouter.put("/report/:id/status", async (req, res) => {
  try {
    const { status, notes, progress_image_url, resolved_image_url } = req.body;
    const updated = await Report.findByIdAndUpdate(
      req.params.id,
      { status, notes, progress_image_url, resolved_image_url, updated_at: Date.now() },
      { new: true }
    );
    res.json({ message: "Status updated", report: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Municipal announcements (to Civic Pulse feed)
adminRouter.post("/announcements", async (req, res) => {
  res.status(201).json({ message: "Announcement posted", announcement: req.body });
});

// 5. Analytics KPIs (mock for now)
adminRouter.get("/analytics/kpis", async (req, res) => {
  res.json({
    totalReports: 120,
    resolutionRate: "85%",
    avgResponseTime: "2 days",
    highPriorityAlerts: 7
  });
});

// 6. Heatmap data (cluster reports by location)
adminRouter.get("/analytics/heatmap", async (req, res) => {
  const reports = await Report.aggregate([
    { $group: { _id: "$location.coordinates", count: { $sum: 1 } } }
  ]);
  res.json({ message: "Heatmap data", reports });
});

module.exports = adminRouter;
