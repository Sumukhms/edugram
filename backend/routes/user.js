const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const POST = mongoose.model("POST");
const USER = mongoose.model("USER");
const requireLogin = require("../middlewares/requireLogin");

// to get user profile
router.get("/user/:id", async (req, res) => {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
    }

    try {
        console.log('Request for user ID:', userId);

        const user = await USER.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const posts = await POST.find({ postedBy: userId })
            .populate("postedBy", "_id name photo")
            .populate("comments.postedBy", "_id name");

        console.log('User and posts:', { user, posts });

        res.status(200).json({ user, posts });
    } catch (err) {
        console.error('Error fetching user data:', err);
        return res.status(500).json({ error: "Something went wrong" });
    }
});

// to follow user
router.put("/follow", requireLogin, async (req, res) => {
    try {
        const userToFollow = await USER.findByIdAndUpdate(
            req.body.followId,
            { $push: { followers: req.user._id } },
            { new: true }
        );

        if (!userToFollow) {
            return res.status(404).json({ error: "User to follow not found" });
        }

        const loggedInUser = await USER.findByIdAndUpdate(
            req.user._id,
            { $push: { following: req.body.followId } },
            { new: true }
        );

        res.status(200).json(loggedInUser);
    } catch (err) {
        console.error('Error following user:', err);
        return res.status(422).json({ error: err.message });
    }
});

// to unfollow user
router.put("/unfollow", requireLogin, async (req, res) => {
    try {
        const userToUnfollow = await USER.findByIdAndUpdate(
            req.body.followId,
            { $pull: { followers: req.user._id } },
            { new: true }
        );

        if (!userToUnfollow) {
            return res.status(404).json({ error: "User to unfollow not found" });
        }

        const loggedInUser = await USER.findByIdAndUpdate(
            req.user._id,
            { $pull: { following: req.body.followId } },
            { new: true }
        );

        res.status(200).json(loggedInUser);
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
        res.status(422).json({ error: err.message });
    }
});


// NEW: Get followers list
router.get("/user/:id/followers", requireLogin, async (req, res) => {
    try {
        const user = await USER.findById(req.params.id)
            .populate("followers", "_id name photo")
            .select("followers");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user.followers);
    } catch (err) {
        console.error('Error fetching followers:', err);
        res.status(500).json({ error: "Something went wrong" });
    }
});

// NEW: Get following list
router.get("/user/:id/following", requireLogin, async (req, res) => {
    try {
        const user = await USER.findById(req.params.id)
            .populate("following", "_id name photo")
            .select("following");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user.following);
    } catch (err) {
        console.error('Error fetching following:', err);
        res.status(500).json({ error: "Something went wrong" });
    }
});


// to search for users
router.post("/search-users", requireLogin, (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(422).json({ error: "Search query is empty" });
  }

  // Using regex for a case-insensitive search
  let userPattern = new RegExp("^" + query, "i");

  USER.find({
    $or: [{ name: { $regex: userPattern } }, { userName: { $regex: userPattern } }],
    _id: { $ne: req.user._id } // Exclude the current user from results
  })
    .select("_id name photo")
    .then((users) => {
      res.json({ users });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "Error searching for users" });
    });
});

module.exports = router;