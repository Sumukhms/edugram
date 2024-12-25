import React, { useState } from "react";
import "./Createpost.css";
export default function Createpost(){
const [body,setBody]= useState("");
const [image,setImage]= useState("")


const postDetails =()=>{
    console.log(body,image)
}
  const loadfile = (event) =>{
        var output = document.getElementById('output');
        output.src = URL.createObjectURL(event.target.files[0]);
        output.onload = function() {
          URL.revokeObjectURL(output.src)
        }};
    return <div className="createPost">createpost
    {/* //header  */}
    <div className="post-header">
        <h4  style={{margin:"3px auto"}}> Create New Post</h4>
        <button id="post-btn" onClick={()=>{postDetails()}}>Share</button>
    </div>
    {/* image-preview  */}
    <div className="main-div">
        <img id="output" src="https://www.bing.com/th?id=OIP.JIo_erHjGUXp0-Z86gJAqAHaHa&w=150&h=150&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2" />
        <input type="file" accept='image/*' onChange={(event)=>{loadfile(event)
        setImage(event.target.file[0])}}
        /> 
    </div>
    {/* details  */}
    <div className="details">
        <div className="card-header">
            <div className="card-pic">
            <img src="https://plus.unsplash.com/premium_photo-1665663927587-a5b343dff128?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDE2fHx8ZW58MHx8fHx8" alt=""/>

            </div>
            <h5>Ramesh</h5>
        </div>
        <textarea value={body} onChange={(e) => {
            setBody(e.target.value)
        }} type ="text" placeholder="write a caption...."></textarea>
    </div>
    </div>;
}