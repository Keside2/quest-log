import React, { useEffect, useState } from 'react';
import { fetchTopHeroes } from '../../services/firebase';
import './Leaderboard.css';

const Leaderboard = () => {
    const [heroes, setHeroes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getHeroes = async () => {
            const data = await fetchTopHeroes();
            setHeroes(data);
            setLoading(false);
        };
        getHeroes();
    }, []);

    if (loading) {
        return (
            <div className="hall-loading">
                <div className="spinner"></div>
                <p>Consulting the Great Archives...</p>
            </div>
        );
    }

    return (
        <div className="hall-container">
            <header className="hall-header">
                <h1>🏛️ Hall of Heroes</h1>
                <p>The realm's most legendary contributors</p>
            </header>

            <div className="hall-table">
                <div className="table-header">
                    <span>Rank</span>
                    <span>Hero</span>
                    <span>Level</span>
                    {/* <span>XP</span> */}
                </div>

                {heroes.map((hero, index) => (
                    <div key={hero.id} className={`hero-row rank-${index + 1}`}>
                        <div className="rank-badge">
                            {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                        </div>

                        <div className="hero-info">
                            <span className="hero-name">{hero.username || "Unknown Hero"}</span>
                        </div>

                        <div className="hero-stat level-tag">
                            Lvl {hero.level || 1}
                        </div>

                        {/* <div className="hero-stat xp-tag">
                            {hero.xp?.toLocaleString() || 0} XP
                        </div> */}
                    </div>
                ))}
            </div>


        </div>
    );
};

export default Leaderboard;