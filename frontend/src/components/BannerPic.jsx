import React, { useState, useRef } from "react";
import { toast } from 'react-toastify';
import "../css/profile.css"; // We'll add styles to this file

export default function BannerPic({ changeBanner, updateBannerPic }) {
  const hiddenFileInput = useRef(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const API_BASE = process.env.REACT_APP_API_URL;

  const notifyA = (msg) => toast.error(msg);
  const notifyB = (msg) => toast.success(msg);

  const handleClick = () => {
    hiddenFileInput.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const postData = async () => {
    if (!image) return;
    setLoading(true);

    const data = new FormData();
    data.append("file", image);
    data.append("upload_preset", process.env.REACT_APP_CLOUD_PRESET);
    data.append("cloud_name", process.env.REACT_APP_CLOUD_NAME);

    try {
      const cloudResponse = await fetch(
        "https://api.cloudinary.com/v1_1/educloud1/image/upload",
        { method: "POST", body: data }
      );
      if (!cloudResponse.ok) throw new Error("Image upload failed.");
      
      const cloudResult = await cloudResponse.json();
      const finalUrl = cloudResult.secure_url;
      
      await updateBannerPicInDB(finalUrl);

      updateBannerPic(finalUrl);
      notifyB("Banner updated successfully!");
      changeBanner();

    } catch (err) {
      console.error("Error updating banner:", err);
      notifyA("Failed to update banner.");
    } finally {
        setLoading(false);
    }
  };

  const updateBannerPicInDB = async (newPic) => {
    const response = await fetch(`${API_BASE}/uploadBannerPic`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({ pic: newPic }),
    });
    if (!response.ok) throw new Error("DB update failed.");
  };

  return (
    <div className="darkBg" onClick={() => !loading && changeBanner()}>
      <div className="changePic centered" onClick={(e) => e.stopPropagation()}>
        {loading ? (
          <div className="loader-container">
            <div className="spinner"></div>
            <h2>Uploading...</h2>
          </div>
        ) : (
          <>
            <div>
              <h2>{imagePreview ? "Confirm New Banner" : "Change Banner Photo"}</h2>
            </div>
            {imagePreview && (
              <div className="image-preview-container banner-preview">
                <img className="image-preview" src={imagePreview} alt="Preview" />
              </div>
            )}
            
            <input
              type="file"
              ref={hiddenFileInput}
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />

            {imagePreview ? (
              <>
                <div className="action-div">
                  <button className="upload-btn" style={{ color: "#1EA1F7", fontWeight: "bold" }} onClick={postData}>
                    Confirm
                  </button>
                </div>
                <div className="action-div">
                  <button className="upload-btn" onClick={handleClick}>
                    Choose different photo
                  </button>
                </div>
              </>
            ) : (
              <div className="action-div">
                <button className="upload-btn" style={{ color: "#1EA1F7", fontWeight: "bold" }} onClick={handleClick}>
                  Upload Photo
                </button>
              </div>
            )}

            <div className="action-div">
              <button className="upload-btn" onClick={changeBanner}>
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}