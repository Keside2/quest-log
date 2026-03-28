import React from 'react';
import './QuestFilter.css';

export default function QuestFilter({ activeFilter, setActiveFilter }) {
    const filters = ['All', 'Easy', 'Medium', 'Hard'];

    return (
        <div className="filter-container">
            {filters.map((f) => (
                <button
                    key={f}
                    className={`filter-pill ${activeFilter === f ? 'active' : ''}`}
                    onClick={() => setActiveFilter(f)}
                >
                    {f}
                </button>
            ))}
        </div>
    );
}