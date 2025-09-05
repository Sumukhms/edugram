const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

// Define the schema for posts
const postSchema = new mongoose.Schema(
  {
    body: {
      type: String,
      required: [true, "Post body is required"],
      trim: true,
      maxLength: [500, "Post body cannot exceed 500 characters"],
      minLength: [1, "Post body cannot be empty"],
    },
    photo: {
      type: String,
      required: [true, "Media URL is required"],
      validate: {
        validator: function (v) {
          return /^(http|https):\/\/[^ "]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid URL!`,
      },
    },
    mediaType: {
      type: String,
      enum: {
        values: ["image", "video"],
        message: "{VALUE} is not supported",
      },
      default: "image",
      required: true,
    },
    likes: [
      {
        type: ObjectId,
        ref: "USER",
      },
    ],
    comments: [
      {
        comment: {
          type: String,
          required: true,
          trim: true,
          maxLength: [200, "Comment cannot exceed 200 characters"],
        },
        postedBy: {
          type: ObjectId,
          ref: "USER",
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    postedBy: {
      type: ObjectId,
      ref: "USER",
      required: [true, "PostedBy user reference is required"],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, // Add this to include virtuals when converting to JSON
    toObject: { virtuals: true },
  }
);

// Single compound index for efficient queries
postSchema.index({ postedBy: 1, createdAt: -1 });

// Add virtual for comment count
postSchema.virtual("commentCount").get(function () {
  return this.comments.length;
});

// Add virtual for like count
postSchema.virtual("likeCount").get(function () {
  return this.likes.length;
});

// Add after schema definition, before model creation
postSchema.statics.formatResponse = function (posts) {
  if (!posts) return { posts: [] };
  if (!Array.isArray(posts)) posts = [posts];
  return { posts: posts };
};

postSchema.methods.toJSON = function () {
  const post = this.toObject();
  post.id = post._id; // Add id field for consistency
  post.commentCount = this.commentCount;
  post.likeCount = this.likeCount;
  return post;
};

postSchema.pre(/^find/, function (next) {
  this.populate("postedBy", "_id name photo").populate(
    "comments.postedBy",
    "_id name"
  );
  next();
});

// Export the model
const Post = mongoose.model("POST", postSchema);
module.exports = Post;