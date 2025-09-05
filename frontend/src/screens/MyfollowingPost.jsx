import React, { useEffect, useState } from "react";
import "../css/Home.css";
import "../css/EmptyState.css";
import "../css/Skeleton.css"; // Import the skeleton styles
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import Picker from "emoji-picker-react";
import PostSkeleton from "../components/PostSkeleton"; // Import the skeleton component

const API_BASE = process.env.REACT_APP_API_URL;

const defaultProfilePic =
  "https://cdn-icons-png.flaticon.com/128/17231/17231410.png";
const notifyA = (msg) => toast.error(msg);
const notifyB = (msg) => toast.success(msg);

const sanitizeUrl = (url) => {
  if (url && url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  return url;
};

export default function MyFollowingPost() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [comments, setComments] = useState({});
  const [show, setShow] = useState(false);
  const [item, setItem] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [currentPostId, setCurrentPostId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!token || !storedUser) {
      navigate("/signup");
      return;
    }

    setUser(storedUser);

    fetch(`${API_BASE}/myfollowingpost`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => res.json())
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, [navigate]);

  const onEmojiClick = (emojiObject) => {
    const currentComment = comments[currentPostId] || "";
    handleCommentChange(currentPostId, currentComment + emojiObject.emoji);
    setShowPicker(false);
  };

  const toggleComment = (posts) => {
    setShow(!show);
    setItem(posts);
  };

  const handleCommentChange = (postId, text) => {
    setComments((prev) => ({ ...prev, [postId]: text }));
  };

  const handleFetch = async (endpoint, method, body, callback) => {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
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
    handleFetch("/like", "put", { postId: id }, (result) => {
      setData((prevData) =>
        prevData.map((post) =>
          post._id === result._id ? { ...post, likes: result.likes } : post
        )
      );
    });
  };

  const unlikePost = (id) => {
    handleFetch("/unlike", "put", { postId: id }, (result) => {
      setData((prevData) =>
        prevData.map((post) =>
          post._id === result._id ? { ...post, likes: result.likes } : post
        )
      );
    });
  };

  const makeComment = (text, id) => {
    if (!text || !text.trim()) {
      return notifyA("Comment cannot be empty");
    }
    handleFetch("/comment", "put", { text, postId: id }, (result) => {
      setData((prevData) =>
        prevData.map((post) => (post._id === result._id ? result : post))
      );
      setComments((prev) => ({ ...prev, [id]: "" }));
      notifyB("Comment posted");
    });
  };

  // UPDATED LOADING STATE
  if (loading || !user) {
    return (
        <div className="home">
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
        </div>
    )
  }

  return (
    <div className="home">
      {data.length === 0 ? (
        <div className="empty-state-container">
            <h1>Nothing to see here yet</h1>
            <p>Posts from people you follow will show up here. Find some interesting people to follow!</p>
            <button className="empty-state-button" onClick={() => navigate('/')}>
                Find People to Follow
            </button>
        </div>
      ) : (
        data.map((post) => (
          <div className="card" key={post._id}>
            <div className="card-header">
              <div className="card-pic">
                <img
                  src={sanitizeUrl(post?.postedBy?.photo) || defaultProfilePic}
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
              {post.mediaType === "video" ? (
                <video src={sanitizeUrl(post.photo)} controls autoPlay muted loop />
              ) : (
                <img src={sanitizeUrl(post.photo)} alt="Post" />
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
                  setShowPicker(!showPicker);
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
                <div className="picker-container">
                  <Picker onEmojiClick={onEmojiClick} />
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}