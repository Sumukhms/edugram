import React, { useState } from "react";
import "../css/PostDetail.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function PostDetail({ item, toggleDetails }) {
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_URL;
  const [comment, setComment] = useState("");

  const sanitizeUrl = (url) => {
    if (url && url.startsWith("http://")) {
      return url.replace("http://", "https://");
    }
    return url;
  };

  const makeComment = (text, postId) => {
    fetch(`${API_BASE}/comment`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({ postId, text }),
    })
      .then((res) => res.json())
      .then(() => {
        setComment(""); // Clear input
        toast.success("Comment posted successfully!");
        // Note: This won't visually update the open modal. A more complex state management solution would be needed.
        // For now, we just close it to see the update on the main feed.
        toggleDetails();
      })
      .catch(() => toast.error("Error posting comment"));
  };

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
        toggleDetails(); // Close the modal
        navigate("/"); // Navigate to home
        toast.success("Post deleted successfully!");
      } catch (error) {
        console.error("Error deleting post:", error);
        toast.error("Failed to delete the post.");
      }
    }
  };

  if (!item) return <div>Loading...</div>;
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="showComment">
      <div className="container">
        <div className="postPic">
          {item.mediaType === "video" ? (
            <video src={sanitizeUrl(item.photo)} controls autoPlay muted loop />
          ) : (
            <img
              src={sanitizeUrl(item.photo) || "https://via.placeholder.com/500"}
              alt="Post"
            />
          )}
        </div>
        <div className="details">
          <div
            className="card-header"
            style={{ borderBottom: "1px solid #00000029" }}
          >
            <div className="card-pic">
              <img
                src={
                  sanitizeUrl(item?.postedBy?.photo) ||
                  "https://via.placeholder.com/150"
                }
                alt="profile"
              />
            </div>
            <h5>{item?.postedBy?.name || "Unknown User"}</h5>
            {item.postedBy._id === user._id && (
              <div className="deletePost">
                <span
                  className="material-symbols-outlined"
                  onClick={() => removePost(item._id)}
                >
                  delete
                </span>
              </div>
            )}
          </div>

          <div
            className="comment-section"
            style={{ borderBottom: "1px solid #00000029" }}
          >
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
            ) : (
              <p>No comments yet</p>
            )}
          </div>
          <div className="card-content">
            <p>{item.likes?.length || 0} Likes</p>
            <p>{item.body || "No description available"}</p>
          </div>
          <div className="add-comment">
            <span className="material-symbols-outlined">mood</span>
            <input
              type="text"
              placeholder="Add a comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button
              className="comment"
              onClick={() => makeComment(comment, item._id)}
            >
              Post
            </button>
          </div>
        </div>
      </div>
      <div className="close-comment" onClick={toggleDetails}>
        <span className="material-symbols-outlined material-symbols-outlined-comment">
          close
        </span>
      </div>
    </div>
  );
}