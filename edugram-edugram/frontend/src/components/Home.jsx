import React, { useEffect, useState } from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      navigate("./signup");
    }

    fetch("http://localhost:5000/allposts", {
      headers: {
        "Authorization": "Bearer " + token,
      },
    })
      .then((res) => res.json())
      .then((result) => {
        console.log("Fetched posts:", result);
        if (Array.isArray(result)) {
          setData(result);
        } else {
          console.error("Unexpected response format:", result);
        }
      })
      .catch((err) => console.log(err));
  }, [navigate]);

  const likePost = (id) => {
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
        console.log("Updated post (like):", result);
        const newData = data.map((post) =>
          post._id === result._id ? result : post
        );
        setData(newData);
      });
  };

  const unlikePost = (id) => {
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
        console.log("Updated post (unlike):", result);
        const newData = data.map((post) =>
          post._id === result._id ? result : post
        );
        setData(newData);
      });
  };

  if (!Array.isArray(data)) {
    return <div>No posts available</div>;
  }

  return (
    <div className="home">
      {data.map((post) => (
        <div className="card" key={post._id}>
          <div className="card-header">
            <div className="card-pic">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D"
                alt=""
              />
            </div>
            <h5>{post.postedBy?.name || "Unknown User"}</h5>
          </div>
          <div className="card-image">
            <img src={post.photo || "default-photo-url"} alt="Post" />
          </div>
          <div className="card-content">
            {post.likes.includes(JSON.parse(localStorage.getItem("user"))._id) ? (
              <span
                className="material-symbols-outlined material-symbols-outilned-red"
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
          </div>
          <div className="add-comment">
            <span className="material-symbols-outlined">mood</span>
            <input type="text" placeholder="Add a comment" />
            <button className="comment">Post</button>
          </div>
        </div>
      ))}
    </div>
  );
}
