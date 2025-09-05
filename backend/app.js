require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
const mongoose = require("mongoose");
const cors = require("cors");
const rateLimit = require('express-rate-limit'); // Import the package

// --- Rate Limiter Configuration ---
const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per window
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { error: "Too many requests from this IP, please try again after 15 minutes" }
});

// Apply the rate limiting middleware to all requests
app.use(apiLimiter);


// Use the MONGO_URI from your .env file
const mongoUri = process.env.MONGO_URI;

// Connect to MongoDB
async function connectDB() {
    try {
        await mongoose.connect(mongoUri, {});
        console.log('Successfully connected to MongoDB');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err.message);
        process.exit(1);
    }
}
connectDB();

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());

// Require models
require('./models/model');
require('./models/post');

// Require routes
app.use(require("./routes/auth"));
app.use(require("./routes/CreatePost"));
app.use(require("./routes/user"));

app.listen(PORT, () => {
    console.log("Server is running on port" + " " + PORT);
});