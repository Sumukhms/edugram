import React,{useState,useContext} from 'react'
import '../css/Signin.css'
import logo from '../img/logo.PNG'
import { Link, useNavigate} from 'react-router-dom'
import {  toast } from 'react-toastify';
import { LoginContext } from '../context/LoginContext';

export default function Signin() {
  const navigate = useNavigate()
  const {setUserLogin}=useContext(LoginContext)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const API_BASE = process.env.REACT_APP_API_URL;


    // Toast functions
    const notifyA = (msg) => toast.error(msg);
    const notifyB = (msg) => toast.success(msg);

    const emailRegex =/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

  const postData=()=>{
    // checking email
      if(!emailRegex.test(email)){
        notifyA("Invalid email")
        return
      }
    //  sending data to server
    fetch(`${API_BASE}/signin`,{
      method:"post",
      headers:{
        "Content-Type":"application/json",
        "Authorization": "Bearer " + localStorage.getItem("jwt")
      },
      body:JSON.stringify({
        email:email,
        password:password
      })
    }).then(res=>res.json())
    .then(data =>{
      if(data.error){
        notifyA(data.error)
      }else{
        notifyB("Signed In Successfully")
        console.log(data.token)
        localStorage.setItem("jwt",data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        setUserLogin(true)
        navigate("/")
      }
      console.log(data)
    })
    }
  

  return (
    <div className="signIn">
      <div className='loginForm'>
        <img className='signInLogo' src={logo} alt="" />
        <div>
          <input type="email" name='email' id='email' value={email} placeholder='Email' onChange={(e)=>{setEmail(e.target.value)}}/>
        </div>
        <div>
        <input type="password" name='password' id='password' value={password} placeholder='Password ' onChange={(e)=>{setPassword(e.target.value)}} />
        </div>
        <div>
          <input type="submit" id='login-btn' value="Sign In" onClick={()=>{postData()}}/>
        </div>
        <div className="loginForm2">
          Don't have an account ? 
          <Link to="/signup">
          <span style={{color:"blue" , cursor:"pointer"}}>Sign Up</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
