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
import toast, { Toaster } from 'react-hot-toast';
import LevelUpOverlay from "../../components/LevelUpOverlay/LevelUpOverlay";
import { REWARD_TABLE } from "../../constants/rewards";
import HeroAvatar from "../../components/HeroAvatar/HeroAvatar";
import QuestFilter from "../../components/QuestFilter/QuestFilter";
import BossManager from "../../components/BossManager/BossManager";
import { BOSS_LOOT_TABLE } from "../../constants/loot"; // Imported loot table
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal";
import HonorModal from "../../components/HonorModal/HonorModal";
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
    const [unlockedLoot, setUnlockedLoot] = useState([]); // NEW: State for the overlay loot
    const [activeFilter, setActiveFilter] = useState('All');
    const [hittingBossId, setHittingBossId] = useState(null);
    const [isWorldShaking, setIsWorldShaking] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isHonorOpen, setIsHonorOpen] = useState(false);
    const [activeQuestForHonor, setActiveQuestForHonor] = useState(null);

    // Pagination & XP Limits
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

    // Habit Streak Logic
    useEffect(() => {
        if (!user || !profile) return;
        const checkStreak = async () => {
            const today = new Date().toDateString();
            const lastLoginDate = profile.lastLogin?.toDate().toDateString();
            if (lastLoginDate === today) return;

            let newStreak = profile.streak || 0;
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (lastLoginDate === yesterday.toDateString()) {
                newStreak += 1;
                toast.success(`Streak Continued! Day ${newStreak} 🔥`);
            } else {
                newStreak = 1;
                toast("New Streak Started! 🛡️");
            }
            await updateDoc(doc(db, "users", user.uid), { streak: newStreak, lastLogin: serverTimestamp() });
        };
        checkStreak();
    }, [profile?.username]);

    const handleCompleteQuest = async (questId, questXp, questType, currentHp, questTitle) => {
        if (!user || !profile) return;

        // 1. BOSS HP LOGIC (Damage but not dead)
        if (questType === "boss" && currentHp > 1) {
            setHittingBossId(questId);
            setTimeout(() => setHittingBossId(null), 400);
            await updateDoc(doc(db, "quests", questId), { currentHp: currentHp - 1 });
            toast.success(`HIT! ${currentHp - 1} HP remaining! ⚔️`);
            return;
        }

        // 2. OPEN HONOR MODAL (For normal quests or final boss kill)
        // We "save" the quest info into state so Part B knows what to do later
        setActiveQuestForHonor({
            id: questId,
            xp: questXp,
            type: questType,
            title: questTitle,
            currentHp: currentHp
        });
        setIsHonorOpen(true);
    };


    const processHonorSuccess = async (proofOfWork) => {
        // We get the info we "saved" in Part A
        if (!activeQuestForHonor || !user || !profile) return;

        const { id, xp, type, currentHp } = activeQuestForHonor;

        let lootAwarded = [];
        let currentInv = profile.inventory || [];

        // 2. BOSS KILL LOGIC
        if (type === "boss" && currentHp === 1) {
            victorySound.play();
            const bossDrop = BOSS_LOOT_TABLE[profile.level];
            if (bossDrop && !currentInv.includes(bossDrop.id)) {
                lootAwarded.push(bossDrop);
            }
        }

        // 3. XP & LEVEL UP LOGIC
        let newXp = (profile.xp || 0) + xp;
        let newLevel = profile.level || 1;
        let isLevelUp = false;
        const xpReq = Math.floor(100 * Math.pow(1.2, newLevel - 1));

        if (newXp >= xpReq) {
            newLevel++;
            newXp -= xpReq;
            isLevelUp = true;
            if (REWARD_TABLE[newLevel]) {
                lootAwarded.push(REWARD_TABLE[newLevel]);
            }
        }

        // 4. TRIGGER OVERLAY (Level Up / Loot)
        if (isLevelUp || lootAwarded.length > 0) {
            setUnlockedLoot(lootAwarded);
            setShowLevelUp(true);
        }

        // 5. UPDATE FIRESTORE
        const userUpdates = { xp: newXp, level: newLevel };
        if (lootAwarded.length > 0) {
            const newItemIds = lootAwarded.map(item => item.id);
            userUpdates.inventory = [...new Set([...currentInv, ...newItemIds])];
        }

        try {
            await updateDoc(doc(db, "users", user.uid), userUpdates);
            await updateDoc(doc(db, "quests", id), {
                status: "completed",
                currentHp: 0,
                proof: proofOfWork, // THE PROOF FROM MODAL!
                completedAt: serverTimestamp()
            });

            // Close modal and reset
            setIsHonorOpen(false);
            setActiveQuestForHonor(null);
            toast.success("Honor Verified. XP Awarded! ✨");
        } catch (error) {
            console.error("Error completing quest:", error);
            toast.error("The gods rejected your proof. Try again.");
        }
    };

    const handleClearAllHistory = async () => {
        try {
            const deletePromises = completedQuests.map(q => deleteDoc(doc(db, "quests", q.id)));
            await Promise.all(deletePromises);
            setCurrentPage(1);
            toast.success("History wiped clean!");
        } catch (err) {
            toast.error("Failed to clear some items.");
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
            <Toaster position="top-center" reverseOrder={false} />
            <BossManager user={user} profile={profile} activeQuests={quests} setIsWorldShaking={setIsWorldShaking} />

            <header className="stats-header">
                <HeroAvatar inventory={profile?.inventory} level={profile?.level} />
                <div className="hero-info">
                    <p style={{ fontSize: '0.7rem', opacity: 0.6 }}>{user?.email}</p>
                    <h2>{profile?.username || "Adventurer"}</h2>
                </div>
                <div className="streak-badge">
                    <span className="streak-fire">🔥</span>
                    <span className="streak-count">{profile?.streak || 0} DAY STREAK</span>
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
                    <button className="add-quest-pill pulse-prompt" onClick={() => setIsModalOpen(true)}>+ New Quest</button>
                </div>
                <QuestFilter activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
                {/* UPDATED QUEST GRID SECTION */}
                <div className="quest-grid">
                    {filteredQuests.length === 0 ? (
                        <div className="empty-dashboard-state">
                            <div className="empty-shield-icon">🛡️</div>
                            <h4>Your Journey Begins Here!</h4>
                            <p>Every Legend starts with a single quest. Add your first task to begin earning XP and evolving your Hero.</p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="first-quest-btn"
                            >
                                + Summon First Quest
                            </button>
                        </div>
                    ) : (
                        filteredQuests.map((quest) => (
                            <div key={quest.id} className={`quest-card ${quest.difficulty.toLowerCase()} ${quest.type === 'boss' ? 'boss-mode' : ''} ${hittingBossId === quest.id ? 'boss-damage-shake' : ''}`}>
                                {/* ... keep your existing quest-card content */}
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
                                    <button
                                        className="complete-btn"
                                        onClick={() => handleCompleteQuest(quest.id, quest.xp, quest.type, quest.currentHp, quest.title)}
                                    >
                                        {quest.type === 'boss' ? 'ATTACK' : 'Complete'}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <section className="history-section">
                    <div className="section-header">
                        <h3>Quest History ({completedQuests.length})</h3>
                        {completedQuests.length > 0 && (
                            <button onClick={() => setIsConfirmOpen(true)} className="clear-all-btn">
                                Clear All
                            </button>
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
                                        <div>
                                            <p><strong>{q.title}</strong></p>
                                            {/* NEW: Show proof if it exists */}
                                            {q.proof && (
                                                <small style={{
                                                    display: 'block',
                                                    fontStyle: 'italic',
                                                    color: '#94a3b8',
                                                    fontSize: '0.75rem',
                                                    marginTop: '2px'
                                                }}>
                                                    📜 {q.proof}
                                                </small>
                                            )}
                                        </div>
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

            <QuestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddQuest={(d) => { addDoc(collection(db, "quests"), { ...d, userId: user.uid, createdAt: serverTimestamp(), status: "active" }); toast.success("Quest Summoned!"); }} userLevel={profile?.level || 1} />

            <LevelUpOverlay
                key={unlockedLoot.length > 0 ? unlockedLoot[0].id : 'no-loot'}
                isOpen={showLevelUp}
                level={profile?.level}
                isLevelUp={showLevelUp && (profile?.xp === 0 || unlockedLoot.some(item => item.isLevelReward))}
                // Or simply pass a separate state if you tracked isLevelUp in handleCompleteQuest
                newItems={unlockedLoot}
                onClose={() => {
                    setShowLevelUp(false);
                    setUnlockedLoot([]);
                }}
            />

            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleClearAllHistory}
                title="ERASE LEGEND?"
                message="Are you sure? This will burn your entire quest history forever! 📜🔥"
            />

            <HonorModal
                isOpen={isHonorOpen}
                questTitle={activeQuestForHonor?.title}
                onClose={() => setIsHonorOpen(false)}
                onConfirm={processHonorSuccess}
            />
        </div>
    );
}