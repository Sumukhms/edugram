import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import Picker from "emoji-picker-react";
import "../css/Home.css";
import PostDetail from "../components/PostDetail";
import Suggestions from "../components/Suggestions";
import PostSkeleton from "../components/PostSkeleton"; // Import the new component

const API_BASE = process.env.REACT_APP_API_URL;

// ... (keep sanitizeUrl, defaultProfilePic, defaultPostPic functions here)
const sanitizeUrl = (url) => {
  if (url && url.startsWith("http://")) {
    return url.replace("http://", "https://");
  }
  return url;
};
const defaultProfilePic = "https://cdn-icons-png.flaticon.com/128/17231/17231410.png";
const defaultPostPic = "https://cdn-icons-png.flaticon.com/128/564/564619.png";


export default function Home() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [user, setUser] = useState(null);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  // ... (keep the rest of the state declarations)
  const [error, setError] = useState(null);
  const [show, setShow] = useState(false);
  const [item, setItem] = useState(null);
  const [comments, setComments] = useState({});
  const [showPicker, setShowPicker] = useState(false);
  const [currentPostId, setCurrentPostId] = useState(null);
  const limit = 5;


  // ... (keep all the functions: fetchPosts, useEffects, handleLoadMore, onEmojiClick, likePost, etc.)
  const fetchPosts = (isNewFetch = false) => {
    setLoading(true);
    fetch(`${API_BASE}/allposts?limit=${limit}&skip=${isNewFetch ? 0 : skip}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
      .then((res) => {
        if (res.status === 401) {
          navigate("/landing");
          return null;
        }
        if (res.status === 404) {
          setData([]);
          setHasMore(false);
          return null;
        }
        return res.json();
      })
      .then((result) => {
        if (!result) return;
        
        try {
          if (!Array.isArray(result.posts)) {
            throw new Error("Invalid response format - posts array missing");
          }
          
          setHasMore(result.posts.length === limit);
          setData((prev) => isNewFetch ? result.posts : [...prev, ...result.posts]);
          setError(null);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error fetching posts:", err);
        toast.error("Failed to load posts");
        setError("Network error while fetching posts");
        setLoading(false);
      });
  };
  
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      fetchPosts(true);
    } else {
      navigate("/landing");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  useEffect(() => {
    if (skip > 0) {
      fetchPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip]);

  // Infinite Scroll Implementation
  useEffect(() => {
    const handleScroll = () => {
      // Check if we hit the bottom of the page (with a 150px buffer)
      if (
        window.innerHeight + document.documentElement.scrollTop + 150 >= 
        document.documentElement.scrollHeight &&
        !loading && 
        hasMore
      ) {
        setSkip(prevSkip => prevSkip + limit);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  const onEmojiClick = (emojiObject) => {
    if (currentPostId) {
      setComments((prev) => ({
        ...prev,
        [currentPostId]: (prev[currentPostId] || "") + emojiObject.emoji,
      }));
    }
  };

  const likePost = (id) => {
    const heartIcon = document.querySelector(`.like-btn-${id}`);
    if (heartIcon) {
      heartIcon.classList.add("like-animation");
      setTimeout(() => {
        heartIcon.classList.remove("like-animation");
      }, 300);
    }

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
        setComments((prev) => ({ ...prev, [postId]: "" }));
        toast.success("Comment posted successfully!");
      })
      .catch(() => toast.error("Error posting comment"));
  };

  const savePost = (id) => {
    fetch(`${API_BASE}/save-post`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({ postId: id }),
    })
      .then((res) => res.json())
      .then((result) => {
        const updatedUser = { ...user, savedPosts: result.savedPosts };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        toast.success("Post saved!");
      })
      .catch((err) => console.log(err));
  };

  const unsavePost = (id) => {
    fetch(`${API_BASE}/unsave-post`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({ postId: id }),
    })
      .then((res) => res.json())
      .then((result) => {
        const updatedUser = { ...user, savedPosts: result.savedPosts };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        toast.success("Post removed from saved.");
      })
      .catch((err) => console.log(err));
  };

  const deletePost = (postId) => {
    if(window.confirm("Are you sure you want to delete this post?")) {
      fetch(`${API_BASE}/deletePost/${postId}`, {
        method: "delete",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("jwt"),
        },
      })
      .then((res) => res.json())
      .then((result) => {
        const newData = data.filter((item) => item._id !== postId);
        setData(newData);
        toast.success("Post deleted successfully");
      });
    }
  };

  const toggleComment = (post = null) => {
    setShow(!show);
    setItem(post);
  };

  const handleCommentChange = (postId, value) => {
    setComments((prev) => ({ ...prev, [postId]: value }));
  };
  

  if (error) return <div className="error-container"><h1>Error: {error}</h1></div>;
  if (!user) return null; // Or a general loading spinner

  return (
    <div className="home-layout">
      <div className="home-feed">
        {loading && data.length === 0 ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : data.length === 0 ? (
          <div className="loading-spinner"><h1>No posts to show.</h1></div>
        ) : (
          data.map((post) => (
            <div className="card" key={post._id}>
              {/* Card content remains the same */}
              <div className="card-header" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="card-pic">
                    <img
                      src={sanitizeUrl(post?.postedBy?.photo) || defaultProfilePic}
                      alt="profile"
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Link to={`/profile/${post.postedBy._id}`}>
                      <h5>{post?.postedBy?.name || "Unknown User"}</h5>
                    </Link>
                    <span style={{ fontSize: '12px', color: 'var(--secondary-text)', marginLeft: '12px', marginTop: '2px' }}>
                      {post.createdAt ? new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ""}
                    </span>
                  </div>
                </div>
                {post.postedBy._id === user._id && (
                  <span className="material-symbols-outlined" onClick={() => deletePost(post._id)} style={{ color: 'var(--error-color)' }} title="Delete Post">
                    delete
                  </span>
                )}
              </div>

              <div className="card-image" onDoubleClick={() => likePost(post._id)}>
                {post.mediaType === "video" ? (
                  <video src={sanitizeUrl(post.photo)} controls muted loop />
                ) : (
                  <img
                    src={sanitizeUrl(post.photo) || defaultPostPic}
                    alt="Post"
                  />
                )}
              </div>

              <div className="card-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    {post.likes.includes(user._id) ? (
                      <span
                        className={`material-symbols-outlined material-symbols-outlined-red like-btn-${post._id}`}
                        onClick={() => unlikePost(post._id)}
                      >
                        favorite
                      </span>
                    ) : (
                      <span
                        className={`material-symbols-outlined like-btn-${post._id}`}
                        onClick={() => likePost(post._id)}
                      >
                        favorite
                      </span>
                    )}
                    <span className="material-symbols-outlined" onClick={() => toggleComment(post)} style={{ marginLeft: '15px' }}>
                      chat_bubble_outline
                    </span>
                  </div>
                  <div>
                    {user.savedPosts?.includes(post._id) ? (
                      <span className="material-symbols-outlined" onClick={() => unsavePost(post._id)} style={{ color: 'var(--accent-color)' }}>
                        bookmark
                      </span>
                    ) : (
                      <span className="material-symbols-outlined" onClick={() => savePost(post._id)}>
                        bookmark_border
                      </span>
                    )}
                  </div>
                </div>
                <p>{post.likes.length} Likes</p>
                <p><strong>{post?.postedBy?.name}</strong> {post.body || ""}</p>
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
                  <div className="picker-container">
                    <Picker onEmojiClick={onEmojiClick} theme="dark" />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        
        {loading && data.length > 0 && <PostSkeleton />}
      </div>

      <div className="home-sidebar">
        <Suggestions />
      </div>

      {show && item && (
        <PostDetail item={item} toggleDetails={toggleComment} />
      )}
    </div>
  );
}