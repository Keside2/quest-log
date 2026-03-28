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
    deleteDoc, // 1. Added deleteDoc
} from "firebase/firestore";
import QuestModal from "../../components/QuestModal/QuestModal";
import toast, { Toaster } from 'react-hot-toast';
import LevelUpOverlay from "../../components/LevelUpOverlay/LevelUpOverlay";
import { REWARD_TABLE } from "../../constants/rewards";
import HeroAvatar from "../../components/HeroAvatar/HeroAvatar";
import QuestFilter from "../../components/QuestFilter/QuestFilter";
import "./Dashboard.css";

export default function Dashboard() {
    const { user, logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [quests, setQuests] = useState([]);
    const [completedQuests, setCompletedQuests] = useState([]);
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [activeFilter, setActiveFilter] = useState('All');

    // 1. ADD THE CLEAR ALL FUNCTION
    const handleClearAllHistory = async () => {
        const confirmClear = window.confirm("Are you sure? This will erase your entire legend forever! 📜🔥");

        if (confirmClear) {
            try {
                // We create a promise for every delete operation
                const deletePromises = completedQuests.map(quest =>
                    deleteDoc(doc(db, "quests", quest.id))
                );

                // Wait for all deletions to finish
                await Promise.all(deletePromises);

                // Reset to page 1 since history is gone
                setCurrentPage(1);
                toast.success("History wiped clean!");
            } catch (err) {
                console.error(err);
                toast.error("Failed to clear some items.");
            }
        }
    };

    // PAGINATION STATE
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        if (!user) return;
        const docRef = doc(db, "users", user.uid);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                setProfile({ ...docSnap.data() });
            }
        });
        return () => unsubscribe();
    }, [user]);

    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, "quests"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
        );
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const active = [];
            const finished = [];

            querySnapshot.forEach((doc) => {
                const data = { id: doc.id, ...doc.data() };
                if (data.status === "completed") {
                    finished.push(data);
                } else {
                    active.push(data);
                }
            });

            setQuests(active);
            setCompletedQuests(finished);
        });
        return () => unsubscribe();
    }, [user]);

    const handleAddQuest = async (questData) => {
        try {
            if (!user) return;
            await addDoc(collection(db, "quests"), {
                ...questData,
                userId: user.uid,
                createdAt: serverTimestamp(),
                status: "active"
            });
            toast.success("New Quest Summoned! 📜");
        } catch (err) {
            toast.error("Failed to summon quest...");
        }
    };

    const handleCompleteQuest = async (questId, questXp) => {
        try {
            if (!user || !profile) return;

            let newXp = (profile.xp || 0) + questXp;
            let newLevel = profile.level || 1;
            let leveledUp = false;
            let unlockedItem = null;

            if (newXp >= 100) {
                newLevel += 1;
                newXp = newXp - 100;
                leveledUp = true;

                // CHECK FOR REWARD
                if (REWARD_TABLE[newLevel]) {
                    unlockedItem = REWARD_TABLE[newLevel];
                }
            }

            const userRef = doc(db, "users", user.uid);

            // Prepare the update object
            const updates = {
                xp: newXp,
                level: newLevel
            };

            // If an item was unlocked, add it to the user's inventory
            if (unlockedItem) {
                // We use an array to store all unlocked item IDs
                const currentInventory = profile.inventory || [];
                if (!currentInventory.includes(unlockedItem.id)) {
                    updates.inventory = [...currentInventory, unlockedItem.id];
                }
            }

            await updateDoc(userRef, updates);

            // Update Quest Status
            const questRef = doc(db, "quests", questId);
            await updateDoc(questRef, {
                status: "completed",
                completedAt: serverTimestamp()
            });

            if (leveledUp) {
                setShowLevelUp(true);
                if (unlockedItem) {
                    toast(`UNLOCKED: ${unlockedItem.name}!`, { icon: unlockedItem.icon });
                }
            } else {
                toast.success(`Quest Finished! +${questXp} XP`);
            }

        } catch (err) {
            console.error(err);
            toast.error("Error claiming reward.");
        }
    };

    // DELETE FROM HISTORY
    const handleDeleteHistory = async (questId) => {
        try {
            await deleteDoc(doc(db, "quests", questId));
            toast.success("Memory erased! 🧹");
        } catch (err) {
            toast.error("Could not delete history item.");
        }
    };

    // PAGINATION CALCULATIONS
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = completedQuests.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(completedQuests.length / itemsPerPage);

    const filteredQuests = quests.filter(quest => {
        if (activeFilter === 'All') return true;
        return quest.difficulty === activeFilter;
    });

    return (
        <div className="dashboard-container">
            <Toaster position="top-center" reverseOrder={false} />

            <header className="stats-header">
                <HeroAvatar
                    inventory={profile?.inventory}
                    level={profile?.level}
                />
                <div className="hero-info">
                    <p>Logged in as {user?.email}</p>
                    <h2>{profile?.username || "Adventurer"}</h2>
                </div>

                <div className="xp-container">
                    <span>Level {profile?.level || 1}</span>
                    <div className="xp-bar-bg">
                        <div
                            className="xp-bar-fill"
                            style={{ width: profile ? `${(profile.xp / 100) * 100}%` : "0%" }}
                        ></div>
                    </div>
                    <small style={{ color: "#94a3b8" }}>{profile?.xp || 0} / 100 XP</small>
                </div>

                <button onClick={logout} className="logout-btn">Leave Tavern</button>
            </header>

            <main className="quest-section">
                <div className="section-header">
                    <h3>Current Quest Board</h3>
                    <button className="add-quest-pill" onClick={() => setIsModalOpen(true)}>
                        + New Quest
                    </button>
                </div>

                {/* 1. ADD THE FILTER UI HERE */}
                <QuestFilter
                    activeFilter={activeFilter}
                    setActiveFilter={setActiveFilter}
                />

                {/* 2. USE filteredQuests INSTEAD OF quests */}
                {filteredQuests.length === 0 ? (
                    <div className="empty-state">
                        <h1 style={{ fontSize: "2rem", opacity: 0.2 }}>
                            {activeFilter === 'All' ? "NO ACTIVE QUESTS" : `NO ${activeFilter.toUpperCase()} QUESTS`}
                        </h1>
                    </div>
                ) : (
                    <div className="quest-grid">
                        {filteredQuests.map((quest) => (
                            <div key={quest.id} className={`quest-card ${quest.difficulty.toLowerCase()}`}>
                                <div className="quest-info">
                                    <div className="card-meta">
                                        <span className="difficulty-label">{quest.difficulty}</span>
                                        {/* ADD THIS SPAN */}
                                        <span className="duration-label">⏳ {quest.duration}m</span>
                                    </div>
                                    <h4>{quest.title}</h4>
                                </div>
                                <div className="quest-reward-zone">
                                    <span className="xp-badge">+{quest.xp} XP</span>
                                    <button className="complete-btn" onClick={() => handleCompleteQuest(quest.id, quest.xp)}>
                                        Complete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* --- UPDATED HISTORY SECTION --- */}
                <section className="history-section" style={{ marginTop: "4rem" }}>
                    <div className="section-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <h3>Quest History</h3>
                            <span className="count-badge">{completedQuests.length} Total</span>
                        </div>

                        {/* 2. ADD THE CLEAR BUTTON IN THE HEADER */}
                        {completedQuests.length > 0 && (
                            <button
                                className="clear-all-btn"
                                onClick={handleClearAllHistory}
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    <div className="history-list">
                        {currentItems.length === 0 ? (
                            <p className="empty-text">No legends written yet...</p>
                        ) : (
                            currentItems.map((quest) => (
                                <div key={quest.id} className="history-item">
                                    <div className="history-info">
                                        <span className="check-icon">✔</span>
                                        <p>{quest.title}</p>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                        <span className="xp-reward">+{quest.xp} XP</span>
                                        <button
                                            className="delete-hist-btn"
                                            onClick={() => handleDeleteHistory(quest.id)}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* PAGINATION CONTROLS */}
                    {totalPages > 1 && (
                        <div className="pagination-controls">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                            >
                                Previous
                            </button>
                            <span>Page {currentPage} of {totalPages}</span>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </section>
            </main>

            <QuestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddQuest={handleAddQuest} />
            <LevelUpOverlay
                isOpen={showLevelUp}
                level={profile?.level}
                onClose={() => setShowLevelUp(false)}
            />
        </div>
    );
}