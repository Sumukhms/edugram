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
      .populate({ path: "postedBy", select: "_id name photo" })
      .populate("comments.postedBy","_id name")
      .sort("-createdAt")
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
      mediaType: mediaType || 'image', // Save the mediaType, default to 'image'
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
    // Parse page and limit from query params with validation for positive integers
    const page = Math.max(1, parseInt(req.query.page) || 1);  // Ensure page is at least 1
    const limit = Math.max(1, parseInt(req.query.limit) || 10); // Ensure limit is at least 1
    const skip = (page - 1) * limit;

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
      .sort("-createdAt")
      
    // Handle case where no posts are found
    if (!myposts || myposts.length === 0) {
      return res.status(404).json({ error: "No posts found for this user" });
    }

    // Return the posts
    res.json(myposts);
  } catch (err) {
    // Error handling with more detailed information
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
  .populate("comments.postedBy","_id name ")
  .populate("postedBy","_id name photo")
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

// Delete Post Route
router.delete("/deletePost/:postId", requireLogin, async (req, res) => {
  try {
    const postId = req.params.postId;

    const deletedPost = await POST.findByIdAndDelete(postId);

    if (!deletedPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json({ message: "Post deleted successfully", deletedPost });
  } catch (err) {
    res.status(500).json({ error: "An error occurred while deleting the post", details: err.message });
  }
});

// to show following post
router.get("/myfollowingpost", requireLogin, async (req, res) => {
  try {
    const posts = await POST.find({ postedBy: { $in: req.user.following } })
      .populate("postedBy", "_id name photo")
      .populate("comments.postedBy", "_id name")
      .sort("-createdAt");
      
    // This now sends an empty array [] if no posts are found,
    // which fixes the frontend error.
    res.json(posts); 
    
  } catch (err) {
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});


module.exports = router;
