const mongoose = require("mongoose")
const{ObjectId}= mongoose.Schema.Types

const postSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    body:{
        type:String,
        required:true
    },
    photo:{
        type:String,
        default:"no photo"
    },
    likes:[{type:ObjectId,ref:"USER"}],
    postedby:{
        type: mongoose.Schema.Types
.        ObjectId,
        ref: "USER"
    }
})

mongoose.model("POST",postSchema)