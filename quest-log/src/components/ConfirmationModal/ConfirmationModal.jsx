import React from 'react';
import './ConfirmationModal.css';

export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="confirm-card">
                <div className="confirm-icon">📜🔥</div>
                <h3>{title}</h3>
                <p>{message}</p>
                <div className="confirm-actions">
                    <button className="cancel-btn" onClick={onClose}>RETREAT</button>
                    <button className="danger-btn" onClick={() => { onConfirm(); onClose(); }}>
                        ERASE LEGEND
                    </button>
                </div>
            </div>
        </div>
    );
}