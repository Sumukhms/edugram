const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const POST = mongoose.model("POST");
const USER = mongoose.model("USER");

router.get("/user/:id", (req, res) => {
    // Find user by ID, excluding password
    USER.findOne({ _id: req.params.id })
        .select("-password")  // Don't send the password
        .then(user => {
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            // Find all posts made by this user
            POST.find({ postedBy: req.params.id })
                .populate("postedBy", "_id name photo") // Populate only the needed fields
                .exec((err, posts) => {
                    if (err) {
                        return res.status(422).json({ error: err });
                    }
                    res.status(200).json({ user, posts });
                });
        })
        .catch(err => {
            return res.status(404).json({ error: "User not found" });
        });
});

module.exports = router;
