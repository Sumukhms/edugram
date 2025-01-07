import React, { useContext } from "react";
import logo from "../img/logo.PNG";
import "../css/Navbar.css";
import { Link } from "react-router-dom";
import { LoginContext } from "../context/LoginContext";
import { useNavigate } from "react-router-dom";

export default function Navbar({ login }) {
  const navigate = useNavigate();
  const { setModalOpen } = useContext(LoginContext) || {};

  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("jwt");
    }
    return null;
  };

  const loginStatus = () => {
    const token = getToken();

    if (login || token) {
      return (
        <>
          <Link to="/profile">
            <li>Profile</li>
          </Link>
          <Link to="/createPost">
            <li>Create Post</li>
          </Link>
          <Link to="/followingpost" style={{ marginLeft: "20px" }}>
            <li>My Following</li>
          </Link>
          <button
            className="primaryBtn"
            onClick={() => setModalOpen && setModalOpen(true)}
            style={{ marginLeft: "20px" }}
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
            <span className="material-symbols-outlined">home</span>
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
          <Link to="/followingpost" style={{ marginLeft: "20px" }}>
            <li>
              <span className="material-symbols-outlined">explore</span>
            </li>
          </Link>
          <li
            className="logout-mobile-btn"
            onClick={() => setModalOpen && setModalOpen(true)}
            style={{ marginLeft: "20px" }}
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
      <ul className="nav-menu">{loginStatus()}</ul>
      <ul className="nav-mobile">{loginStatusMobile()}</ul>
    </div>
  );
}
