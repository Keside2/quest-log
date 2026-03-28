import { useState } from "react";
import "./QuestModal.css";

export default function QuestModal({ isOpen, onClose, onAddQuest }) {
    const [title, setTitle] = useState("");
    const [difficulty, setDifficulty] = useState("Easy");
    // 1. ADD DURATION STATE
    const [duration, setDuration] = useState("30");

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        // Difficulty Matrix logic
        let xpReward = 10;
        if (difficulty === "Medium") xpReward = 25;
        if (difficulty === "Hard") xpReward = 50;

        onAddQuest({
            title,
            difficulty,
            xp: xpReward,
            duration, // 2. SEND DURATION TO DASHBOARD
            status: "active",
        });

        // Reset form
        setTitle("");
        setDuration("30");
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Summon New Quest</h2>
                    <button className="close-x" onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Quest Objective</label>
                        <input
                            type="text"
                            placeholder="e.g., Slay the CSS Bugs"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label>Difficulty Rank</label>
                        <select
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                        >
                            <option value="Easy">Easy (10 XP)</option>
                            <option value="Medium">Medium (25 XP)</option>
                            <option value="Hard">Hard (50 XP)</option>
                        </select>
                    </div>

                    {/* 3. ADDED THE ESTIMATED TIME FIELD */}
                    <div className="input-group">
                        <label>Estimated Time (Minutes)</label>
                        <select
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                        >
                            <option value="15">15 mins (Quick Task)</option>
                            <option value="30">30 mins (Standard)</option>
                            <option value="60">1 hour (Deep Work)</option>
                            <option value="120">2 hours+ (Epic Quest)</option>
                        </select>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Retreat
                        </button>
                        <button type="submit" className="confirm-btn">
                            Accept Quest
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}