import React, { useEffect, useState } from "react";
import "../css/profile.css";
import PostDetail from "../components/PostDetail";
import ProfilePic from "../components/ProfilePic";

const API_BASE = process.env.REACT_APP_API_URL;

const sanitizeUrl = (url) => {
  if (url && url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  return url;
};

export default function Profile() {
  const [pic, setPic] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [show, setShow] = useState(false);
  const [posts, setPosts] = useState([]);
  const [changePic, setChangePic] = useState(false);

  const defaultProfilePic =
    "https://cdn-icons-png.flaticon.com/128/17231/17231410.png";

  const toggleDetails = (post) => {
    setShow(!show);
    if (!show) setPosts(post);
  };

  const changeProfile = () => {
    setChangePic(!changePic);
  };

  const updateProfilePic = (newPic) => {
    setUser((prev) => ({
      ...prev,
      photo: newPic,
    }));
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
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user posts");
        return res.json();
      })
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

  if (loading) {
    return (
      <div
        className="loading"
        style={{ textAlign: "center", marginTop: "50px" }}
      >
        <h1>Loading profile...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="error"
        style={{ textAlign: "center", marginTop: "50px" }}
      >
        <h1>{error}</h1>
      </div>
    );
  }

  return (
    <div className="profile">
      <div className="profile-container">
        {/* Profile Frame */}
        <div className="profile-frame">
          <div className="profile-pic" onClick={changeProfile}>
            <img src={sanitizeUrl(user.photo) || defaultProfilePic} alt="profile" />
          </div>

          <div className="profile-data">
            <div className="profile-data-top">
              <h1>{user.name}</h1>
            </div>
            <div className="profile-info">
              <p>
                <span>{pic.length}</span> posts
              </p>
              <p>
                <span>{user.followers?.length || 0}</span> followers
              </p>
              <p>
                <span>{user.following?.length || 0}</span> following
              </p>
            </div>
          </div>
        </div>

        {/* Gallery */}
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
              <div className="post-overlay">
                <div className="overlay-info">
                  <span className="material-symbols-outlined">favorite</span>
                  {item.likes.length}
                </div>
                <div className="overlay-info">
                  <span className="material-symbols-outlined">chat_bubble</span>
                  {item.comments.length}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals remain outside the container */}
      {show && <PostDetail item={posts} toggleDetails={toggleDetails} />}
      {changePic && (
        <ProfilePic
          changeProfile={changeProfile}
          updateProfilePic={updateProfilePic}
        />
      )}
    </div>
  );
}
