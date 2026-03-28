import React, { useEffect } from "react";
import "./LevelUpOverlay.css";

export default function LevelUpOverlay({ level, isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="lvl-overlay" onClick={onClose}>
            <div className="lvl-content">
                <div className="lvl-glow"></div>
                <h1 className="lvl-text">LEVEL UP</h1>
                <div className="lvl-number">{level}</div>
                <p className="lvl-sub">Your power grows, Adventurer!</p>
                <button className="lvl-close-btn">Continue Quest</button>
            </div>
        </div>
    );
}