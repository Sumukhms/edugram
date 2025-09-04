require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");


app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

// Require models
require('./models/model');
require('./models/post');

app.use(express.json());

// Require routes
app.use(require("./routes/auth"));
app.use(require("./routes/CreatePost"));
app.use(require("./routes/user"));

// Use the MONGO_URI from your .env file
const mongoUri = process.env.MONGO_URI;

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

// Serving the frontend
app.use(express.static(path.join(__dirname, "../frontend/build")));

app.get("*", (req, res) => {
    res.sendFile(
        path.join(__dirname, "../frontend/build/index.html"),
        function (err) {
            if (err) {
                res.status(500).send(err);
            }
        }
    );
});

app.listen(PORT, () => {
    console.log("Server is running on port" + " " + PORT);
});