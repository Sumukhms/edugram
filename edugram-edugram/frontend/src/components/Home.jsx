import React, { useEffect, useState } from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [comments, setComments] = useState({}); // Track comments per post
  const [show, setShow] = useState(false);
  const [item, setItem] = useState([]); // Currently selected post

  // Toast functions
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

    fetch("http://localhost:5000/allposts", {
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
      .catch((err) => {
        setError("Failed to fetch posts. Please try again later.");
        console.log(err);
      });
  }, [navigate]);

  const toggleComment = (posts) => {
    if (show) {
      setShow(false);
    } else {
      setShow(true);
      setItem(posts);
    }
  };

  const likePost = (id) => {
    fetch("http://localhost:5000/like", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({ postId: id }),
    })
      .then((res) => res.json())
      .then((result) => {
        const updatedPosts = data.map((posts) =>
          posts._id === result._id ? { ...posts, likes: result.likes } : posts
        );
        setData(updatedPosts);
      })
      .catch((err) => console.log(err));
  };

  const unlikePost = (id) => {
    fetch("http://localhost:5000/unlike", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({ postId: id }),
    })
      .then((res) => res.json())
      .then((result) => {
        const updatedPosts = data.map((posts) =>
          posts._id === result._id ? { ...posts, likes: result.likes } : posts
        );
        setData(updatedPosts);
      })
      .catch((err) => console.log(err));
  };

  const handleCommentChange = (postId, text) => {
    setComments((prevComments) => ({
      ...prevComments,
      [postId]: text,
    }));
  };

  const makeComment = (text, id) => {
    fetch("http://localhost:5000/comment", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({
        text: text,
        postId: id,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        const updatedPosts = data.map((posts) =>
          posts._id === result._id ? result : posts
        );
        setData(updatedPosts);
        setComments((prevComments) => ({
          ...prevComments,
          [id]: "", // Clear the comment input for this post
        }));
        notifyB("Comment posted");
      })
      .catch((err) => console.log(err));
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
        data.map((posts) => (
          <div className="card" key={posts._id}>
            <div className="card-header">
              <div className="card-pic">
                <img
                  src={posts?.postedBy?.photo || "https://via.placeholder.com/150"}
                  alt="profile"
                />
              </div>
              <h5>
                <Link to={`/profile/${posts.postedBy._id}`}>
                  {posts?.postedBy?.name || "Unknown User"}
                </Link>
              </h5>
            </div>
            <div className="card-image">
              <img src={posts.photo || "default-photo-url"} alt="Post" />
            </div>
            <div className="card-content">
              {posts.likes.includes(user._id) ? (
                <span
                  className="material-symbols-outlined material-symbols-outlined-red"
                  onClick={() => unlikePost(posts._id)}
                >
                  favorite
                </span>
              ) : (
                <span
                  className="material-symbols-outlined"
                  onClick={() => likePost(posts._id)}
                >
                  favorite
                </span>
              )}
              <p>{posts.likes.length} Likes</p>
              <p>{posts.body || "No description available"}</p>
              <p
                style={{ fontWeight: "bold", cursor: "pointer" }}
                onClick={() => toggleComment(posts)}
              >
                View all comments
              </p>
            </div>
            <div className="add-comment">
              <span className="material-symbols-outlined">mood</span>
              <input
                type="text"
                placeholder="Add a comment"
                value={comments[posts._id] || ""}
                onChange={(e) => handleCommentChange(posts._id, e.target.value)}
              />
              <button
                className="comment"
                onClick={() => makeComment(comments[posts._id], posts._id)}
              >
                Post
              </button>
            </div>
          </div>
        ))
      )}

      {/* Show Comments */}
      {show && (
        <div className="showComment">
          <div className="container">
            <div className="postPic">
              <img src={item.photo} alt="" />
            </div>
            <div className="details">
              <div className="card-header" style={{ borderBottom: "1px solid #00000029" }}>
                <div className="card-pic">
                  <img src="https://via.placeholder.com/150" alt="profile" />
                </div>
                <h5>{item?.postedBy?.name || "Unknown User"}</h5>
              </div>
              <div className="comment-section" style={{ borderBottom: "1px solid #00000029" }}>
                {item.comments.map((comment) => (
                  <p className="comm" key={comment._id}>
                    <span className="commenter" style={{ fontWeight: "bolder" }}>
                      {comment.postedBy.name}
                    </span>
                    <span style={{ margin: "0 5px" }}>:</span>
                    <span className="commentText">{comment.comment}</span>
                  </p>
                ))}
              </div>

              <div className="card-content">
                <p>{item.likes.length} Likes</p>
                <p>{item.body}</p>
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
