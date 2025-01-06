import React, { useEffect, useState } from 'react';
import '../css/profile.css';
import { useParams } from "react-router-dom";

export default function UserProfile() {
  const { userid } = useParams(); // Get userId from the URL
  const [user, setUser] = useState(null); // Store user data
  const [pic, setPic] = useState([]); // Store user posts
  const [postsCount, setPostsCount] = useState(0); // Count user posts
  const [isFollow, setIsFollow] = useState(false); // To check if the current user follows

  // Default profile picture
  const defaultProfilePic = "https://cdn-icons-png.flaticon.com/128/17231/17231410.png";
  
  // Function to follow user
  const followUser = (userId) => {
    fetch("http://localhost:5000/follow", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({
        followId: userId
      })
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setIsFollow(true);
      })
      .catch((err) => console.log("Error following user:", err));
  };

  // Function to unfollow user
  const unfollowUser = (userId) => {
    fetch("http://localhost:5000/unfollow", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({
        followId: userId
      })
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setIsFollow(false);
      })
      .catch((err) => console.log("Error unfollowing user:", err));
  };

  // Fetch user data on component mount and when `userid` or `isFollow` changes
  useEffect(() => {
    console.log(`Fetching data for userId: ${userid}`); // Log userId

    // Check if jwt is present in localStorage
    console.log("JWT Token:", localStorage.getItem("jwt"));
    
    fetch(`http://localhost:5000/user/${userid}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
      .then((res) => res.json()) // Parse the response to JSON
      .then((result) => {
        console.log("Fetched user data:", result); // Log result for debugging
        if (result && result.user) {
          setUser(result.user); // Set user data
          setPic(result.posts || []); // Set posts or empty array
          setPostsCount(result.posts?.length || 0); // Set post count
          if (result.user.followers.includes(JSON.parse(localStorage.getItem("user"))._id)) {
            setIsFollow(true);
          }
        }
      })
      .catch((err) => {
        console.error("Error fetching user data:", err); // Log errors
      });
  }, [userid, isFollow]); // Run when userId or follow state changes

  const handleNameClick = () => {
    if (user && user._id) {
      alert(`User ID: ${user._id}`);
    }
  };

  // Return loading state until user data is available
  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile">
      <div className="profile-frame">
        <div className="profile-pic">
          <img
           src={user.photo || defaultProfilePic}
            alt="profile"
          />
        </div>
        <div className="profile-data">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h1>{user.name}</h1>
            <button
              className="followBtn"
              onClick={() => {
                if (isFollow) {
                  unfollowUser(user._id);
                } else {
                  followUser(user._id);
                }
              }}
            >
              {isFollow ? "Unfollow" : "Follow"}
            </button>
          </div>
          <div className="profile-info" style={{ display: "flex" }}>
            <p>{postsCount} posts</p>
            <p>{user.followers?.length} followers</p> {/* Dynamically show followers count */}
            <p>{user.following?.length} following</p> {/* Dynamically show following count */}
          </div>
        </div>
      </div>

      <hr
        style={{
          width: "90%",
          margin: "auto",
          opacity: "0.8",
          margin: "25px auto",
        }}
      />

      <div className="gallery">
        {Array.isArray(pic) && pic.length > 0 ? (
          pic.map((item) => (
            <img
              key={item._id}
              src={item.photo}
              alt="User Post"
              className="item"
            />
          ))
        ) : (
          <p>No posts available</p>
        )}
      </div>
    </div>
  );
}
