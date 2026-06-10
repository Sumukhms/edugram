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
        const user = await USER.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const posts = await POST.find({ postedBy: userId })
            .populate("postedBy", "_id name photo")
            .populate("comments.postedBy", "_id name");

        res.status(200).json({ user, posts });
    } catch (err) {
        console.error('Error fetching user data:', err);
        return res.status(500).json({ error: "Something went wrong" });
    }
});

// to follow user
router.put("/follow", requireLogin, async (req, res) => {
    if (req.user._id.toString() === req.body.followId) {
        return res.status(400).json({ error: "You cannot follow yourself" });
    }

    try {
        await USER.findByIdAndUpdate(
            req.body.followId,
            { $addToSet: { followers: req.user._id } },
            { new: true }
        );

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
    if (req.user._id.toString() === req.body.followId) {
        return res.status(400).json({ error: "You cannot unfollow yourself" });
    }

    try {
        await USER.findByIdAndUpdate(
            req.body.followId,
            { $pull: { followers: req.user._id } },
            { new: true }
        );

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

// NEW: to upload banner pic
router.put("/uploadBannerPic", requireLogin, async (req, res) => {
    try {
        const result = await USER.findByIdAndUpdate(req.user._id, {
            $set: { bannerPhoto: req.body.pic }
        }, {
            new: true
        });
        res.json(result);
    } catch (err) {
        res.status(422).json({ error: err.message });
    }
});

// NEW: to update user bio
router.put("/updateBio", requireLogin, async (req, res) => {
    try {
        const result = await USER.findByIdAndUpdate(req.user._id, {
            $set: { bio: req.body.bio }
        }, {
            new: true
        });
        res.json(result);
    } catch (err) {
        res.status(422).json({ error: err.message });
    }
});

// Get followers list
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

// Get following list
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

  // Escape special regex characters to prevent ReDoS attacks
  const escapeRegex = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const escapedQuery = escapeRegex(query);
  let userPattern = new RegExp("^" + escapedQuery, "i");

  USER.find({
    $or: [{ name: { $regex: userPattern } }, { userName: { $regex: userPattern } }],
    _id: { $ne: req.user._id }
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

// to get user suggestions for "who to follow"
router.get("/user-suggestions", requireLogin, async (req, res) => {
    try {
        const users = await USER.find({
            _id: { $nin: [...req.user.following, req.user._id] }
        })
        .select("_id name photo")
        .limit(5);

        res.json({ users });
    } catch (err) {
        console.error('Error fetching user suggestions:', err);
        res.status(500).json({ error: "Something went wrong" });
    }
});

// to save post
router.put("/save-post", requireLogin, async (req, res) => {
    try {
        const result = await USER.findByIdAndUpdate(
            req.user._id,
            { $addToSet: { savedPosts: req.body.postId } },
            { new: true }
        ).select("-password");
        res.json(result);
    } catch (err) {
        return res.status(422).json({ error: err.message });
    }
});

// to unsave post
router.put("/unsave-post", requireLogin, async (req, res) => {
    try {
        const result = await USER.findByIdAndUpdate(
            req.user._id,
            { $pull: { savedPosts: req.body.postId } },
            { new: true }
        ).select("-password");
        res.json(result);
    } catch (err) {
        return res.status(422).json({ error: err.message });
    }
});

// to get saved posts
router.get("/saved-posts", requireLogin, async (req, res) => {
    try {
        const user = await USER.findById(req.user._id).populate({
            path: 'savedPosts',
            populate: {
                path: 'postedBy',
                select: '_id name photo'
            }
        });
        
        res.json({ posts: user.savedPosts || [] });
    } catch (err) {
        console.error('Error fetching saved posts:', err);
        res.status(500).json({ error: "Something went wrong" });
    }
});

module.exports = router;