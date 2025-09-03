import React, { useState, useEffect } from "react";
import "../css/Createpost.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function Createpost() {
    const [body, setBody] = useState("");
    const [image, setImage] = useState("");
    const [url, setUrl] = useState("");
    const [user, setUser] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const navigate = useNavigate();

    const defaultProfilePic = "https://cdn-icons-png.flaticon.com/128/17231/17231410.png";

    const notifyA = (msg) => toast.error(msg);
    const notifyB = (msg) => toast.success(msg);

    useEffect(() => {
        const loggedInUser = JSON.parse(localStorage.getItem("user"));
        if (!loggedInUser) {
            navigate("/signup");
        } else {
            setUser(loggedInUser);
        }
    }, [navigate]);

    const postDetails = async () => {
        if (!body || !image) {
            notifyA("Please add both a caption and an image");
            return;
        }
        try {
            const data = new FormData();
            data.append("file", image);
            data.append("upload_preset", "edugram");
            data.append("cloud_name", "educloud1");

            const response = await fetch(
                "https://api.cloudinary.com/v1_1/educloud1/image/upload",
                { method: "POST", body: data }
            );

            if (!response.ok) {
                throw new Error(`Image upload failed with status: ${response.status}`);
            }

            const result = await response.json();
            setUrl(result.url);
        } catch (err) {
            console.error("Error uploading image:", err);
            notifyA("Failed to upload image. Please try again.");
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
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.error) {
                        notifyA(data.error);
                    } else {
                        notifyB("Successfully Posted");
                        navigate("/");
                    }
                })
                .catch((err) => console.log(err));
        }
    }, [url, body, navigate]);

    const loadfile = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };
    
    return (
        <div className="createPost">
            <div className="post-header">
                <h4>Create New Post</h4>
                <button id="post-btn" onClick={postDetails}>
                    Share
                </button>
            </div>

            {/* New Wrapper for two-column layout */}
            <div className="create-post-body">
                <div className="main-div">
                    {imagePreview ? (
                        <img id="output" src={imagePreview} alt="Image preview" />
                    ) : (
                        <label htmlFor="file-upload" className="upload-label">
                            <span className="material-symbols-outlined upload-icon">
                                cloud_upload
                            </span>
                            <p>Click to select an image</p>
                        </label>
                    )}
                    <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        onChange={loadfile}
                    />
                </div>

                <div className="details">
                    <div className="card-header">
                        <div className="card-pic">
                            <img
                                src={user?.photo || defaultProfilePic}
                                alt="User"
                            />
                        </div>
                        <h5>{user?.name || "Unknown User"}</h5>
                    </div>
                    <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Write a caption..."
                    ></textarea>
                </div>
            </div>
        </div>
    );
}