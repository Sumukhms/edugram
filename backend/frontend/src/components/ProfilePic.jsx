import React, { useState, useEffect, useRef } from "react";

export default function ProfilePic({ changeProfile, updateProfilePic }) {
  const hiddenFileInput = useRef(null);
  const [image, setImage] = useState(null); // Store selected file
  const [url, setUrl] = useState(""); // Store uploaded image URL
  const [profilePic, setProfilePic] = useState(
    "https://cdn-icons-png.flaticon.com/128/17231/17231410.png"
  ); // Default profile picture

  // Handle file selection
  const handleClick = () => {
    hiddenFileInput.current.click();
  };

  // Upload image to Cloudinary
  const postDetails = async () => {
    if (!image) return;

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
      setUrl(result.url); // Set uploaded image URL
      setProfilePic(result.url); // Update profilePic state with the uploaded image URL
    } catch (err) {
      console.error("Error uploading image:", err);
    }
  };

  // Update profile picture after upload
  useEffect(() => {
    if (url) {
      updateProfilePic(url); // Call parent function to update profile picture
      changeProfile(); // Close the modal after update
      updateProfilePicInDB(url); // Save in DB
       
      
    }
  }, [url, updateProfilePic, changeProfile]);

  // Trigger image upload when an image is selected
  useEffect(() => {
    if (image) {
      postDetails();
    }
  }, [image]);

  // Remove profile picture and set to default
  const removeProfilePic = () => {
    setProfilePic("https://cdn-icons-png.flaticon.com/128/17231/17231410.png"); // Reset to default profile pic
    updateProfilePic(null); // Notify parent to remove profile pic
    changeProfile(); // Close the modal after removing
    updateProfilePicInDB(null); // Remove from DB
     
    window.location.reload();
  };

  // Save the profile picture in the database
  const updateProfilePicInDB = async (newPic) => {
    try {
        const response = await fetch(`/uploadProfilePic`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("jwt"),
            },
            body: JSON.stringify({ pic: newPic }),
        });

        if (!response.ok) {
            throw new Error("Failed to update profile picture in database.");
        }

        const result = await response.json();
        console.log("Profile picture updated in DB:", result);

        // Update localStorage with the new photo URL
        const updatedUserData = JSON.parse(localStorage.getItem("user"));
        updatedUserData.photo = newPic; // Update photo in localStorage
        localStorage.setItem("user", JSON.stringify(updatedUserData)); // Save updated data
       
    } catch (err) {
        console.error("Error updating profile picture in DB:", err);
    }
};



  return (
    <div className="ProfilePic darkBg">
      <div className="changePic centered">
        <div>
          <h2>Change Profile Photo</h2>
        </div>
        <div className="profile-image-preview">
          <img
            src={profilePic}
            alt="Profile"
            style={{ width: "100px", height: "100px", borderRadius: "50%" }}
          />
        </div>
        <div style={{ borderTop: "1px solid #00000030" }}>
          <button
            className="upload-btn"
            style={{ color: "#1EA1F7" }}
            onClick={handleClick}
          >
            Upload Photo
          </button>
          <input
            type="file"
            ref={hiddenFileInput}
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>
        <div style={{ borderTop: "1px solid #00000030" }}>
          <button
            className="upload-btn"
            style={{ color: "#ED4956" }}
            onClick={removeProfilePic} // Remove the profile picture
          >
            Remove Current Photo
          </button>
        </div>
        <div style={{ borderTop: "1px solid #00000030" }}>
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "15px",
            }}
            onClick={changeProfile}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
