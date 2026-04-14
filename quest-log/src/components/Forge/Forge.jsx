import React, { useState } from 'react';
import { db } from '../../services/firebase';
import { doc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import './Forge.css';

const THEMES = [
    { id: 'emerald', name: 'Emerald', price: 300, color: '#10b981', icon: '🌿', bg: '#022c22' },
    { id: 'royal', name: 'Royal', price: 800, color: '#fbbf24', icon: '👑', bg: '#2e1065' },
    { id: 'crimson', name: 'Crimson', price: 1200, color: '#ef4444', icon: '🩸', bg: '#450a0a' },
    { id: 'frost', name: 'Frost', price: 2000, color: '#38bdf8', icon: '❄️', bg: '#0c4a6e' },
    { id: 'void', name: 'Void', price: 3500, color: '#c084fc', icon: '🌌', bg: '#1e1b4b' },
    { id: 'midnight', name: 'Midnight', price: 5000, color: '#64748b', icon: '🌑', bg: '#020617' },
];

const Forge = ({ userData }) => {
    const [loading, setLoading] = useState(null);
    const currentGold = userData?.gold || 0;
    const unlockedThemes = userData?.unlockedThemes || [];
    const activeTheme = userData?.activeTheme || 'default';

    const handleAction = async (theme) => {
        if (!userData?.uid) return;
        const isUnlocked = unlockedThemes.includes(theme.id);
        const userRef = doc(db, "users", userData.uid);

        if (!isUnlocked) {
            if (currentGold < theme.price) return toast.error("Not enough gold!");
            setLoading(theme.id);
            try {
                await updateDoc(userRef, {
                    gold: increment(-theme.price),
                    unlockedThemes: arrayUnion(theme.id)
                });
                toast.success(`${theme.name} Forged!`);
            } catch (e) { toast.error("Forge failed."); }
        } else {
            try {
                await updateDoc(userRef, { activeTheme: theme.id });
                toast.success(`${theme.name} Equipped!`);
            } catch (e) { toast.error("Equip failed."); }
        }
        setLoading(null);
    };

    return (
        <div className="forge-mini-container">
            <div className="forge-mini-header">
                <h3>⚒️ The Forge</h3>
                <span className="mini-gold">💰 {currentGold}</span>
            </div>

            <div className="theme-compact-list">
                {THEMES.map((theme) => {
                    const isUnlocked = unlockedThemes.includes(theme.id);
                    const isEquipped = activeTheme === theme.id;

                    return (
                        <div key={theme.id} className={`theme-row ${isEquipped ? 'equipped' : ''}`}>
                            <div className="theme-main-info">
                                <span className="theme-icon" style={{ textShadow: `0 0 10px ${theme.color}` }}>{theme.icon}</span>
                                <div className="theme-text">
                                    <span className="theme-name">{theme.name}</span>
                                    {!isUnlocked && <span className="theme-price">🪙 {theme.price}</span>}
                                </div>
                            </div>

                            <button
                                onClick={() => handleAction(theme)}
                                disabled={loading === theme.id || (!isUnlocked && currentGold < theme.price)}
                                className={`mini-forge-btn ${isUnlocked ? 'equip-btn' : 'buy-btn'}`}
                            >
                                {loading === theme.id ? "..." : isEquipped ? "Equipped" : isUnlocked ? "Equip" : "Buy"}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Forge;