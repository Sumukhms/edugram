const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

// Define the schema for posts
const postSchema = new mongoose.Schema({
  body: {
    type: String,
    required: [true, "Post body is required"], // Improved error message
  },
  photo: {
    type: String,
    required: [true, "Photo URL is required"], // Fixed typo in `require` and added validation message
  },
  likes: [
    {
      type: ObjectId,
      ref: "USER", // Ensure "USER" matches your user model name
    },
  ],
  comments:[{
    comment:{type:String},
    postedBy:{type:ObjectId , ref:"USER"}
  }],
  postedBy: {
    type: ObjectId,
    ref: "USER", // Ensure "USER" matches your user model name
    required: [true, "PostedBy user reference is required"], // Add required field validation
  },
}, {
  timestamps: true, // Automatically add `createdAt` and `updatedAt` fields
});

// Register the model
mongoose.model("POST", postSchema);
