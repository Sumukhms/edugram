import React, { useState, useEffect } from "react";
import "../css/Createpost.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function Createpost() {
    const [body, setBody] = useState("");
    const [media, setMedia] = useState(""); // Renamed from image
    const [url, setUrl] = useState("");
    const [user, setUser] = useState(null);
    const [mediaPreview, setMediaPreview] = useState("");
    const [mediaType, setMediaType] = useState("image");
    const navigate = useNavigate();

    const defaultProfilePic = "https://cdn-icons-png.flaticon.com/128/17231/17231410.png";
    const notifyA = (msg) => toast.error(msg);
    const notifyB = (msg) => toast.success(msg);

    useEffect(() => {
        const loggedInUser = JSON.parse(localStorage.getItem("user"));
        if (!loggedInUser) navigate("/signup");
        else setUser(loggedInUser);
    }, [navigate]);

    const postDetails = async () => {
        if (!body || !media) {
            return notifyA("Please add both a caption and a file");
        }
        
        const data = new FormData();
        data.append("file", media);
        data.append("upload_preset", "edugram");
        data.append("cloud_name", "educloud1");

        // Determine the resource type for Cloudinary
        const resourceType = mediaType;
        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/educloud1/${resourceType}/upload`;

        try {
            const response = await fetch(cloudinaryUrl, { method: "POST", body: data });
            if (!response.ok) throw new Error("Upload to Cloudinary failed.");
            
            const result = await response.json();
            setUrl(result.url);
        } catch (err) {
            console.error("Error uploading file:", err);
            notifyA("Failed to upload file. Please try again.");
        }
    };

    useEffect(() => {
        if (url) {
            fetch("/createPost", {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + localStorage.getItem("jwt"),
                },
                body: JSON.stringify({
                    body,
                    pic: url,
                    mediaType,
                }),
            })
            .then(res => res.json())
            .then(data => {
                if (data.error) notifyA(data.error);
                else {
                    notifyB("Successfully Posted");
                    navigate("/");
                }
            })
            .catch(err => console.log(err));
        }
    }, [url, body, mediaType, navigate]);

    const loadfile = (event) => {
        const file = event.target.files[0];
        if (file) {
            setMediaType(file.type.startsWith('video/') ? 'video' : 'image');
            setMedia(file);
            setMediaPreview(URL.createObjectURL(file));
        }
    };
    
    return (
        <div className="createPost">
            <div className="post-header">
                <h4>Create New Post</h4>
                <button id="post-btn" onClick={postDetails}>Share</button>
            </div>
            <div className="create-post-body">
                <div className="main-div">
                    {mediaPreview ? (
                        mediaType === 'image' ? (
                            <img id="output" src={mediaPreview} alt="Preview" />
                        ) : (
                            <video id="output" src={mediaPreview} controls muted />
                        )
                    ) : (
                        <label htmlFor="file-upload" className="upload-label">
                            <span className="material-symbols-outlined upload-icon">upload_file</span>
                            <p>Click to select an image or video</p>
                        </label>
                    )}
                    <input
                        id="file-upload"
                        type="file"
                        accept="image/*,video/*"
                        onChange={loadfile}
                    />
                </div>
                <div className="details">
                    <div className="card-header">
                        <div className="card-pic">
                            <img src={user?.photo || defaultProfilePic} alt="User" />
                        </div>
                        <h5>{user?.name || "Unknown User"}</h5>
                    </div>
                    <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write a caption..."></textarea>
                </div>
            </div>
        </div>
    );
}