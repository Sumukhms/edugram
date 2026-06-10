import React, { useEffect, useState } from "react";
import "../css/profile.css";
import "../css/EmptyState.css";
import PostDetail from "../components/PostDetail";
import ProfilePic from "../components/ProfilePic";
import FollowListModal from "../components/FollowListModal";
import BannerPic from "../components/BannerPic";
import { useNavigate } from "react-router-dom";
import ProfileSkeleton from "../components/ProfileSkeleton"; // Import the new component

// ... (keep sanitizeUrl, API_BASE, etc.)
const API_BASE = process.env.REACT_APP_API_URL;

const sanitizeUrl = (url) => {
  if (url && url.startsWith("http://")) {
    return url.replace("http://", "https://");
  }
  return url;
};


export default function Profile() {
  const navigate = useNavigate();
  // ... (keep all the state declarations)
  const [pic, setPic] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState([]);
  const [show, setShow] = useState(false);
  const [changePic, setChangePic] = useState(false);
  const [changeBanner, setChangeBanner] = useState(false);
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [modalData, setModalData] = useState({ title: "", users: [] });
  const [activeTab, setActiveTab] = useState("posts");
  const [savedPosts, setSavedPosts] = useState([]);
  
  // ... (keep all constant declarations and functions)
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
      .then((res) => {
        if (res.status === 401) {
          localStorage.clear();
          navigate("/landing");
          return null;
        }
        return res.json();
      })
      .then((result) => {
        if (!result) return;
        setPic(result.posts || []);
        setUser(result.user);
        setLoading(false);
      })
      .catch((err) => {
        setError("Error fetching user posts. Please try again later.");
        console.error(err);
        setLoading(false);
      });
  }, [navigate]);

  useEffect(() => {
    if (activeTab === "saved") {
      setLoading(true);
      fetch(`${API_BASE}/saved-posts`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("jwt"),
        },
      })
      .then(res => res.json())
      .then(result => {
        setSavedPosts(result.posts || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [activeTab]);

  // UPDATED LOADING CHECK
  if (loading || !user) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return <div className="error" style={{ textAlign: "center", marginTop: "50px" }}><h1>{error}</h1></div>;
  }

  return (
    <div className="profile">
        {/* ... (rest of the return statement is unchanged) ... */}
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

        <div className="profile-tabs" style={{ display: 'flex', justifyContent: 'center', borderTop: '1px solid var(--border-color)', marginTop: '20px', gap: '50px' }}>
          <div 
            onClick={() => setActiveTab("posts")} 
            style={{ padding: '15px 0', cursor: 'pointer', borderTop: activeTab === 'posts' ? '2px solid var(--primary-text)' : 'none', color: activeTab === 'posts' ? 'var(--primary-text)' : 'var(--secondary-text)', fontWeight: activeTab === 'posts' ? 'bold' : 'normal', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>grid_on</span> POSTS
          </div>
          <div 
            onClick={() => setActiveTab("saved")} 
            style={{ padding: '15px 0', cursor: 'pointer', borderTop: activeTab === 'saved' ? '2px solid var(--primary-text)' : 'none', color: activeTab === 'saved' ? 'var(--primary-text)' : 'var(--secondary-text)', fontWeight: activeTab === 'saved' ? 'bold' : 'normal', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>bookmark_border</span> SAVED
          </div>
        </div>

        <div className="gallery-section">
          {activeTab === "posts" ? (
            pic.length > 0 ? (
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
            ) : (
              <div className="empty-state-container profile-empty-state">
                  <h1>Share Your Knowledge</h1>
                  <p>You haven't posted anything yet. Click the button below to create your first post!</p>
                  <button className="empty-state-button" onClick={() => navigate('/createPost')}>
                      Create Your First Post
                  </button>
              </div>
            )
          ) : (
            savedPosts.length > 0 ? (
              <div className="gallery">
                {savedPosts.map((item) => (
                  <div
                    className="item"
                    key={item._id}
                    onClick={() => toggleDetails(item)}
                  >
                    {item.mediaType === "video" ? (
                      <video src={sanitizeUrl(item.photo)} muted />
                    ) : (
                      <img src={sanitizeUrl(item.photo)} alt="Saved Post" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state-container profile-empty-state">
                  <h1>No Saved Posts</h1>
                  <p>When you save a post, it will appear here. Only you can see what you've saved.</p>
              </div>
            )
          )}
        </div>
      </div>

      {show && <PostDetail item={posts} toggleDetails={toggleDetails} />}
      {changePic && <ProfilePic changeProfile={() => setChangePic(false)} updateProfilePic={updateProfilePic}/>}
      {changeBanner && <BannerPic changeBanner={() => setChangeBanner(false)} updateBannerPic={updateBannerPic}/>}
      {showFollowModal && <FollowListModal title={modalData.title} users={modalData.users} onClose={() => setShowFollowModal(false)}/>}
    </div>
  );
}