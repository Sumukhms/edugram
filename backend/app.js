require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
const mongoose = require("mongoose");
const cors = require("cors");

// Use the MONGO_URI from your .env file
const mongoUri = process.env.MONGO_URI;

// Connect to MongoDB
async function connectDB() {
    try {
        await mongoose.connect(mongoUri, {});
        console.log('Successfully connected to MongoDB');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err.message);
        // Exit process with failure
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

// --- NOTE: Removed frontend serving logic from here ---

app.listen(PORT, () => {
    console.log("Server is running on port" + " " + PORT);
});
