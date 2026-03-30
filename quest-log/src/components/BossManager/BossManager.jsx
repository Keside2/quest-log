import { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import toast from 'react-hot-toast';

const bossMusic = new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3");

export default function BossManager({ user, profile, activeQuests, setIsWorldShaking }) {

    // Handle Background Music
    useEffect(() => {
        const hasActiveBoss = activeQuests.some(q => q.type === 'boss' && q.status === 'active');
        if (hasActiveBoss) {
            bossMusic.loop = true;
            bossMusic.volume = 0.4;
            bossMusic.play().catch(() => console.log("Audio waiting for interaction"));
        } else {
            bossMusic.pause();
            bossMusic.currentTime = 0;
        }
        return () => bossMusic.pause();
    }, [activeQuests]);

    // Handle Auto-Spawning
    useEffect(() => {
        const triggerSystemBoss = async () => {
            const isBossLevel = profile?.level > 0 && profile?.level % 5 === 0;

            if (isBossLevel && profile?.lastBossSummonedLevel !== profile.level) {
                try {
                    setIsWorldShaking(true);
                    setTimeout(() => setIsWorldShaking(false), 3000);

                    await addDoc(collection(db, "quests"), {
                        title: `👹 LEVEL ${profile.level} GUARDIAN`,
                        level: profile.level,
                        difficulty: "Hard",
                        xp: 100 * profile.level,
                        duration: "120",
                        type: "boss",
                        hp: profile.level,
                        currentHp: profile.level,
                        status: "active",
                        userId: user.uid,
                        createdAt: serverTimestamp(),
                        isSystemGenerated: true
                    });

                    await updateDoc(doc(db, "users", user.uid), {
                        lastBossSummonedLevel: profile.level
                    });

                    toast.error(`THE LEVEL ${profile.level} BOSS HAS ARRIVED!`, {
                        duration: 5000,
                        style: { background: '#1e1e2e', color: '#ef4444', border: '1px solid #ef4444' }
                    });
                } catch (err) {
                    console.error("Boss summon failed", err);
                }
            }
        };

        if (user && profile) triggerSystemBoss();
    }, [profile?.level, user, profile?.lastBossSummonedLevel, setIsWorldShaking]);

    return null; // This component doesn't render HTML, it just manages logic
}