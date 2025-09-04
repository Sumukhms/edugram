import React, { useEffect, useState, useContext } from "react";
import { LoginContext } from "../context/LoginContext";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import Picker from "emoji-picker-react";
import "../css/Home.css";

const API_BASE = process.env.REACT_APP_API_URL;

const defaultProfilePic =
  "https://cdn-icons-png.flaticon.com/128/17231/17231410.png";
const defaultPostPic =
  "https://cdn-icons-png.flaticon.com/128/564/564619.png";

export default function Home() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [user, setUser] = useState(null);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [show, setShow] = useState(false);
  const [item, setItem] = useState(null);
  const [comments, setComments] = useState({});
  const [showPicker, setShowPicker] = useState(false);
  const [currentPostId, setCurrentPostId] = useState(null);
  const limit = 5;

  const fetchPosts = () => {
    setLoading(true);
    fetch(`${API_BASE}/allposts?limit=${limit}&skip=${skip}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
      .then((res) => {
        // Handle unauthorized access by navigating to signin
        if (res.status === 401) {
          navigate("/signin");
          return;
        }
        // Handle no posts found gracefully
        if (res.status === 404) {
          setData([]);
          setHasMore(false);
          setLoading(false);
          return;
        }
        return res.json();
      })
      .then((result) => {
        // Ensure result exists before processing
        if (!result) return;
        if (result.posts.length < limit) setHasMore(false);
        setData((prev) => [...prev, ...result.posts]);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching posts:", err);
        toast.error("Failed to load posts");
        setLoading(false);
      });
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      fetchPosts();
    } else {
      navigate("/signin");
    }
  }, [skip, navigate]);

  const onEmojiClick = (emojiObject) => {
    if (currentPostId) {
      setComments((prev) => ({
        ...prev,
        [currentPostId]: (prev[currentPostId] || "") + emojiObject.emoji,
      }));
    }
  };

  const likePost = (id) => {
    fetch(`${API_BASE}/like`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({ postId: id }),
    })
      .then((res) => res.json())
      .then((result) => {
        const newData = data.map((item) =>
          item._id === result._id ? result : item
        );
        setData(newData);
      })
      .catch(() => toast.error("Error liking post"));
  };

  const unlikePost = (id) => {
    fetch(`${API_BASE}/unlike`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({ postId: id }),
    })
      .then((res) => res.json())
      .then((result) => {
        const newData = data.map((item) =>
          item._id === result._id ? result : item
        );
        setData(newData);
      })
      .catch(() => toast.error("Error unliking post"));
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
      .then((result) => {
        const newData = data.map((item) =>
          item._id === result._id ? result : item
        );
        setData(newData);
      })
      .catch(() => toast.error("Error posting comment"));
  };

  const toggleComment = (post = null) => {
    setShow(!show);
    setItem(post);
  };

  const handleCommentChange = (postId, value) => {
    setComments((prev) => ({ ...prev, [postId]: value }));
  };

  if (error) return <div className="error">Error: {error}</div>;
  if (!user) return <div>Loading...</div>;

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
              <Link to={`/profile/${post.postedBy._id}`}>
                <h5>{post?.postedBy?.name || "Unknown User"}</h5>
              </Link>
            </div>

            <div className="card-image">
              {post.mediaType === "video" ? (
                <video src={post.photo} controls muted loop />
              ) : (
                <img src={post.photo || defaultPostPic} alt="Post" />
              )}
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
              <span
                className="material-symbols-outlined"
                onClick={() => {
                  setCurrentPostId(post._id);
                  setShowPicker((prev) => !prev);
                }}
              >
                mood
              </span>
              <input
                type="text"
                placeholder="Add a comment"
                value={comments[post._id] || ""}
                onChange={(e) =>
                  handleCommentChange(post._id, e.target.value)
                }
              />
              <button
                className="comment"
                onClick={() => makeComment(comments[post._id], post._id)}
              >
                Post
              </button>
              {showPicker && currentPostId === post._id && (
                  <div className="emoji-picker">
                    <Picker onEmojiClick={onEmojiClick} />
                  </div>
                )}
            </div>
          </div>
        ))
      )}

      {loading && <div>Loading...</div>}

      {show && item && (
        <div className="showComment">
          <div className="container">
            <div className="postPic">
              <img src={item.photo || defaultPostPic} alt="Post" />
            </div>
            <div className="details">
              <div
                className="card-header"
                style={{ borderBottom: "1px solid #00000029" }}
              >
                <div className="card-pic">
                  <img
                    src={item?.postedBy?.photo || defaultProfilePic}
                    alt="profile"
                  />
                </div>
                <h5>{item?.postedBy?.name || "Unknown User"}</h5>
              </div>

              <div
                className="comment-section"
                style={{ borderBottom: "1px solid #00000029" }}
              >
                {item.comments.map((comment) => (
                  <p className="comm" key={comment._id}>
                    <span
                      className="commenter"
                      style={{ fontWeight: "bolder" }}
                    >
                      {comment.postedBy.name}
                    </span>
                    <span style={{ margin: "0 5px" }}>:</span>
                    <span className="commentText">{comment.comment}</span>
                  </p>
                ))}
              </div>

              <div className="card-content">
                <p>{item.likes.length} Likes</p>
                <p>{item.body || "No description available"}</p>
              </div>

              <div className="add-comment">
                <span
                  className="material-symbols-outlined"
                  onClick={() => {
                    setCurrentPostId(item._id);
                    setShowPicker((prev) => !prev);
                  }}
                >
                  mood
                </span>
                <input
                  type="text"
                  placeholder="Add a comment"
                  value={comments[item._id] || ""}
                  onChange={(e) =>
                    handleCommentChange(item._id, e.target.value)
                  }
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
                {showPicker && currentPostId === item._id && (
                  <div className="emoji-picker">
                    <Picker onEmojiClick={onEmojiClick} />
                  </div>
                )}
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