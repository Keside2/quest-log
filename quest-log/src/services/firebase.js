import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

// Your web app's Firebase configuration
// These will be pulled from your .env file for security
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services for use in the app


export const auth = getAuth(app);
export const db = getFirestore(app);

// --- ADD THE LEADERBOARD LOGIC HERE ---


export const fetchTopHeroes = async () => {
    try {
        const heroesRef = collection(db, "users");
        // Sort by Level first, then XP for tie-breaking
        const q = query(heroesRef, orderBy("level", "desc"), orderBy("xp", "desc"), limit(10));

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching Hall of Heroes:", error);
        return [];
    }
};

export default app;