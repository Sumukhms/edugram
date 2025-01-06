import React, { useEffect, useState } from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

export default function MyFollowingPost() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [comments, setComments] = useState({});
  const [show, setShow] = useState(false);
  const [item, setItem] = useState(null);

  const defaultProfilePic = "https://cdn-icons-png.flaticon.com/128/17231/17231410.png";
  const notifyA = (msg) => toast.error(msg);
  const notifyB = (msg) => toast.success(msg);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!token || !storedUser) {
      navigate("/signup");
      return;
    }

    setUser(storedUser);

    fetch("http://localhost:5000/myfollowingpost", {
      headers: {
        Authorization: "Bearer " + token,
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
      .catch(() => {
        setError("Failed to fetch posts. Please try again later.");
      });
  }, [navigate]);

  const toggleComment = (posts) => {
    setShow(!show);
    setItem(posts);
  };

  const handleCommentChange = (postId, text) => {
    setComments((prev) => ({
      ...prev,
      [postId]: text,
    }));
  };

  const handleFetch = async (url, method, body, callback) => {
    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("jwt"),
        },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      callback(result);
    } catch {
      notifyA("Something went wrong. Please try again.");
    }
  };

  const likePost = (id) => {
    handleFetch(
      "http://localhost:5000/like",
      "PUT",
      { postId: id },
      (result) => {
        setData((prevData) =>
          prevData.map((post) =>
            post._id === result._id ? { ...post, likes: result.likes } : post
          )
        );
      }
    );
  };

  const unlikePost = (id) => {
    handleFetch(
      "http://localhost:5000/unlike",
      "PUT",
      { postId: id },
      (result) => {
        setData((prevData) =>
          prevData.map((post) =>
            post._id === result._id ? { ...post, likes: result.likes } : post
          )
        );
      }
    );
  };

  const makeComment = (text, id) => {
    if (!text.trim()) {
      notifyA("Comment cannot be empty");
      return;
    }
    handleFetch(
      "http://localhost:5000/comment",
      "PUT",
      { text, postId: id },
      (result) => {
        setData((prevData) =>
          prevData.map((post) => (post._id === result._id ? result : post))
        );
        setComments((prev) => ({ ...prev, [id]: "" }));
        notifyB("Comment posted");
      }
    );
  };

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="home">
      {data.length === 0 ? (
        <div>No posts available</div>
      ) : (
        data.map((post) => (
          <div className="card" key={post._id}>
            <div className="card-header">
              <div className="card-pic">
                <img
                  src={post?.postedBy?.photo || defaultProfilePic}
                  alt="profile"
                />
              </div>
              <h5>
                <Link to={`/profile/${post.postedBy._id}`}>
                  {post?.postedBy?.name || "Unknown User"}
                </Link>
              </h5>
            </div>
            <div className="card-image">
              <img src={post.photo || "https://via.placeholder.com/150"} alt="Post" />
            </div>
            <div className="card-content">
              {post.likes.includes(user._id) ? (
                <span
                  className="material-symbols-outlined material-symbols-outlined-red"
                  onClick={() => unlikePost(post._id)}
                >
                  favorite
                </span>
              ) : (
                <span
                  className="material-symbols-outlined"
                  onClick={() => likePost(post._id)}
                >
                  favorite
                </span>
              )}
              <p>{post.likes.length} Likes</p>
              <p>{post.body || "No description available"}</p>
              <p
                style={{ fontWeight: "bold", cursor: "pointer" }}
                onClick={() => toggleComment(post)}
              >
                View all comments
              </p>
            </div>
            <div className="add-comment">
              <span className="material-symbols-outlined">mood</span>
              <input
                type="text"
                placeholder="Add a comment"
                value={comments[post._id] || ""}
                onChange={(e) => handleCommentChange(post._id, e.target.value)}
              />
              <button
                className="comment"
                onClick={() => makeComment(comments[post._id], post._id)}
              >
                Post
              </button>
            </div>
          </div>
        ))
      )}

      {show && item && (
        <div className="showComment">
          <div className="container">
            <div className="postPic">
              <img src={item.photo || "https://via.placeholder.com/150"} alt="" />
            </div>
            <div className="details">
              <div className="card-header" style={{ borderBottom: "1px solid #00000029" }}>
                <div className="card-pic">
                  <img src={item.postedBy?.photo || "https://via.placeholder.com/150"} alt="profile" />
                </div>
                <h5>{item?.postedBy?.name || "Unknown User"}</h5>
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
                ) : (
                  <p>No comments yet.</p>
                )}
              </div>
              <div className="card-content">
                <p>{item.likes.length} Likes</p>
                <p>{item.body || "No description available"}</p>
              </div>
              <div className="add-comment">
                <span className="material-symbols-outlined">mood</span>
                <input
                  type="text"
                  placeholder="Add a comment"
                  value={comments[item._id] || ""}
                  onChange={(e) => handleCommentChange(item._id, e.target.value)}
                />
                <button
                  className="comment"
                  onClick={() => {
                    makeComment(comments[item._id], item._id);
                    toggleComment();
                  }}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
          <div className="close-comment">
            <span
              className="material-symbols-outlined material-symbols-outlined-comment"
              onClick={() => toggleComment()}
            >
              close
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
