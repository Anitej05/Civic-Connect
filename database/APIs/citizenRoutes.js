const express = require("express");
const Report = require("../Models/reportModel");

const citizenRouter = express.Router();

// 1. Report Issue (AI-powered: text, photo, video, voice, GPS)
citizenRouter.post("/report/smart-create", async (req, res) => {
  try {
    const { user_id, text, image_url, video_url, voice_note_url, location } = req.body;

    // TODO: Replace with Gemini/Groq AI classification
    const aiGenerated = {
      title: "Water leakage on main road",
      category: "Water Supply",
      urgency: "High",
      assigned_department: "Water Supply"
    };

    const newReport = new Report({
      user_id,
      original_text: text || null,
      image_url: image_url || null,
      video_url: video_url || null,
      voice_note_url: voice_note_url || null,
      location,
      ...aiGenerated,
      status: "Submitted"
    });

    const saved = await newReport.save();
    res.status(201).json({ message: "AI report created", report: saved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Citizen Dashboard: all my reports
citizenRouter.get("/reports/user/:userId", async (req, res) => {
  try {
    const reports = await Report.find({ user_id: req.params.userId });
    res.json({ message: "My reports", reports });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Community Feed: nearby issues (geo + timeline)
citizenRouter.get("/reports/nearby", async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: "Missing coordinates" });

    const reports = await Report.find({
      location: {
        $nearSphere: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: 5000
        }
      }
    });

    res.json({ message: "Nearby reports", reports });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Upvote an existing report (avoid duplicates)
citizenRouter.post("/report/:id/upvote", async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Report.findByIdAndUpdate(
      id,
      { $inc: { upvotes: 1 } },
      { new: true }
    );
    res.json({ message: "Upvoted", report: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Notifications (mock endpoint – in real app integrate FCM/Clerk webhooks)
citizenRouter.get("/notifications/:userId", async (req, res) => {
  res.json({ message: "Notifications fetched", notifications: [] });
});

module.exports = citizenRouter;
