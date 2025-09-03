import React, { useState, useEffect } from "react";
import "../css/Createpost.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function Createpost() {
    const [body, setBody] = useState("");
    const [image, setImage] = useState("");
    const [url, setUrl] = useState("");
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // Default profile picture
    const defaultProfilePic = "https://cdn-icons-png.flaticon.com/128/17231/17231410.png";

    // Toast functions
    const notifyA = (msg) => toast.error(msg);
    const notifyB = (msg) => toast.success(msg);

    // Fetch user details from localStorage
    useEffect(() => {
        const loggedInUser = JSON.parse(localStorage.getItem("user"));
        if (!loggedInUser) {
            navigate("/signup");
        } else {
            setUser(loggedInUser);
        }
    }, [navigate]);

    // Posting image to Cloudinary
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

    // Saving post to MongoDB when image upload is successful
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
        const output = document.getElementById("output");
        output.src = URL.createObjectURL(event.target.files[0]);
        setImage(event.target.files[0]);
        output.onload = function () {
            URL.revokeObjectURL(output.src);
        };
    };

    return (
        <div className="createPost">
            {/* Header */}
            <div className="post-header">
                <h4 style={{ margin: "3px auto" }}>Create New Post</h4>
                <button id="post-btn" onClick={postDetails}>
                    Share
                </button>
            </div>

            {/* Image Preview */}
            <div className="main-div">
                <img
                    id="output"
                    src="https://www.bing.com/th?id=OIP.JIo_erHjGUXp0-Z86gJAqAHaHa&w=150&h=150&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2"
                    alt="Preview"
                />
                <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => loadfile(event)}
                />
            </div>

            {/* Details */}
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
    );
}
