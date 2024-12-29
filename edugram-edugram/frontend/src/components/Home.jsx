import React, { useEffect, useState } from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

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

  // Like the post
  const likePost = (id) => {
    if (!user) return;  // Prevent actions if no user is logged in
    
    const userId = user._id;
  
    // Check if the user has already liked the post
    const post = data.find((post) => post._id === id);
    if (post.likes.includes(userId)) {
      console.log("You have already liked this post");
      return; // Don't do anything if the user already liked the post
    }
  
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
        const updatedPosts = data.map((post) => {
          if (post._id === result._id) {
            return { ...post, likes: result.likes };
          }
          return post;
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
        const updatedPosts = data.map((post) => {
          if (post._id === result._id) {
            return { ...post, likes: result.likes };
          }
          return post;
        });
        setData(updatedPosts); // Update the posts data
        console.log(result);
      })
      .catch((err) => console.log(err));
  };

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
      {data.length === 0 ? (
        <div>No posts available</div>
      ) : (
        data.map((posts) => {
          return (
            <div className="card" key={posts._id}>
              <div className="card-header">
                <div className="card-pic">
                  <img
                    src={posts.postedBy?.photo || "default-profile-pic-url"}
                    alt="profile"
                  />
                </div>
                <h5>{posts.postedBy?.name || "Unknown User"}</h5>
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
              </div>
              <div className="add-comment">
                <span className="material-symbols-outlined">mood</span>
                <input type="text" placeholder="Add a comment" />
                <button className="comment">Post</button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
