import React from 'react'
import logo from '../img/logo.PNG'
import './Navbar.css'
import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <div className='navbar'>
        <img src={logo} alt="" />
        <ul>
          <Link to="/signup">
            <li>Signup</li>
          </Link>
          <Link to="/signin">
            <li>Signin</li>
          </Link>
          <Link to="/profile">
            <li>Profile</li>
          </Link>
          <Link to ="/createPost">Create Post</Link>
        </ul>
    </div>
  )
}
