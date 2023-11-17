const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const config = require("../config/config");

// Signup route
router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    const userfound = await User.findOne({ email });
    if (userfound) {
      return res.status(404).json({ error: "User already exist" });
    }

    const user = new User({ email, password });
    await user.save();

    res.status(201).json({ message: "Signup successful" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign({ userId: user._id }, config.secret, {
      expiresIn: "1h",
    });

    res.status(200).json({ token, user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
