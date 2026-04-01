import React from 'react';
import './LevelUpOverlay.css';

export default function LevelUpOverlay({ isOpen, level, newItems = [], isLevelUp, onClose }) {
    if (!isOpen) return null;

    // 1. Logic for the punchy title text
    let titleText = `LEVEL ${level} REACHED`;

    if (newItems.length > 0 && !isLevelUp) {
        titleText = "LOOT DROPPED";
    } else if (newItems.length > 0 && isLevelUp) {
        titleText = `LEVEL ${level} & LOOT!`;
    } else if (isLevelUp) {
        titleText = `LEVEL ${level} UP`;
    }

    return (
        <div className="lvl-overlay">
            <div className="lvl-content">
                {/* The Main Title */}
                <div className="glitch-text" data-text={titleText}>{titleText}</div>

                {/* The Big Level Number (Always visible like your old code) */}
                <div className="lvl-number">{level}</div>
                <div className="lvl-glow"></div>

                {/* New Gear Section */}
                {newItems.length > 0 && (
                    <div className="unlocked-items" style={{ marginTop: '20px' }}>
                        <p style={{ color: '#fbbf24', fontWeight: '800', fontSize: '0.8rem' }}>
                            NEW GEAR UNLOCKED
                        </p>
                        <div className="items-row" style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '10px' }}>
                            {newItems.map((item, index) => (
                                <div key={index} className="loot-item-card">
                                    <span className="loot-icon">{item.icon}</span>
                                    <span className="loot-name" style={{ color: '#fff', fontSize: '0.7rem', marginTop: '5px' }}>
                                        {item.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <button className="lvl-close-btn" onClick={onClose}>CONTINUE JOURNEY</button>
            </div>
        </div>
    );
}