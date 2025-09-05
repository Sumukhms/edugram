import React from 'react';
import '../css/Skeleton.css';

export default function PostSkeleton() {
    return (
        <div className="card">
            <div className="skeleton-card">
                <div className="skeleton-header">
                    <div className="skeleton avatar"></div>
                    <div className="skeleton text"></div>
                </div>
                <div className="skeleton image"></div>
            </div>
        </div>
    );
}