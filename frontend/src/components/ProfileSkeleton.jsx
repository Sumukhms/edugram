import React from 'react';
import '../css/Skeleton.css';

export default function ProfileSkeleton() {
    return (
        <div className="profile">
            <div className="skeleton-profile-container">
                <div className="skeleton-banner shimmer"></div>
                <div className="profile-frame">
                    <div className="skeleton skeleton-profile-pic shimmer"></div>
                    {/* Add more skeleton elements for profile data if desired */}
                </div>
            </div>
        </div>
    );
}