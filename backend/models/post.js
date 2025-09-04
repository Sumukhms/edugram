const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

// Define the schema for posts
const postSchema = new mongoose.Schema({
  body: {
    type: String,
    required: [true, "Post body is required"],
  },
  photo: {
    type: String,
    required: [true, "Media URL is required"],
  },
  // ADD THIS NEW FIELD
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    default: 'image'
  },
  likes: [
    {
      type: ObjectId,
      ref: "USER",
    },
  ],
  comments:[{
    comment:{type:String},
    postedBy:{type:ObjectId , ref:"USER"}
  }],
  postedBy: {
    type: ObjectId,
    ref: "USER",
    required: [true, "PostedBy user reference is required"],
  },
}, {
  timestamps: true,
});

mongoose.model("POST", postSchema);