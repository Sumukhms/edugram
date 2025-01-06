const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const POST = mongoose.model("POST");
const USER = mongoose.model("USER");
const requireLogin = require("../middlewares/requireLogin");

// to get user profile
router.get("/user/:id", async (req, res) => {
    const userId = req.params.id;

    // Validate if the provided id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
    }

    try {
        console.log('Request for user ID:', userId);

        const user = await USER.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const posts = await POST.find({ postedBy: userId }).populate("postedBy", "_id name photo");

        console.log('User and posts:', { user, posts });

        // Return the user and posts
        res.status(200).json({ user, posts });
    } catch (err) {
        console.error('Error fetching user data:', err);
        return res.status(500).json({ error: "Something went wrong" });
    }
});

// to follow user
router.put("/follow", requireLogin, async (req, res) => {
    try {
        // Add user to the followers list of the target user
        const userToFollow = await USER.findByIdAndUpdate(
            req.body.followId,
            { $push: { followers: req.user._id } },
            { new: true }
        );

        if (!userToFollow) {
            return res.status(404).json({ error: "User to follow not found" });
        }

        // Add target user to the following list of the logged-in user
        const loggedInUser = await USER.findByIdAndUpdate(
            req.user._id,
            { $push: { following: req.body.followId } },
            { new: true }
        );

        res.status(200).json(loggedInUser); // Send updated logged-in user data
    } catch (err) {
        console.error('Error following user:', err);
        return res.status(422).json({ error: err.message });
    }
});

// to unfollow user
router.put("/unfollow", requireLogin, async (req, res) => {
    try {
        // Remove user from the followers list of the target user
        const userToUnfollow = await USER.findByIdAndUpdate(
            req.body.followId,
            { $pull: { followers: req.user._id } },
            { new: true }
        );

        if (!userToUnfollow) {
            return res.status(404).json({ error: "User to unfollow not found" });
        }

        // Remove target user from the following list of the logged-in user
        const loggedInUser = await USER.findByIdAndUpdate(
            req.user._id,
            { $pull: { following: req.body.followId } },
            { new: true }
        );

        res.status(200).json(loggedInUser); // Send updated logged-in user data
    } catch (err) {
        console.error('Error unfollowing user:', err);
        return res.status(422).json({ error: err.message });
    }
});

// to upload profile pic
router.put("/uploadProfilePic", requireLogin, async (req, res) => {
    try {
        const result = await USER.findByIdAndUpdate(req.user._id, {
            $set: { photo: req.body.pic }
        }, {
            new: true
        });
        res.json(result);
    } catch (err) {
        res.status(422).json({ error: err });
    }
});



module.exports = router;
