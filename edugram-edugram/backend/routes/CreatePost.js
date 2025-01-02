const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const requireLogin = require("../middlewares/requireLogin");
const POST = mongoose.model("POST");

// Route to get all posts with pagination
router.get("/allposts", requireLogin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await POST.find()
      .skip(skip)
      .limit(limit)
      .populate({ path: "postedBy", select: "_id name" })
      .populate("comments.postedBy","_id name")
      .exec();

    if (!posts || posts.length === 0) {
      return res.status(404).json({ error: "No posts found" });
    }

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

// Route to create a post
router.post("/createPost", requireLogin, async (req, res) => {
  const { body, pic } = req.body;

  if (!body || !pic) {
    return res.status(422).json({ error: "Please add all the fields" });
  }

  // Ensure req.user is available
  if (!req.user || !req.user._id) {
    return res.status(400).json({ error: "User not authenticated" });
  }

  try {
    const post = new POST({
      body,
      photo: pic,
      postedBy: req.user._id,
    });

    const result = await post.save();
    res.json({ post: result });
  } catch (err) {
    res.status(500).json({ error: "Failed to create post", details: err.message });
  }
});

// Route to get posts created by the logged-in user with pagination
router.get("/myposts", requireLogin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!req.user || !req.user._id) {
      return res.status(400).json({ error: "User not authenticated" });
    }

    const myposts = await POST.find({ postedBy: req.user._id })
      .skip(skip)
      .limit(limit)
      .populate("postedBy", "_id name");

    if (!myposts || myposts.length === 0) {
      return res.status(404).json({ error: "No posts found for this user" });
    }
    res.json(myposts);
  } catch (err) {
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

// Route to like a post
router.put("/like", requireLogin, (req, res) => {
  const { postId } = req.body;

  if (!postId) {
    return res.status(400).json({ error: "Post ID is required" });
  }

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ error: "Invalid Post ID" });
  }

  if (!req.user || !req.user._id) {
    return res.status(400).json({ error: "User not authenticated" });
  }

  POST.findById(postId)
    .then((post) => {
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      // Check if the user already liked the post
      if (post.likes.includes(req.user._id)) {
        return res.status(400).json({ error: "You have already liked this post" });
      }

      // Add the user to the likes array
      post.likes.push(req.user._id);

      post.save()
        .then((updatedPost) => {
          res.json(updatedPost);
        })
        .catch((err) => res.status(500).json({ error: "Failed to like the post", details: err.message }));
    })
    .catch((err) => res.status(500).json({ error: "Internal server error", details: err.message }));
});


// Route to unlike a post
router.put("/unlike", requireLogin, (req, res) => {
  const { postId } = req.body;

  if (!postId) {
    return res.status(400).json({ error: "Post ID is required" });
  }

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ error: "Invalid Post ID" });
  }

  if (!req.user || !req.user._id) {
    return res.status(400).json({ error: "User not authenticated" });
  }

  POST.findByIdAndUpdate(
    postId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .populate("postedBy", "_id name")
    .populate("likes", "_id name")
    .then((result) => {
      if (!result) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(result);
    })
    .catch((err) => {
      res.status(422).json({ error: err.message });
    });
});

router.put("/comment",requireLogin,(req,res)=>{
  const comment={
    comment:req.body.text,
    postedBy:req.user._id
  }
  POST.findByIdAndUpdate(req.body.postId,{
    $push:{comments:comment}
  },{
    new:true
  })
  // .populate("postedBy", "_id name")
  .populate("comments.postedBy","_id name")
  .populate("postedBy","_id name")
  .then((result) => {
    if (!result) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json(result);
  })
  .catch((err) => {
    res.status(422).json({ error: err.message });
  });
})
module.exports = router;
