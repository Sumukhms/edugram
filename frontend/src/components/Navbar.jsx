import React, { useContext, useState } from "react";
import logo from "../img/logo.PNG";
import "../css/Navbar.css";
import { Link } from "react-router-dom";
import { LoginContext } from "../context/LoginContext";
import { useNavigate } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_URL;

export default function Navbar({ login }) {
  const navigate = useNavigate();
  const { setModalOpen } = useContext(LoginContext) || {};
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("jwt");
    }
    return null;
  };

  const fetchUsers = (query) => {
    setSearch(query);
    if (!query) {
      setSearchResults([]);
      return;
    }

    fetch(`${API_BASE}/search-users`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + getToken(),
      },
      body: JSON.stringify({ query }),
    })
      .then((res) => res.json())
      .then((results) => {
        setSearchResults(results.users);
      });
  };

  const loginStatus = () => {
    const token = getToken();

    if (login || token) {
      return (
        <>
          <Link to="/">
            <li>Home</li>
          </Link>
          <Link to="/profile">
            <li>Profile</li>
          </Link>
          <Link to="/createPost">
            <li>Create Post</li>
          </Link>
          <Link to="/followingpost">
            <li>My Following</li>
          </Link>
          <button
            className="primaryBtn"
            onClick={() => setModalOpen && setModalOpen(true)}
          >
            Log Out
          </button>
        </>
      );
    } else {
      return (
        <>
          <Link to="/signup">
            <li>Signup</li>
          </Link>
          <Link to="/signin">
            <li>Signin</li>
          </Link>
        </>
      );
    }
  };

  const loginStatusMobile = () => {
    const token = getToken();

    if (login || token) {
      return (
        <>
          <Link to="/">
            <li>
              <span className="material-symbols-outlined">home</span>
            </li>
          </Link>
          <Link to="/profile">
            <li>
              <span className="material-symbols-outlined">account_circle</span>
            </li>
          </Link>
          <Link to="/createPost">
            <li>
              <span className="material-symbols-outlined">add_box</span>
            </li>
          </Link>
          <Link to="/followingpost">
            <li>
              <span className="material-symbols-outlined">explore</span>
            </li>
          </Link>
          <li
            className="logout-mobile-btn"
            onClick={() => setModalOpen && setModalOpen(true)}
          >
            <span className="material-symbols-outlined">logout</span>
          </li>
        </>
      );
    } else {
      return (
        <>
          <Link to="/signup">
            <li>Signup</li>
          </Link>
          <Link to="/signin">
            <li>Signin</li>
          </Link>
        </>
      );
    }
  };

  // This check determines if the user is logged in
  const isLoggedIn = login || getToken();

  return (
    <div className="navbar">
      <img
        id="edu-logo"
        src={logo}
        alt="Logo"
        onClick={() => {
          if (window.location.pathname !== "/") navigate("/");
        }}
      />
      {/* Conditionally render the search container */}
      {isLoggedIn && (
        <div className="search-container">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => fetchUsers(e.target.value)}
          />
          {search && (
            <ul className="search-results">
              {searchResults.map((item) => (
                <li
                  key={item._id}
                  onClick={() => {
                    setSearch("");
                    setSearchResults([]);
                  }}
                >
                  <Link to={`/profile/${item._id}`}>
                    <div className="search-result-item">
                      <img
                        src={item.photo || "https://cdn-icons-png.flaticon.com/128/17231/17231410.png"}
                        alt="user"
                      />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <ul className="nav-menu">{loginStatus()}</ul>
      <ul className="nav-mobile">{loginStatusMobile()}</ul>
    </div>
  );
}