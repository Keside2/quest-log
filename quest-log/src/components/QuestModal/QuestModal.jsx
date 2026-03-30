import { useState } from "react";
import "./QuestModal.css";

export default function QuestModal({ isOpen, onClose, onAddQuest, userLevel }) {
    const [title, setTitle] = useState("");
    const [difficulty, setDifficulty] = useState("Easy");
    const [duration, setDuration] = useState("30");
    // NEW STATES FOR BOSS LOGIC
    const [type, setType] = useState("normal");
    const [hp, setHp] = useState(3);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        // Safety Check: Prevent submission if they try to hack a boss quest before level 5
        if (type === 'boss' && userLevel < 5) {
            alert("You are not strong enough to summon a Boss yet!");
            return;
        }

        let xpReward = 10;
        if (difficulty === "Medium") xpReward = 25;
        if (difficulty === "Hard") xpReward = 50;

        // If it's a boss, maybe double the XP?
        const finalXp = type === "boss" ? xpReward * 3 : xpReward;

        onAddQuest({
            title,
            difficulty,
            xp: finalXp,
            duration,
            type, // 'normal' or 'boss'
            hp: type === "boss" ? Number(hp) : 1, // Max HP
            currentHp: type === "boss" ? Number(hp) : 1, // Tracks the hits
            status: "active",
            createdAt: new Date(),
        });

        // Reset form
        setTitle("");
        setDuration("30");
        setType("normal");
        setHp(3);
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

                    {/* NEW: QUEST TYPE SELECTOR */}
                    <div className="input-group">
                        <label>Quest Type</label>
                        <select value={type} onChange={(e) => setType(e.target.value)}>
                            <option value="normal">Standard Quest</option>
                            {/* Bosses only unlock at Level 5 */}
                            <option value="boss" disabled={userLevel < 5}>
                                {userLevel < 5 ? "🔒 Boss Battle (Unlocks at Lvl 5)" : "👹 Boss Battle (Multi-Hit)"}
                            </option>
                        </select>
                    </div>

                    {/* NEW: DYNAMIC HP INPUT */}
                    {type === 'boss' && (
                        <div className="input-group">
                            <label>Boss HP (Hits to defeat)</label>
                            <input
                                type="number"
                                min="2"
                                max="10"
                                value={hp}
                                onChange={(e) => setHp(e.target.value)}
                            />
                        </div>
                    )}

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
                            {type === 'boss' ? 'Begin Raid' : 'Accept Quest'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}