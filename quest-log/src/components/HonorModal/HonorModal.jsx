import { useState } from "react";
import "./HonorModal.css";

export default function HonorModal({ isOpen, questTitle, onConfirm, onClose }) {
    const [proof, setProof] = useState("");

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!proof.trim()) return;
        onConfirm(proof);
        setProof(""); // Reset for next time
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content honor-modal-content">
                <div className="modal-header">
                    <h2>📜 The Honor System</h2>
                    <button className="close-x" onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <p className="honor-subtext">
                        To claim XP for <strong>{questTitle}</strong>,
                        describe your achievement.
                    </p>

                    <div className="input-group">
                        <textarea
                            placeholder="e.g., Refactored the QuestModal and added custom Honor validation logic."
                            required
                            value={proof}
                            onChange={(e) => setProof(e.target.value)}
                            rows="4"
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Not Yet
                        </button>
                        <button type="submit" className="confirm-btn">
                            Claim XP
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}