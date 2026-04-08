import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../../services/firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    // NEW IMPORTS
    GithubAuthProvider,
    signInWithPopup
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- NEW: GITHUB LOGIN FUNCTION ---
    async function loginWithGithub() {
        const provider = new GithubAuthProvider();
        // Request 'repo' scope so we can read your commit history later
        provider.addScope('repo');

        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // This is the "Magic Key" for the GitHub API
            const credential = GithubAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;

            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                // First time GitHub login: Create the profile
                await setDoc(userRef, {
                    username: user.displayName || "Adventurer",
                    email: user.email,
                    level: 1,
                    xp: 0,
                    githubToken: token, // Save the token for Day 87!
                    createdAt: new Date()
                });
            } else {
                // Returning user: Just update the token (they expire or change)
                await updateDoc(userRef, { githubToken: token });
            }

            return result;
        } catch (error) {
            console.error("GitHub Login Error:", error);
            throw error;
        }
    }

    // Existing functions...
    async function signUp(email, password, username) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await setDoc(doc(db, "users", user.uid), {
            username: username,
            email: email,
            level: 1,
            xp: 0,
            createdAt: new Date()
        });
        return userCredential;
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    function logout() {
        return signOut(auth);
    }

    function resetPassword(email) {
        return sendPasswordResetEmail(auth, email);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return (
        // Added loginWithGithub to the value prop
        <AuthContext.Provider value={{ user, signUp, login, logout, resetPassword, loginWithGithub }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}