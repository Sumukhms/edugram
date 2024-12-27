import React, { useEffect, useState } from 'react';
import "./Home.css";
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      navigate("/signup"); // Use absolute path
      return;
    }

    // Fetching all posts
    fetch("http://localhost:5000/allposts", {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch posts");
        }
        return res.json();
      })
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [navigate]);

  return (
    <div className="home">
      {loading ? (
        <p>Loading posts...</p>
      ) : data.length === 0 ? (
        <p>No posts available</p>
      ) : (
        data.map((post) => (
          <div className="card" key={post._id}>
            {/* Card Header */}
            <div className="card-header">
              <div className="card-pic">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D"
                  alt="Profile"
                />
              </div>
              <h5>{post.postedBy?.name || "Unknown"}</h5>
            </div>

            {/* Card Image */}
            <div className="card-image">
              <img src={post.photo} alt="Post" />
            </div>

            {/* Card Content */}
            <div className="card-content">
              <span className="material-symbols-outlined">favorite</span>
              <p>{post.likes?.length || 0} Likes</p>
              <p>{post.body}</p>
            </div>

            {/* Add Comment */}
            <div className="add-comment">
              <span className="material-symbols-outlined">mood</span>
              <input type="text" placeholder="Add a comment" />
              <button className="comment">Post</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
