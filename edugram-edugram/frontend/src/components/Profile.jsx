import React, {useEffect,useState}from 'react'
import './profile.css';
export default function Profile() {
  const [pic, setPic] = useState([])

  useEffect(() => {
    fetch("http://localhost:5000/myposts",{
      headers:{
        Authorization: "Bearer " + localStorage.getItem("jwt")
    }
  })
.then(res=>res.json())
.then((result)=>{
  setPic(result)
})

}, [])
  return <div className="profile">
    {/* {profile frame} */}
    <div className="profile-frame">
      <div className="profile-pic">
          <img src="https://plus.unsplash.com/premium_photo-1665663927587-a5b343dff128?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDE2fHx8ZW58MHx8fHx8" alt="" />
        <img src="" alt="" />
      </div>
      {/* {profile-data */}
      <div className="profile-data">
        <h1>Canta Coder</h1>
        <div className="profile-info" style={{display:'flex'}}>
          <p>40 posts </p>
          <p>40 followers </p>
          <p>40 following </p>
        </div>
      </div>
    </div>
    <hr style={{
      width:"90%",margin:"auto",opacity:"0.8", margin: "25px auto",}} />
    {/* Gallery  */}
    <div  className="gallery">
      {pic.map((pic)=>{
        return < img key={pic._id} src={pic.photo} className='item'></img>

      }
      )}bjj
    </div>
  </div>
}
