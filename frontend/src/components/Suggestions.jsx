import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/Suggestions.css';

const API_BASE = process.env.REACT_APP_API_URL;
const defaultProfilePic = "https://cdn-icons-png.flaticon.com/128/17231/17231410.png";

const sanitizeUrl = (url) => {
    if (url && url.startsWith('http://')) {
        return url.replace('http://', 'https://');
    }
    return url;
};

export default function Suggestions() {
    const [currentUser, setCurrentUser] = useState(null);
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        const loggedInUser = JSON.parse(localStorage.getItem("user"));
        setCurrentUser(loggedInUser);

        fetch(`${API_BASE}/user-suggestions`, {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            }
        })
        .then(res => res.json())
        .then(data => {
            if (data.users) {
                setSuggestions(data.users);
            }
        })
        .catch(err => console.error(err));

    }, []);

    if (!currentUser) {
        return null; // Don't render if no user is logged in
    }

    return (
        <div className="suggestions-container">
            <div className="current-user-profile">
                <img src={sanitizeUrl(currentUser.photo) || defaultProfilePic} alt="Your profile" />
                <div className="current-user-info">
                    <Link to="/profile">
                        <strong>{currentUser.name}</strong>
                    </Link>
                    <span className='secondary-text'>Welcome to Edugram</span>
                </div>
            </div>

            <div className="suggestions-list">
                <h4 className="suggestions-title">Suggested for you</h4>
                {suggestions.map(user => (
                    <div className="suggestion-item" key={user._id}>
                        <img src={sanitizeUrl(user.photo) || defaultProfilePic} alt={user.name} />
                        <div className="suggestion-user-info">
                             <Link to={`/profile/${user._id}`}>
                                <strong>{user.name}</strong>
                            </Link>
                        </div>
                        <Link to={`/profile/${user._id}`} className="view-profile-link">View</Link>
                    </div>
                ))}
            </div>
        </div>
    );
}