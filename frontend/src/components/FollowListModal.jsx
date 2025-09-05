import React from "react";
import { Link } from "react-router-dom";
import "../css/Modal.css"; // We can reuse some styles

const sanitizeUrl = (url) => {
  if (url && url.startsWith("http://")) {
    return url.replace("http://", "https://");
  }
  return url;
};

const defaultProfilePic =
  "https://cdn-icons-png.flaticon.com/128/17231/17231410.png";

export default function FollowListModal({ title, users, onClose }) {
  if (!users) {
    return null;
  }

  return (
    <div className="darkBg" onClick={onClose}>
      <div className="modal centered" onClick={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <h5 className="heading">{title}</h5>
        </div>
        <button className="closeBtn" onClick={onClose}>
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="modalContent" style={{ textAlign: "left" }}>
          {users.length === 0 ? (
            <p>No users to display.</p>
          ) : (
            users.map((user) => (
              <div
                key={user._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <img
                  src={sanitizeUrl(user.photo) || defaultProfilePic}
                  alt="profile"
                  style={{
                    width: "35px",
                    height: "35px",
                    borderRadius: "50%",
                    marginRight: "10px",
                  }}
                />
                <Link to={`/profile/${user._id}`} onClick={onClose}>
                  <span style={{ fontWeight: "bold" }}>{user.name}</span>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}