import React, { useState, useEffect} from "react";
import "./Createpost.css";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
export default function Createpost(){
const [body, setBody]= useState("");
const [image, setImage]= useState("")
const [url, setUrl] =useState("")
const navigate = useNavigate()


    //Toast functions
const notifyA = (msg) => toast.error(msg)
const notifyB = (msg) =>toast.success(msg)

useEffect(() =>{
    
     //saving post to mongodb
    if(url){
        fetch("http://localhost:5000/createPost",{
            method:"post",
            header:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                body,
                pic:url
            })
        }).then(res=>res.json())
        .then(data => { 
            if(data.error){
            notifyA(data.error)
            } else{
            notifyB("Successfully Posted")
            navigate("/")
            }
        })
        .catch(err => console.log(err))}

},[url])

// posting image to cloudinary 
const postDetails =()=>{
    console.log(body,image)
    const data = new FormData()
    data.append("file",image)
    data.append("upload_preset","edugram")
    data.append("cloud_name","educloud")  //cloudname:educloud
    fetch("https://api.cloudinary.com/v1_1/educloud/image/upload",
        {method:"post",
            body:data
        }).then(res=>res.json())
        .then(data => setUrl(data.url))
        .catch(err => console.log(err))

       
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
    <img id="output" src="https://www.bing.com/th?id=OIP.JIo_erHjGUXp0-Z86gJAqAHaHa&w=150&h=150&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2" alt="Preview" />
    <input 
        type="file" 
        accept='image/*' 
        onChange={(event) => {
            loadfile(event);
            setImage(event.target.files[0]);  // Corrected property name `files` instead of `file`
        }} 
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
