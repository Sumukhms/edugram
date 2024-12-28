const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const requireLogin = require("../middlewares/requireLogin");
const POST = mongoose.model("POST");

// Route to get all posts
router.get("/allposts", requireLogin, (req, res) => {
  POST.find()
    .populate({path : "postedBy", strictPopulate: false })
    .exec()
    .then((posts) => res.json(posts))
    .catch((err) =>
      res.status(500).json({ error: "Internal server error", details: err.message })
    );
});

// Route to create a post
router.post("/createPost", requireLogin, (req, res) => {
  const { body, pic } = req.body;
  console.log(pic)
  if (!body || !pic) {
    return res.status(422).json({ error: "Please add all the fields" });
  }
  console.log(req.user)
  const post = new POST({
    body,
    photo: pic,
    postedBy: req.user._id
  });

  post
    .save()
    .then((result) => res.json({ post: result }))
    .catch((err) =>
      res.status(500).json({ error: "Failed to create post", details: err.message })
    );
});

// Route to get posts created by the logged-in user
router.get("/myposts", requireLogin, (req, res) => {
  POST.find({ postedBy: req.user._id })
    .populate("postedBy", "_id name")
    .then((myposts) => res.json(myposts))
    .catch((err) =>
      res.status(500).json({ error: "Internal server error", details: err.message })
    );
});

// Route to like a post
router.put("/like", requireLogin, (req, res) => {
  const { postId } = req.body;
  if (!postId) {
    return res.status(400).json({ error: "Post ID is required" });
  }

  POST.findByIdAndUpdate(
    postId,
    { $push: { likes: req.user._id } },
    { new: true }
  )
    .populate("postedBy", "_id name")
    .populate("likes", "_id name")
    .exec((err, result) => {
      if (err) {
        return res.status(422).json({ error: err.message });
      }
      res.json(result);
    });
});

// Route to unlike a post
router.put("/unlike", requireLogin, (req, res) => {
  const { postId } = req.body;
  if (!postId) {
    return res.status(400).json({ error: "Post ID is required" });
  }

  POST.findByIdAndUpdate(
    postId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .populate("postedBy", "_id name")
    .populate("likes", "_id name")
    .exec((err, result) => {
      if (err) {
        return res.status(422).json({ error: err.message });
      }
      res.json(result);
    });
});

module.exports = router;
