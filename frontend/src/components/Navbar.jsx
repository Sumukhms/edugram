import React, { useContext } from "react";
import logo from "../img/logo.PNG";
import "./Navbar.css";
import { Link } from "react-router-dom";
import { LoginContext } from "../context/LoginContext";

export default function Navbar({ login }) {
  const { setModalOpen } = useContext(LoginContext);

  const loginStatus = () => {
    const token = localStorage.getItem("jwt");

    if (login || token) {
      return (
        <React.Fragment>
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
            onClick={() => setModalOpen(true)}
            style={{ marginLeft: "20px" }}
          >
            Log Out
          </button>
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          <Link to="/signup">
            <li>Signup</li>
          </Link>
          <Link to="/signin">
            <li>Signin</li>
          </Link>
        </React.Fragment>
      );
    }
  };

  return (
    <div className="navbar">
      <img src={logo} alt="Logo" />
      <ul className="nav-menu">{loginStatus()}</ul>
    </div>
  );
}
