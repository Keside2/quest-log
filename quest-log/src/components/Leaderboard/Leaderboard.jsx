import React, { useEffect, useState } from 'react';
import { fetchTopHeroes } from '../../services/firebase';
import './Leaderboard.css';

const Leaderboard = () => {
    const [heroes, setHeroes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Your custom Hero Form logic
    const getHeroForm = (lvl) => {
        if (lvl >= 50) return { rank: "myhic" };
        if (lvl >= 20) return { rank: "lord" };
        if (lvl >= 10) return { rank: "knight" };
        if (lvl >= 5) return { rank: "warrior" };
        return { rank: "apprentice" };
    };

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
                </div>

                {heroes.map((hero, index) => {
                    const heroForm = getHeroForm(hero.level || 1);
                    return (
                        <div key={hero.id} className={`hero-row rank-${index + 1}`}>
                            <div className="rank-badge">
                                {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                            </div>

                            <div className="hero-info">
                                <div className="hero-name-group">
                                    <span className="hero-emoji">{heroForm.icon}</span>
                                    <span className="hero-name">{hero.username || "Unknown Hero"}</span>
                                </div>
                                {/* The rank name becomes a CSS class */}
                                <span className={`rank-tag ${heroForm.rank}`}>
                                    {heroForm.rank}
                                </span>
                            </div>

                            <div className="hero-stat level-tag">
                                Lvl {hero.level || 1}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Leaderboard;