import React from 'react'
import logo from '../img/logo.PNG'
import './Navbar.css'
import { Link } from 'react-router-dom'

export default function Navbar({login}) {

  const loginStatus = ()=>{
    const token =localStorage.getItem("jwt");
    if(login || token){
       return[
        <>
        <Link to="/profile">
          <li>Profile</li>
        </Link>
        <Link to ="/createPost">Create Post</Link>
          </>
       ];
    }else{
      return[
        <>
        <Link to="/signup">
            <li>Signup</li>
          </Link>
          <Link to="/signin">
            <li>Signin</li>
          </Link></>
      ];
    }
  };




  return (
    <div className='navbar'>
        <img src={logo} alt="" />
        <ul className='nav-menu'>
          { loginStatus()}
         
        </ul>
    </div>
  );
}
