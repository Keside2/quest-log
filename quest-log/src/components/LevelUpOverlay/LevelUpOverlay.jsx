import React from 'react';
import './LevelUpOverlay.css';

export default function LevelUpOverlay({ isOpen, level, newItems = [], onClose }) {
    if (!isOpen) return null;

    // Determine if this is a Loot Drop, a Level Up, or both
    const titleText = newItems.length > 0 && level === level ? "REWARD FOUND" : "LEVEL UP";

    return (
        <div className="lvl-overlay"> {/* Matches your CSS */}
            <div className="lvl-content"> {/* Matches your CSS */}
                <div className="glitch-text" data-text={titleText}>{titleText}</div>

                {/* Only show level number if it's a level up moment */}
                <div className="lvl-number">{level}</div>
                <div className="lvl-glow"></div>

                {newItems.length > 0 && (
                    <div className="unlocked-items" style={{ marginTop: '20px' }}>
                        <p style={{ color: '#fbbf24', fontWeight: '800', fontSize: '0.8rem' }}>NEW GEAR UNLOCKED</p>
                        <div className="items-row" style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '10px' }}>
                            {newItems.map((item, index) => (
                                <div key={index} className="loot-item-card">
                                    <span className="loot-icon">{item.icon}</span>
                                    <span className="loot-name" style={{ color: '#fff', fontSize: '0.7rem', marginTop: '5px' }}>{item.name}</span>
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