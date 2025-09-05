const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const USER = mongoose.model("USER");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const rateLimit = require('express-rate-limit'); // Import the package

// --- Stricter Rate Limiter for Authentication ---
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 10, // Limit each IP to 10 authentication attempts per window
	standardHeaders: true,
	legacyHeaders: false,
    message: { error: "Too many login attempts from this IP, please try again after 15 minutes" }
});


const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
};

// Apply the stricter limiter to both signup and signin routes
router.post("/signup", authLimiter, async (req, res) => {
  try {
    const { name, userName, email, password } = req.body;

    if (!name || !email || !userName || !password) {
      return res.status(422).json({ error: "Please add all the fields" });
    }

    if (!validateEmail(email)) {
      return res.status(422).json({ error: "Please enter a valid email" });
    }

    if (password.length < 6) {
      return res
        .status(422)
        .json({ error: "Password must be at least 6 characters" });
    }

    const userExists = await USER.findOne({
      $or: [{ email: email }, { userName: userName }],
    });

    if (userExists) {
      return res.status(422).json({
        error: "User already exists with the email or username",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new USER({
      name,
      email,
      userName,
      password: hashedPassword,
    });

    await user.save();
    res.status(201).json({ message: "Registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/signin", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(422).json({ error: "Please add email and password" });
    }

    const savedUser = await USER.findOne({ email: email });
    if (!savedUser) {
      return res.status(422).json({ error: "Invalid email" });
    }

    const match = await bcrypt.compare(password, savedUser.password);
    if (!match) {
      return res.status(422).json({ error: "Invalid password" });
    }

    const token = jwt.sign({ _id: savedUser.id }, process.env.Jwt_secret, {
      expiresIn: "7d",
    });

    const { _id, name, photo } = savedUser;
    res.json({
      token,
      user: { _id, name, email, photo },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;