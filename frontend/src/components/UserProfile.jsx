import React, { useEffect, useState } from "react";
import "../css/profile.css";
import { useParams } from "react-router-dom";
import FollowListModal from "./FollowListModal"; 
import PostDetail from "./PostDetail";

const API_BASE = process.env.REACT_APP_API_URL;

const sanitizeUrl = (url) => {
  if (url && url.startsWith("http://")) {
    return url.replace("http://", "https://");
  }
  return url;
};

export default function UserProfile() {
  const { userid } = useParams();
  const [user, setUser] = useState(null);
  const [pic, setPic] = useState([]);
  const [isFollow, setIsFollow] = useState(false);
  
  // State for modals
  const [show, setShow] = useState(false);
  const [posts, setPosts] = useState([]);
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [modalData, setModalData] = useState({ title: "", users: [] });

  const defaultProfilePic =
    "https://cdn-icons-png.flaticon.com/128/17231/17231410.png";
  const defaultBannerPic = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  const toggleDetails = (post) => {
    setShow(!show);
    if (!show) setPosts(post);
  };
  
  const followUser = (userId) => {
    fetch(`${API_BASE}/follow`, {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({ followId: userId }),
    })
      .then((res) => res.json())
      .then(() => {
          setIsFollow(true);
          // Optimistically update follower count
          setUser(prevUser => ({...prevUser, followers: [...prevUser.followers, {}]}));
      })
      .catch((err) => console.error("Error following:", err));
  };

  const unfollowUser = (userId) => {
    fetch(`${API_BASE}/unfollow`, {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({ followId: userId }),
    })
      .then((res) => res.json())
      .then(() => {
          setIsFollow(false);
          // Optimistically update follower count
          setUser(prevUser => ({...prevUser, followers: prevUser.followers.slice(0, -1)}));
      })
      .catch((err) => console.error("Error unfollowing:", err));
  };

  const showFollows = async (type) => {
    try {
      const response = await fetch(`${API_BASE}/user/${userid}/${type}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("jwt"),
        },
      });
      const data = await response.json();
      setModalData({
        title: type.charAt(0).toUpperCase() + type.slice(1),
        users: data,
      });
      setShowFollowModal(true);
    } catch (err) {
      console.error(`Error fetching ${type}:`, err);
    }
  };

  useEffect(() => {
    fetch(`${API_BASE}/user/${userid}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
      .then((res) => res.json())
      .then((result) => {
        if (result && result.user) {
          setUser(result.user);
          setPic(result.posts || []);
          if (
            result.user.followers.includes(
              JSON.parse(localStorage.getItem("user"))._id
            )
          ) {
            setIsFollow(true);
          }
        }
      })
      .catch((err) => {
        console.error("Error fetching user data:", err);
      });
  }, [userid]); // Rerun when the userid in the URL changes

  if (!user) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div className="profile">
      <div className="profile-container">
        <div 
          className="profile-banner"
          style={{ backgroundImage: `url(${sanitizeUrl(user.bannerPhoto) || defaultBannerPic})` }}
        >
          {/* No edit button here since it's not our profile */}
        </div>

        <div className="profile-frame">
          <div className="profile-pic">
            <img
              src={sanitizeUrl(user.photo) || defaultProfilePic}
              alt="profile"
            />
          </div>

          <div className="profile-data">
            <div className="profile-data-top">
              <h1>{user.name}</h1>
              <button
                className={isFollow ? "unfollowBtn" : "followBtn"}
                onClick={() =>
                  isFollow ? unfollowUser(user._id) : followUser(user._id)
                }
              >
                {isFollow ? "Unfollow" : "Follow"}
              </button>
            </div>
            <div className="profile-info">
              <p>
                <span>{pic.length}</span> posts
              </p>
              <p style={{ cursor: "pointer" }} onClick={() => showFollows("followers")}>
                <span>{user.followers?.length || 0}</span> followers
              </p>
              <p style={{ cursor: "pointer" }} onClick={() => showFollows("following")}>
                <span>{user.following?.length || 0}</span> following
              </p>
            </div>
          </div>
        </div>

        <div className="gallery">
          {pic.map((item) => (
            <div className="item" key={item._id} onClick={() => toggleDetails(item)}>
              {item.mediaType === "video" ? (
                <video src={sanitizeUrl(item.photo)} muted />
              ) : (
                <img src={sanitizeUrl(item.photo)} alt="User Post" />
              )}
            </div>
          ))}
        </div>
      </div>
      
      {show && <PostDetail item={posts} toggleDetails={toggleDetails} />}
      {showFollowModal && (
        <FollowListModal
          title={modalData.title}
          users={modalData.users}
          onClose={() => setShowFollowModal(false)}
        />
      )}
    </div>
  );
}