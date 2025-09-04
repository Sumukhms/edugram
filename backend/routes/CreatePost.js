const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const requireLogin = require("../middlewares/requireLogin");
const POST = mongoose.model("POST");
const rateLimit = require("express-rate-limit");

// Validation middleware for post inputs
const validatePostInput = (req, res, next) => {
  const { body, pic, mediaType } = req.body;

  if (!body || !pic) {
    return res.status(422).json({ error: "Please add all required fields" });
  }

  if (mediaType && !["image", "video"].includes(mediaType)) {
    return res.status(422).json({ error: "Invalid media type" });
  }

  next();
};

// Pagination helper function
const paginateResults = ({ page = 1, limit = 10 }) => {
  const validPage = Math.max(1, parseInt(page));
  const validLimit = Math.max(1, Math.min(100, parseInt(limit)));
  const skip = (validPage - 1) * validLimit;

  return {
    skip,
    limit: validLimit,
  };
};

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Apply rate limiting to all requests
router.use(limiter);

/**
 * @route   GET /api/posts/allposts
 * @desc    Get all posts with pagination
 * @access  Private
 * @query   {number} page - Page number (default: 1)
 * @query   {number} limit - Posts per page (default: 10)
 */
router.get("/allposts", requireLogin, async (req, res) => {
  try {
    const { skip, limit } = paginateResults({
      page: req.query.page,
      limit: req.query.limit,
    });

    const posts = await POST.find()
      .skip(skip)
      .limit(limit)
      .populate({ path: "postedBy", select: "_id name photo" })
      .populate("comments.postedBy", "_id name")
      .sort("-createdAt")
      .exec();

    if (!posts || posts.length === 0) {
      return res.status(404).json({ error: "No posts found" });
    }

    res.json(posts);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
});

// Route to create a post
router.post(
  "/createPost",
  requireLogin,
  validatePostInput,
  async (req, res) => {
    // Add mediaType to the destructured body
    const { body, pic, mediaType } = req.body;

    if (!body || !pic) {
      return res.status(422).json({ error: "Please add all the fields" });
    }

    if (!req.user || !req.user._id) {
      return res.status(400).json({ error: "User not authenticated" });
    }

    try {
      const post = new POST({
        body,
        photo: pic,
        mediaType: mediaType || "image", // Save the mediaType, default to 'image'
        postedBy: req.user._id,
      });

      const result = await post.save();
      res.json({ post: result });
    } catch (err) {
      res
        .status(500)
        .json({ error: "Failed to create post", details: err.message });
    }
  }
);

// Route to get posts created by the logged-in user with pagination
router.get("/myposts", requireLogin, async (req, res) => {
  try {
    const { skip, limit } = paginateResults({
      page: req.query.page,
      limit: req.query.limit,
    });

    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(400).json({ error: "User not authenticated" });
    }

    // Fetch posts with pagination, populated fields, and error handling
    const myposts = await POST.find({ postedBy: req.user._id })
      .skip(skip)
      .limit(limit)
      .populate({ path: "postedBy", select: "_id name" })
      .populate({ path: "comments.postedBy", select: "_id name" })
      .sort("-createdAt");

    // Handle case where no posts are found
    if (!myposts || myposts.length === 0) {
      return res.status(404).json({ error: "No posts found for this user" });
    }

    // Return the posts
    res.json(myposts);
  } catch (err) {
    // Error handling with more detailed information
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
});

// Like post route - converted to async/await
router.put("/like", requireLogin, async (req, res) => {
  try {
    const { postId } = req.body;

    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: "Invalid Post ID" });
    }

    const post = await POST.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.likes.includes(req.user._id)) {
      return res.status(400).json({ error: "Post already liked" });
    }

    post.likes.push(req.user._id);
    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
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
    .populate("postedBy", "_id name photo")
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

router.put("/comment", requireLogin, async (req, res) => {
  try {
    const { text, postId } = req.body;

    if (!text || !postId) {
      return res
        .status(422)
        .json({ error: "Please provide both text and postId" });
    }

    const comment = {
      comment: text,
      postedBy: req.user._id,
    };

    const result = await POST.findByIdAndUpdate(
      postId,
      { $push: { comments: comment } },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("comments.postedBy", "_id name")
      .populate("postedBy", "_id name photo");

    if (!result) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Add this helper function at the top
const validateObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Delete Post Route
router.delete("/deletePost/:postId", requireLogin, async (req, res) => {
  try {
    const { postId } = req.params;

    if (!validateObjectId(postId)) {
      return res.status(400).json({ error: "Invalid post ID format" });
    }

    const deletedPost = await POST.findByIdAndDelete(postId);

    if (!deletedPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json({ message: "Post deleted successfully", deletedPost });
  } catch (err) {
    res.status(500).json({
      error: "An error occurred while deleting the post",
      details: err.message,
    });
  }
});

// to show following post
router.get("/myfollowingpost", requireLogin, async (req, res) => {
  try {
    const posts = await POST.find({ postedBy: { $in: req.user.following } })
      .populate("postedBy", "_id name photo")
      .populate("comments.postedBy", "_id name")
      .sort("-createdAt");

    res.json(posts || []); // Return empty array if no posts
  } catch (err) {
    res.status(500).json({
      error: "Internal server error",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Something went wrong",
    });
  }
});

// Add error handler before module.exports
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

// Single module.exports at the end
module.exports = router;
