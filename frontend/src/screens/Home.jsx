import React, { useEffect, useState } from "react";
import "../css/Home.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import Picker from 'emoji-picker-react';

export default function Home() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [comments, setComments] = useState({});
  const [show, setShow] = useState(false);
  const [item, setItem] = useState({});
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);

  // New state for emoji picker
  const [showPicker, setShowPicker] = useState(false);
  const [currentPostId, setCurrentPostId] = useState(null);

  const limit = 10;
  const token = localStorage.getItem("jwt");
  const defaultProfilePic = "https://cdn-icons-png.flaticon.com/128/17231/17231410.png";
  const defaultPostPic = "https://via.placeholder.com/150";

  const notifyA = (msg) => toast.error(msg);
  const notifyB = (msg) => toast.success(msg);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!token || !storedUser) {
      navigate("./signup");
      return;
    }
    fetchPosts();
    setUser(storedUser);

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const fetchPosts = () => {
    setLoading(true);
    fetch(`/allposts?limit=${limit}&skip=${skip}`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => res.json())
      .then((result) => {
        setLoading(false);
        if (Array.isArray(result)) {
          // New logic to prevent duplicates
          setData((prevData) => {
            const existingIds = new Set(prevData.map(p => p._id));
            const newPosts = result.filter(p => !existingIds.has(p._id));
            return [...prevData, ...newPosts];
          });
        } else {
          setError("Unexpected response format");
        }
      })
      .catch((err) => {
        setLoading(false);
        setError("Failed to fetch posts. Please try again later.");
        console.log(err);
      });
  };

  const handleScroll = () => {
    if (
      document.documentElement.clientHeight + window.pageYOffset >=
      document.documentElement.scrollHeight
    ) {
      setSkip((prevSkip) => prevSkip + 10);
    }
  };

  useEffect(() => {
    if (skip > 0) {
      fetchPosts();
    }
  }, [skip]);

  const toggleComment = (posts) => {
    setShow(!show);
    if (!show) {
      setItem(posts);
    }
  };

   const onEmojiClick = (emojiObject) => {
    const currentComment = comments[currentPostId] || "";
    handleCommentChange(currentPostId, currentComment + emojiObject.emoji);
    setShowPicker(false);
  };

  const likePost = (id) => {
    fetch("/like", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ postId: id }),
    })
      .then((res) => res.json())
      .then((result) => {
        const updatedPosts = data.map((post) =>
          post._id === result._id ? { ...post, likes: result.likes } : post
        );
        setData(updatedPosts);
      })
      .catch((err) => console.log(err));
  };

  const unlikePost = (id) => {
    fetch("/unlike", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ postId: id }),
    })
      .then((res) => res.json())
      .then((result) => {
        const updatedPosts = data.map((post) =>
          post._id === result._id ? { ...post, likes: result.likes } : post
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
    fetch("/comment", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        text,
        postId: id,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        const updatedPosts = data.map((post) =>
          post._id === result._id ? result : post
        );
        setData(updatedPosts);
        setComments((prevComments) => ({
          ...prevComments,
          [id]: "",
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
              {post.mediaType === 'video' ? (
                <video src={post.photo} controls autoPlay muted loop />
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
              <span className="material-symbols-outlined" onClick={() => {
              setCurrentPostId(post._id);
              setShowPicker(!showPicker);
            }}>mood</span>
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

      {show && (
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
                <span className="material-symbols-outlined">mood</span>
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
