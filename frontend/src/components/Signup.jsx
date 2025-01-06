import React, { useEffect , useState} from 'react'
import logo from '../img/logo.PNG'
import './Signup.css'
import { Link ,useNavigate} from 'react-router-dom'
import {  toast } from 'react-toastify';

export default function Signup() {
  const navigate =useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [userName, setUserName] = useState("")
  const [password, setPassword] = useState("")

  // Toast functions
  const notifyA = (msg) => toast.error(msg);
  const notifyB = (msg) => toast.success(msg);

  const emailRegex =/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  const passRegex =/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,15}$/;


  const postData=()=>{
  // checking email
    if(!emailRegex.test(email)){
      notifyA("Invalid email")
      return
    }else if(!passRegex.test(password)) {
      notifyA("Password must be 8-15 characters long, with uppercase, lowercase, a number and a special charaters for example #,?,!")
      return
    }

  //  sending data to server
  fetch("http://localhost:5000/signup",{
    method:"post",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      name:name,
      userName:userName,
      email:email,
      password:password
    })
  }).then(res=>res.json())
  .then(data =>{
    if(data.error){
      notifyA(data.error)
    }else{
      notifyB(data.message)
      navigate("/signin")
    }
    console.log(data)})
  }

  return (
    <div className='signUp'>
      <div className="form-container">
        <div className="form">

        <img className='signUpLogo' src={logo} alt="" />
        <p className='loginPara'>
          Sign up to see educational content  <br /> and share your knowledge. </p>
        <div>
          <input type="email" name='email' id='email' value={email} placeholder='Email' onChange={(e)=>{setEmail(e.target.value)}}/>
        </div> 
        <div>
          <input type="text" name='name' id='name' value={name} placeholder='Full Name' onChange={(e)=>{setName(e.target.value)}} />
        </div>   
        <div>
          <input type="text" name='username' id='username' value={userName} placeholder='User Name' onChange={(e)=>{setUserName(e.target.value)}} />
        </div>
        <div>
          <input type="password" name='password' id='password' value={password} placeholder='Password ' onChange={(e)=>{setPassword(e.target.value)}} />
        </div>   
        <p className='loginPara' style={{fontSize:"12px", margin:"3px"}}>By signing up , you agree to our Terms , <br /> privacy policy and cookies poilicy.</p>
        <input type="submit" id='submit-btn' value='Sign Up' onClick={()=>{postData()}} />
      </div>
      <div className="form2">Already have an account ?
        <Link to="/signin">
        <span style={{color:"blue" , cursor:"pointer"}}> Sign In</span>
        </Link>
        </div>
      </div>
    </div>
  )
}
