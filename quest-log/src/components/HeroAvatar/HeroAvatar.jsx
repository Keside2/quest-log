import React from 'react';
import './HeroAvatar.css';
import { BOSS_LOOT_TABLE } from "../../constants/loot";
import { REWARD_TABLE } from "../../constants/rewards";

export default function HeroAvatar({ inventory = [], level = 1 }) {
    const getHeroForm = (lvl) => {
        if (lvl >= 50) return { icon: "🧙‍♂️", rank: "mythic" };
        if (lvl >= 20) return { icon: "👑", rank: "lord" };
        if (lvl >= 10) return { icon: "🛡️", rank: "knight" };
        if (lvl >= 5) return { icon: "⚔️", rank: "warrior" };
        return { icon: "👤", rank: "apprentice" };
    };

    const hero = getHeroForm(level);

    // Combine tables to find item data for the icons
    const allLoot = { ...BOSS_LOOT_TABLE, ...REWARD_TABLE };

    return (
        <div className={`avatar-container ${hero.rank}`}>
            <div className="avatar-stage">
                <div className="inner-glow"></div>

                <div className="avatar-layer main-hero">
                    {hero.icon}
                </div>

                {/* NEW: Render the collected inventory items around the hero */}
                <div className="inventory-slots">
                    {inventory.map((itemId, index) => {
                        // Find the item object using the ID from the array
                        const itemData = Object.values(allLoot).find(item => item.id === itemId);
                        return itemData ? (
                            <div key={itemId} className={`equipped-item slot-${index}`}>
                                {itemData.icon}
                            </div>
                        ) : null;
                    })}
                </div>

                {level >= 10 && <div className="avatar-layer aura-effect">✨</div>}

                <div className="level-badge">
                    <span>LVL</span>
                    <strong>{level}</strong>
                </div>
            </div>
            <span className="rank-name">{hero.rank.toUpperCase()}</span>
        </div>
    );
}