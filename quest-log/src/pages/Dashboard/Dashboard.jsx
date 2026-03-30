import { useAuth } from "../../context/AuthContext/AuthContext";
import { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import {
    doc,
    collection,
    addDoc,
    serverTimestamp,
    query,
    where,
    onSnapshot,
    orderBy,
    updateDoc,
    deleteDoc
} from "firebase/firestore";
import QuestModal from "../../components/QuestModal/QuestModal";
import toast, { Toaster } from 'react-hot-toast'; // Correctly imported
import LevelUpOverlay from "../../components/LevelUpOverlay/LevelUpOverlay";
import { REWARD_TABLE } from "../../constants/rewards";
import HeroAvatar from "../../components/HeroAvatar/HeroAvatar";
import QuestFilter from "../../components/QuestFilter/QuestFilter";
import BossManager from "../../components/BossManager/BossManager";
import "./Dashboard.css";
import "./BossStyles.css";

const victorySound = new Audio("https://actions.google.com/sounds/v1/foley/wind_chime_fast_up.ogg");

export default function Dashboard() {
    const { user, logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [quests, setQuests] = useState([]);
    const [completedQuests, setCompletedQuests] = useState([]);
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [activeFilter, setActiveFilter] = useState('All');
    const [hittingBossId, setHittingBossId] = useState(null);
    const [isWorldShaking, setIsWorldShaking] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const currentXpLimit = profile ? Math.floor(100 * Math.pow(1.2, (profile.level || 1) - 1)) : 100;

    // Listen to User Profile
    useEffect(() => {
        if (!user) return;
        return onSnapshot(doc(db, "users", user.uid), (docSnap) => {
            if (docSnap.exists()) setProfile({ ...docSnap.data() });
        });
    }, [user]);

    // Listen to Quests
    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, "quests"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
        return onSnapshot(q, (querySnapshot) => {
            const active = [];
            const finished = [];
            querySnapshot.forEach((doc) => {
                const data = { id: doc.id, ...doc.data() };
                data.status === "completed" ? finished.push(data) : active.push(data);
            });
            setQuests(active);
            setCompletedQuests(finished);
        });
    }, [user]);

    const handleCompleteQuest = async (questId, questXp, questType, currentHp) => {
        if (!user || !profile) return;

        // Boss Battle Logic
        if (questType === "boss" && currentHp > 1) {
            setHittingBossId(questId);
            setTimeout(() => setHittingBossId(null), 400);
            await updateDoc(doc(db, "quests", questId), { currentHp: currentHp - 1 });
            toast.success(`HIT! ${currentHp - 1} HP remaining! ⚔️`);
            return;
        }

        if (questType === "boss" && currentHp === 1) {
            victorySound.play();
            toast.success("THE BEAST HAS FALLEN! 🔥", { icon: "🏆" });
        }

        // XP and Leveling Logic
        let newXp = (profile.xp || 0) + questXp;
        let newLevel = profile.level || 1;
        const xpReq = Math.floor(100 * Math.pow(1.2, newLevel - 1));

        if (newXp >= xpReq) {
            newLevel++;
            newXp -= xpReq;
            setShowLevelUp(true);
        }

        const updates = { xp: newXp, level: newLevel };
        if (REWARD_TABLE[newLevel]) {
            const inv = profile.inventory || [];
            if (!inv.includes(REWARD_TABLE[newLevel].id)) {
                updates.inventory = [...inv, REWARD_TABLE[newLevel].id];
                toast(`New Item Unlocked: ${REWARD_TABLE[newLevel].name}`, { icon: '🛡️' });
            }
        }

        await updateDoc(doc(db, "users", user.uid), updates);
        await updateDoc(doc(db, "quests", questId), {
            status: "completed",
            currentHp: 0,
            completedAt: serverTimestamp()
        });

        if (!showLevelUp) toast.success(questType === 'boss' ? "Victory Achieved!" : "Quest Finished! +XP");
    };

    const handleClearAllHistory = async () => {
        if (window.confirm("Are you sure? This will erase your entire legend forever! 📜🔥")) {
            try {
                const deletePromises = completedQuests.map(q => deleteDoc(doc(db, "quests", q.id)));
                await Promise.all(deletePromises);
                setCurrentPage(1);
                toast.success("History wiped clean!");
            } catch (err) {
                toast.error("Failed to clear some items.");
            }
        }
    };

    const handleDeleteHistoryItem = async (id) => {
        try {
            await deleteDoc(doc(db, "quests", id));
            toast.success("Memory erased!");
        } catch (err) {
            toast.error("Error deleting item.");
        }
    };

    const filteredQuests = quests.filter(q => activeFilter === 'All' || q.difficulty === activeFilter);

    // Pagination Logic
    const totalPages = Math.ceil(completedQuests.length / itemsPerPage);
    const currentItems = completedQuests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className={`dashboard-container ${isWorldShaking ? 'world-event-shake' : ''}`}>
            {isWorldShaking && <div className="boss-spawn-overlay"><h1>BEWARE...</h1></div>}

            {/* Toaster placed once at the top level */}
            <Toaster position="top-center" reverseOrder={false} />

            <BossManager
                user={user}
                profile={profile}
                activeQuests={quests}
                setIsWorldShaking={setIsWorldShaking}
            />

            <header className="stats-header">
                <HeroAvatar inventory={profile?.inventory} level={profile?.level} />
                <div className="hero-info">
                    <p style={{ fontSize: '0.7rem', opacity: 0.6 }}>{user?.email}</p>
                    <h2>{profile?.username || "Adventurer"}</h2>
                </div>
                <div className="xp-container">
                    <span>Level {profile?.level || 1}</span>
                    <div className="xp-bar-bg">
                        <div className="xp-bar-fill" style={{ width: `${(profile?.xp / currentXpLimit) * 100}%` }}></div>
                    </div>
                    <small>{profile?.xp || 0} / {currentXpLimit} XP</small>
                </div>
                <button onClick={logout} className="logout-btn">Leave Tavern</button>
            </header>

            <main className="quest-section">
                <div className="section-header">
                    <h3>Quest Board</h3>
                    <button
                        // className={`add-quest-pill ${filteredQuests.length === 0 ? 'pulse-prompt' : ''}`}
                        className="add-quest-pill pulse-prompt"
                        onClick={() => setIsModalOpen(true)}
                    >
                        + New Quest
                    </button>
                </div>

                <QuestFilter activeFilter={activeFilter} setActiveFilter={setActiveFilter} />

                <div className="quest-grid">
                    {filteredQuests.map((quest) => (
                        <div key={quest.id}
                            className={`quest-card ${quest.difficulty.toLowerCase()} ${quest.type === 'boss' ? 'boss-mode' : ''} ${hittingBossId === quest.id ? 'boss-damage-shake' : ''}`}
                            data-boss-level={quest.level || 0}>

                            <div className="quest-info">
                                <div className="card-meta">
                                    <span className="difficulty-label">{quest.type === 'boss' ? '👹 BOSS' : quest.difficulty}</span>
                                    <span className="duration-label">⏳ {quest.duration || 30}m</span>
                                </div>
                                <h4>{quest.title}</h4>
                                {quest.type === 'boss' && (
                                    <div className="boss-hp-bar">
                                        <div className="hp-fill" style={{ width: `${(quest.currentHp / quest.hp) * 100}%` }}></div>
                                        <small>{quest.currentHp}/{quest.hp} HP</small>
                                    </div>
                                )}
                            </div>

                            <div className="quest-reward-zone">
                                <span className="xp-badge">+{quest.xp} XP</span>
                                <button className="complete-btn" onClick={() => handleCompleteQuest(quest.id, quest.xp, quest.type, quest.currentHp)}>
                                    {quest.type === 'boss' ? 'ATTACK' : 'Complete'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <section className="history-section">
                    <div className="section-header">
                        <h3>Quest History ({completedQuests.length})</h3>
                        {completedQuests.length > 0 && (
                            <button onClick={handleClearAllHistory} className="clear-all-btn">Clear All</button>
                        )}
                    </div>
                    <div className="history-list">
                        {currentItems.length === 0 ? (
                            <p className="empty-text">No legends written yet...</p>
                        ) : (
                            currentItems.map(q => (
                                <div key={q.id} className="history-item">
                                    <div className="history-info">
                                        <span className="check-icon">✔</span>
                                        <p>{q.title}</p>
                                    </div>
                                    <button className="delete-hist-btn" onClick={() => handleDeleteHistoryItem(q.id)}>🗑️</button>
                                </div>
                            ))
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination-controls">
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
                            <span>Page {currentPage} of {totalPages}</span>
                            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
                        </div>
                    )}
                </section>
            </main>

            <QuestModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAddQuest={(d) => {
                    addDoc(collection(db, "quests"), { ...d, userId: user.uid, createdAt: serverTimestamp(), status: "active" });
                    toast.success("Quest Summoned!");
                }}
                userLevel={profile?.level || 1}
            />

            <LevelUpOverlay
                isOpen={showLevelUp}
                level={profile?.level}
                onClose={() => setShowLevelUp(false)}
            />
        </div>
    );
}