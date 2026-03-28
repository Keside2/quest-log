import React from 'react';
import './HeroAvatar.css';

export default function HeroAvatar({ inventory = [], level = 1 }) {
    return (
        <div className="avatar-stage">
            {/* Base Body - Always there */}
            <div className="avatar-layer base-body">👤</div>

            {/* Conditional Layers based on Inventory */}
            {inventory.includes('basic_cloak') && (
                <div className="avatar-layer cloak-layer">🧥</div>
            )}

            {inventory.includes('iron_boots') && (
                <div className="avatar-layer boots-layer">🥾</div>
            )}

            {inventory.includes('silver_blade') && (
                <div className="avatar-layer weapon-layer">⚔️</div>
            )}

            {inventory.includes('golden_aura') && (
                <div className="avatar-layer aura-layer">✨</div>
            )}

            <div className="level-tag">LVL {level}</div>
        </div>
    );
}