import React, { useEffect, useState } from 'react';
import '../css/profile.css'; // We'll reuse the same CSS
import { useParams } from "react-router-dom";

export default function UserProfile() {
  const { userid } = useParams();
  const [user, setUser] = useState(null);
  const [pic, setPic] = useState([]);
  const [isFollow, setIsFollow] = useState(false);

  const defaultProfilePic = "https://cdn-icons-png.flaticon.com/128/17231/17231410.png";
  
  // to follow user
  const followUser = (userId) => {
    fetch("/follow", {
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
        setIsFollow(true);
      });
  };

  // to unfollow user
  const unfollowUser = (userId) => {
    fetch("/unfollow", {
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
        setIsFollow(false);
      });
  };

  useEffect(() => {
    fetch(`http://localhost:5000/user/${userid}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
      .then((res) => res.json())
      .then((result) => {
        if (result && result.user) {
          setUser(result.user);
          setPic(result.posts || []);
          if (result.user.followers.includes(JSON.parse(localStorage.getItem("user"))._id)) {
            setIsFollow(true);
          }
        }
      })
      .catch((err) => {
        console.error("Error fetching user data:", err);
      });
  }, [isFollow, userid]);

  if (!user) {
    return <div style={{textAlign: "center", marginTop: "50px"}}><h1>Loading...</h1></div>;
  }

  return (
    <div className="profile">
      <div className="profile-container">
        {/* Profile Frame */}
        <div className="profile-frame">
          <div className="profile-pic">
            <img
            src={user.photo || defaultProfilePic}
              alt="profile"
            />
          </div>
          
          <div className="profile-data">
            <div className="profile-data-top">
              <h1>{user.name}</h1>
              <button
                className={isFollow ? "unfollowBtn" : "followBtn"}
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
            <div className="profile-info">
              <p><span>{pic.length}</span> posts</p>
              <p><span>{user.followers?.length || 0}</span> followers</p>
              <p><span>{user.following?.length || 0}</span> following</p>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="gallery">
          {pic.map((item) => (
            <div className="item" key={item._id}>
              {item.mediaType === 'video' ? (
                <video src={item.photo} muted />
              ) : (
                <img src={item.photo} alt="User Post" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}