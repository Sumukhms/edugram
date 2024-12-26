const express = require('express');
const router = express.Router();
const mongoose =require("mongoose");
const requireLogin = require("../middlewares/requireLogin");
const Post = mongoose.model("Post")


//Route
router.get("/allposts",requireLogin,(req,res)=>{
    Post.find()
    .populate("postedBy","_id name")
    .then(posts => res.json(posts))
    .catch(err => console.log(err))
})


router.post("/createPost",requireLogin, (req,res)=>{
    const {body, pic}=req.body;
    console.log(pic)
    if (!body || pic){
         return res.status(422).json({ error: "Please add all the fields" })
    }
    console.log(req.user)
   const post = new Post({
       body,
       photo:pic,
       postedBy:req.user
    })
    post.save().then((result)=>{
        return res.json({post:result})
    }).catch(err => console.log(err))
})

module.exports = router
