const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

// Define the schema for posts
const postSchema = new mongoose.Schema({
  body: {
    type: String,
    required: [true, "Post body is required"],
    trim: true, // Remove whitespace
    maxLength: [500, "Post body cannot exceed 500 characters"]
  },
  photo: {
    type: String,
    required: [true, "Media URL is required"],
    validate: {
      validator: function(v) {
        // Basic URL validation
        return /^(http|https):\/\/[^ "]+$/.test(v);
      },
      message: props => `${props.value} is not a valid URL!`
    }
  },
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    default: 'image',
    required: true
  },
  likes: [{
    type: ObjectId,
    ref: "USER"
  }],
  comments: [{
    comment: {
      type: String,
      required: true,
      trim: true,
      maxLength: [200, "Comment cannot exceed 200 characters"]
    },
    postedBy: {
      type: ObjectId,
      ref: "USER",
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  postedBy: {
    type: ObjectId,
    ref: "USER",
    required: [true, "PostedBy user reference is required"]
  }
}, {
  timestamps: true
});

// Add index for better query performance
postSchema.index({ postedBy: 1, createdAt: -1 });

mongoose.model("POST", postSchema);