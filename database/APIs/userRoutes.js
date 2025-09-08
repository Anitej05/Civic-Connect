const express = require("express");
const User = require("../Models/userModel");
const userRouter = express.Router();
const { createUserFromClerk } = require("../database/crud");


// Clerk will call this after login/signup
userRouter.post("/user", async (req, res) => {
  try {
    const dbUser = await createUserFromClerk(req.body);
    res.status(201).json({ message: "User synced", user: dbUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = userRouter;

// Sync Clerk-authenticated user into MongoDB
userRouter.post("/user", async (req, res) => {
  try {
    const { _id, email, role } = req.body;
    let user = await User.findById(_id);

    if (user) {
      user.email = email;
      user.role = role || user.role;
      await user.save();
    } else {
      user = new User({ _id, email, role: role || "citizen" });
      await user.save();
    }

    res.status(201).json({ message: "User synced", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: get all users
userRouter.get("/users", async (req, res) => {
  try {
    const users = await User.find({});
    res.json({ message: "Users list", users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = userRouter;
