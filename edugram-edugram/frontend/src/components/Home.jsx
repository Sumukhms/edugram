import React, { useEffect, useState } from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import {  toast } from 'react-toastify';

export default function Home() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [comment, setComment] = useState("");
  const [show, setShow] = useState(false);
  const [item, setItem] = useState([])

   // Toast functions
      const notifyA = (msg) => toast.error(msg);
      const notifyB = (msg) => toast.success(msg);
  

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    const storedUser = JSON.parse(localStorage.getItem("user"));
    
    if (!token || !storedUser) {
      navigate("./signup");
      return;
    }

    setUser(storedUser);  // Set the user data
    
    // Fetch posts from the server
    fetch("http://localhost:5000/allposts", {
      headers: {
        "Authorization": "Bearer " + token,
      },
    })
      .then((res) => res.json())
      .then((result) => {
        if (Array.isArray(result)) {
          setData(result);
        } else {
          setError("Unexpected response format");
        }
      })
      .catch((err) => {
        setError("Failed to fetch posts. Please try again later.");
        console.log(err);
      });
  }, [navigate]);

  // to show and hide comment
  const toggleComment = (posts) =>{
    if(show){
      setShow(false);
    }else{
      setShow(true);
      setItem(posts);
    }
  }

  // Like the post
  const likePost = (id) => {
    if (!user) return;  // Prevent actions if no user is logged in
    
    const userId = user._id;
  
    // Check if the user has already liked the post
    const post = data.find((post) => post._id === id);
    // if (post.likes.includes(userId)) {
    //   console.log("You have already liked this post");
    //   return; // Don't do anything if the user already liked the post
    // }
  
    fetch("http://localhost:5000/like", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({ postId: id }),
    })
      .then((res) => res.json())
      .then((result) => {
        const updatedPosts = data.map((posts) => {
          if (post._id == result._id) {
            return { ...posts, likes: result.likes };
          }
          return posts;
        });
        setData(updatedPosts); // Update the posts data
        console.log(result);
      })
      .catch((err) => console.log(err));
  };
  
  // Unlike the post
  const unlikePost = (id) => {
    if (!user) return;  // Prevent actions if no user is logged in
    
    fetch("http://localhost:5000/unlike", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({ postId: id }),
    })
      .then((res) => res.json())
      .then((result) => {
        const updatedPosts = data.map((posts) => {
          if (posts._id === result._id) {
            return { ...posts, likes: result.likes };
          }
          return posts;
        });
        setData(updatedPosts); // Update the posts data
        console.log(result);
      })
      .catch((err) => console.log(err));
  };

  // function to make comment
  const makeComment = (text,id)=>{
    fetch("http://localhost:5000/comment", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({ 
        text:text,
        postId: id }),
    })
      .then((res) => res.json())
      .then((result) => {
        const updatedPosts = data.map((posts) => {
          if (posts._id == result._id) {
            return result;
          }
          return posts;
        });
        setData(updatedPosts);
        setComment("");
        notifyB("Comment posted")
        console.log(result);
      })
      .catch((err) => console.log(err));
  }

  // Error Handling
  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  // Render loading if user is not set
  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="home">
      {/* card  */}
      {data.length === 0 ? (
        <div>No posts available</div>
      ) : (
        data.map((posts) => {
          return (
            <div className="card" key={posts._id}>
              <div className="card-header">
                <div className="card-pic">
                  {/* Check if the profile picture exists, else use a default */}
                  <img
                    src={posts.postedBy.photo || "https://via.placeholder.com/150"}  // Default image if no photo
                    alt="profile"
                  />
                </div>
                <h5>{posts.postedBy.name || "Unknown User"}</h5>
              </div>
              <div className="card-image">
                <img src={posts.photo || "default-photo-url"} alt="Post" />
              </div>
              <div className="card-content">
                {posts.likes.includes(user._id) ? (
                  <span
                    className="material-symbols-outlined material-symbols-outlined-red"
                    onClick={() => {
                      unlikePost(posts._id);
                    }}
                  >
                    favorite
                  </span>
                ) : (
                  <span
                    className="material-symbols-outlined"
                    onClick={() => {
                      likePost(posts._id);
                    }}
                  >
                    favorite
                  </span>
                )}
                <p>{posts.likes.length} Likes</p>
                <p>{posts.body || "No description available"}</p>
                <p style={{fontWeight:"bold",cursor:"pointer"}}  onClick={()=>{toggleComment(posts)}}>View all comments</p>
              </div>
              {/* add comment  */}
              <div className="add-comment">
                <span className="material-symbols-outlined">mood</span>
                <input type="text" placeholder="Add a comment" value={comment}  onChange={(e)=>{setComment(e.target.value)}}/>
                <button className="comment" onClick={()=>{makeComment(comment,posts._id)}}>Post</button>
              </div>
            </div>
          );
        })
      )}

      {/* show comment  */}
      {show && (
      <div className="showComment">
        <div className="container" >
          <div className="postPic">
            <img src={item.photo} alt="" />
          </div>
          <div className="details">
          <div className="card-header" style={{borderBottom:"1px solid #00000029"}}>
                <div className="card-pic">
                  {/* Check if the profile picture exists, else use a default */}
                  <img
                    src= "https://via.placeholder.com/150"  // Default image if no photo
                    alt="profile"
                  />
                </div>
                <h5>{item.postedBy.name}</h5>
              </div>

              {/* comment section  */}
              <div className="comment-section" style={{borderBottom:"1px solid #00000029"}}>
                {item.comments.map((comment)=>{
                  return(
                <p className="comm">
                  <span className="commenter" style={{fontWeight:"bolder"}}> {comment.postedBy.name}{""}</span>
                  <span className="commentText">{comment.comment}</span>
                </p>
                  )
                })}
              </div>
              <div className="card-content">
                <p>{item.likes.length} Likes</p>
                <p>{item.body}</p>
              </div>
              <div className="add-comment">
                <span className="material-symbols-outlined">mood</span>
                <input type="text" placeholder="Add a comment" value={comment}  onChange={(e)=>{setComment(e.target.value)}}/>
                <button className="comment" onClick={()=>{makeComment(comment,item._id);
                  toggleComment();
                }}>Post</button>
              </div>
          </div>
        </div>
        <div className="close-comment">
          <span className="material-symbols-outlined material-symbols-outlined-comment"  onClick={()=>{toggleComment();}}>close</span>
          </div>
      </div>)
      }
    </div>
  );
}
