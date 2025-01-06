import React, { useEffect, useState } from "react";
import "./profile.css";
import PostDetail from "./PostDetail";
import ProfilePic from "./ProfilePic";

export default function Profile() {
  const [pic, setPic] = useState([]); // Store posts
  const [user, setUser] = useState(null); // Store user info
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [show, setShow] = useState(false); // Toggle post details
  const [posts, setPosts] = useState([]); // Specific post details
  const [changePic, setChangePic] = useState(false); // Toggle profile pic modal

  // Default profile picture
  const defaultProfilePic = "https://cdn-icons-png.flaticon.com/128/17231/17231410.png";

  // Toggle Post Details
  const toggleDetails = (post) => {
    setShow(!show);
    if (!show) setPosts(post); // Pass specific post details
  };

  // Toggle Profile Picture Modal
  const changeProfile = () => {
    setChangePic(!changePic);
  };

  // Update Profile Picture Callback
  const updateProfilePic = (newPic) => {
    setUser((prev) => ({
      ...prev,
      photo: newPic, // Update the user's profile picture URL
    }));
  };

  // Fetch user data and posts
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData) {
      setError("User not found. Please log in again.");
      setLoading(false);
      return;
    }

    setUser(userData);

    fetch(`http://localhost:5000/user/${userData._id}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user posts");
        return res.json();
      })
      .then((result) => {
        setPic(result.posts || []); // Ensure result.posts is an array
        setUser(result.user); // Set user data, which includes the photo
        setLoading(false); // Stop loading
      })
      .catch((err) => {
        setError("Error fetching user posts. Please try again later.");
        console.error(err);
        setLoading(false);
      });
  }, []); // Make sure this effect runs only once when the component mounts

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className={`profile ${show || changePic ? "active" : ""}`}>
      {/* Profile Frame */}
      <div className="profile-frame">
        <div className="profile-pic">
          {/* Display the photo from user data or default */}
          <img
            src={user.photo || defaultProfilePic}
            onClick={changeProfile}
            alt="profile"
          />
        </div>
        {/* Profile Data */}
        <div className="profile-data">
          <h1>{user.name}</h1>
          <div className="profile-info" style={{ display: "flex" }}>
            <p>{pic.length} posts</p>
            <p>{user.followers?.length || 0} followers</p>
            <p>{user.following?.length || 0} following</p>
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
        {pic.length > 0 ? (
          pic.map((item) => (
            <img
              key={item._id}
              src={item.photo}
              alt="User Post"
              className="item"
              onClick={() => toggleDetails(item)}
            />
          ))
        ) : (
          <p>No posts available</p>
        )}
      </div>
      {/* Post Details Modal */}
      {show && <PostDetail item={posts} toggleDetails={toggleDetails} />}
      {/* Profile Picture Modal */}
      {changePic && (
        <ProfilePic
          changeProfile={changeProfile}
          updateProfilePic={updateProfilePic}
        />
      )}
    </div>
  );
}
