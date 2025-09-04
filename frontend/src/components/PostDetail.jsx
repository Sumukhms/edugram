import React from "react";
import "../css/PostDetail.css";
import { useNavigate } from "react-router-dom";

export default function PostDetail({ item, toggleDetails }) {
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_URL;

  const removePost = async (postId) => {
    if (window.confirm("Do you really want to delete the post?")) {
      try {
        const response = await fetch(`${API_BASE}/deletePost/${postId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          },
        });
        if (!response.ok) throw new Error("HTTP error!");
        navigate("/");
      } catch (error) {
        console.error("Error deleting post:", error);
        alert("Failed to delete the post.");
      }
    }
  };

  if (!item) return <div>Loading...</div>;

  return (
    <div className="showComment">
      <div className="container">
        {/* THIS IS THE CHANGE */}
        <div className="postPic">
          {item.mediaType === 'video' ? (
            <video src={item.photo} controls autoPlay muted loop />
          ) : (
            <img src={item.photo || "https://via.placeholder.com/500"} alt="Post" />
          )}
        </div>
        <div className="details">
          <div className="card-header" style={{ borderBottom: "1px solid #00000029" }}>
            <div className="card-pic">
              <img src={item?.postedBy?.photo || "https://via.placeholder.com/150"} alt="profile" />
            </div>
            <h5>{item?.postedBy?.name || "Unknown User"}</h5>
            <div className="deletePost">
              <span className="material-symbols-outlined" onClick={() => removePost(item._id)}>delete</span>
            </div>
          </div>

          <div className="comment-section" style={{ borderBottom: "1px solid #00000029" }}>
            {item.comments?.length > 0 ? (
              item.comments.map((comment) => (
                <p className="comm" key={comment._id}>
                  <span className="commenter" style={{ fontWeight: "bolder" }}>
                    {comment.postedBy?.name || "Anonymous"}
                  </span>
                  <span style={{ margin: "0 5px" }}>:</span>
                  <span className="commentText">{comment.comment}</span>
                </p>
              ))
            ) : ( <p>No comments yet</p> )}
          </div>
          <div className="card-content">
            <p>{item.likes?.length || 0} Likes</p>
            <p>{item.body || "No description available"}</p>
          </div>
        </div>
      </div>
      <div className="close-comment">
        <span className="material-symbols-outlined material-symbols-outlined-comment" onClick={toggleDetails}>close</span>
      </div>
    </div>
  );
}