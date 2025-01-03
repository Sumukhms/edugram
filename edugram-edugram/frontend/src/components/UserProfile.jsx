import React, { useEffect, useState } from 'react';
import './profile.css';
import PostDetail from './PostDetail';
import { useParams }  from "react-router-dom";

export default function UserProfile() {
    const {userid} =useParams()
  const [user, setUser] =useState("")
  const [pic, setPic] = useState([]);  // Initialize as an empty array
  const [postsCount, setPostsCount] = useState(0); // Count posts
  const [followersCount, setFollowersCount] = useState(0); // Count followers
  const [followingCount, setFollowingCount] = useState(0); // Count following
  const [posts, setPosts] = useState([]);  // Will hold selected post details

   useEffect(() => {
    // Get user info from localStorage
    const userData = JSON.parse(localStorage.getItem("user"));
    setUser(userData);

    // Fetch user posts
    fetch('http://localhost:5000/user/${userid}', {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
      .then(res => res.json())
      .then((result) => {
        // Ensure result is an array
        if (Array.isArray(result)) {
          setUser(result.user);
          setPosts(result.post);

          // Set followers and following count if userData is available
          if (userData) {
            setFollowersCount(userData.followers?.length || 0); // Adjust if needed
            setFollowingCount(userData.following?.length || 0); // Adjust if needed
          }
        } else {
          setPic([]);  // Reset to empty array if data is not an array
        }
      })
      .catch((err) => {
        console.error("Error fetching posts:", err);
        setPic([]);  // Reset to empty array on error
      });
  }, []);

  // Return loading state if user data is not yet available
  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile">
      {/* Profile frame */}
      <div className="profile-frame">
        <div className="profile-pic">
          <img
            src="https://plus.unsplash.com/premium_photo-1665663927587-a5b343dff128?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDE2fHx8ZW58MHx8fHx8"
            alt="profile"
          />
        </div>
        {/* Profile data */}
        <div className="profile-data">
          <h1>{user.name}</h1>
          <div className="profile-info" style={{ display: "flex" }}>
            <p>{postsCount} posts</p>
            <p>{followersCount} followers</p>
            <p>{followingCount} following</p>
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
      {/* Gallery */}
      <div className="gallery">
        {/* Ensure pic is an array before mapping */}
        {Array.isArray(pic) && pic.length > 0 ? (
          pic.map((item) => {
            return (
              <img
                key={item._id}
                src={item.photo}
                alt="User Post"
                className="item"
               // onClick={() => toggleDetails(item)}  // Pass the specific post here
              />
            );
          })
        ) : (
          <p>No posts available</p>
        )}
      </div>
      {/*show && 
      <PostDetail item={posts} toggleDetails={toggleDetails} />
      */}
    </div>
  );
}
