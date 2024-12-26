import React,{useEffect,useState} from 'react'
import "./Home.css";
import { useNavigate } from 'react-router-dom';


export default function Home() {

  const navigate = useNavigate();
  const [data, setData] = useState([])
  
  useEffect(() => {

    const token= localStorage.getItem("jwt");
    if(!token){
      navigate("./signup")
    }

    // Fetching all posts
    fetch("https://localhost:5000/allposts",{
      headers:{
        "Authorization" : "Bearer " +localStorage.getItem("jwt")
      },
    }).then(res=>res.json())
    .then(result => setData(result))
    .catch(err => console.log(err))

  }, [])
  
  return (
    <div className="home">
      {/* card */}
      {data.map((posts)=>{
       return (  <div className="card">
        {/* card header */}
        <div className="card-header">
          <div className="card-pic">
            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D" alt="" />
          </div>  
          <h5>{posts.postedBy.name}</h5>     
        </div>
        {/* card image  */}
        <div className="card-image">
          <img src="https://plus.unsplash.com/premium_photo-1665663927587-a5b343dff128?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDE2fHx8ZW58MHx8fHx8" alt="" />
        </div>

        {/* card content  */}
        <div className="card-content">
        <span className="material-symbols-outlined">
favorite</span>
<p>1 Like</p>
<p>This is amazing</p>
        </div>
          {/*  add-comment */}
        <div className="add-comment">
        <span className="material-symbols-outlined">mood</span>
        <input type="text" placeholder='Add a comment' />
        <button className="comment">Post</button>
        </div>
      </div>)
      })}
    
    </div>
  )
}
