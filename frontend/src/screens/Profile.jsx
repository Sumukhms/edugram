import React, { useEffect, useState } from "react";
import "../css/profile.css";
import PostDetail from "../components/PostDetail";
import ProfilePic from "../components/ProfilePic";
import FollowListModal from "../components/FollowListModal";
import BannerPic from "../components/BannerPic"; // Import the new banner component

const API_BASE = process.env.REACT_APP_API_URL;

const sanitizeUrl = (url) => {
  if (url && url.startsWith("http://")) {
    return url.replace("http://", "https://");
  }
  return url;
};

export default function Profile() {
  const [pic, setPic] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState([]);
  
  // Modals state
  const [show, setShow] = useState(false);
  const [changePic, setChangePic] = useState(false);
  const [changeBanner, setChangeBanner] = useState(false);
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [modalData, setModalData] = useState({ title: "", users: [] });

  const defaultProfilePic =
    "https://cdn-icons-png.flaticon.com/128/17231/17231410.png";
  const defaultBannerPic = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  const toggleDetails = (post) => {
    setShow(!show);
    if (!show) setPosts(post);
  };

  const updateProfilePic = (newPic) => {
    setUser((prev) => ({ ...prev, photo: newPic, }));
  };
  
  const updateBannerPic = (newPic) => {
    setUser((prev) => ({ ...prev, bannerPhoto: newPic }));
  };

  const showFollows = async (type) => {
    try {
      const response = await fetch(`${API_BASE}/user/${user._id}/${type}`, {
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
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData) {
      setError("User not found. Please log in again.");
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/user/${userData._id}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
      .then((res) => res.json())
      .then((result) => {
        setPic(result.posts || []);
        setUser(result.user);
        setLoading(false);
      })
      .catch((err) => {
        setError("Error fetching user posts. Please try again later.");
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading || !user) {
    return <div className="loading" style={{ textAlign: "center", marginTop: "50px" }}><h1>Loading profile...</h1></div>;
  }
  if (error) {
    return <div className="error" style={{ textAlign: "center", marginTop: "50px" }}><h1>{error}</h1></div>;
  }

  return (
    <div className="profile">
      <div className="profile-container">
        <div 
          className="profile-banner"
          style={{ backgroundImage: `url(${sanitizeUrl(user.bannerPhoto) || defaultBannerPic})` }}
        >
          <button className="edit-banner-btn" onClick={() => setChangeBanner(true)}>
            <span className="material-symbols-outlined">edit</span>
          </button>
        </div>

        <div className="profile-frame">
          <div className="profile-pic" onClick={() => setChangePic(true)}>
            <img
              src={sanitizeUrl(user.photo) || defaultProfilePic}
              alt="profile"
            />
          </div>

          <div className="profile-data">
            <div className="profile-data-top">
              <h1>{user.name}</h1>
            </div>
            <div className="profile-info">
              <p><span>{pic.length}</span> posts</p>
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
            <div
              className="item"
              key={item._id}
              onClick={() => toggleDetails(item)}
            >
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
      {changePic && <ProfilePic changeProfile={() => setChangePic(false)} updateProfilePic={updateProfilePic}/>}
      {changeBanner && <BannerPic changeBanner={() => setChangeBanner(false)} updateBannerPic={updateBannerPic}/>}
      {showFollowModal && <FollowListModal title={modalData.title} users={modalData.users} onClose={() => setShowFollowModal(false)}/>}
    </div>
  );
}