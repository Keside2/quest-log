import { useAuth } from "../../context/AuthContext/AuthContext";
import { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import "./Dashboard.css";

export default function Dashboard() {
    const { user, logout } = useAuth();
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (user) {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setProfile(docSnap.data());
                }
            }
        };
        fetchProfile();
    }, [user]);

    return (
        <div className="dashboard-container">
            {/* --- HERO HUD --- */}
            <header className="stats-header">
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

            {/* --- MAIN CONTENT AREA --- */}
            <main style={{ textAlign: "center", marginTop: "5rem" }}>
                <h1 style={{ fontSize: "3rem", opacity: 0.2 }}>NO ACTIVE QUESTS</h1>
                <button className="auth-btn" style={{ maxWidth: "250px" }}>
                    + Begin New Quest
                </button>
            </main>
        </div>
    );
}