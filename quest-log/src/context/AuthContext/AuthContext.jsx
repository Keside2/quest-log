import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../../services/firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    GithubAuthProvider,
    signInWithPopup
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- WORKING GITHUB LOGIN (POPUP) ---
    // Inside AuthContext.jsx
    async function loginWithGithub() {
        const provider = new GithubAuthProvider();
        // Explicitly ask for email and repo access
        provider.addScope('repo');
        provider.addScope('user:email');

        setLoading(true);
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const credential = GithubAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const githubUsername = result._tokenResponse.screenName;

            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            const userData = {
                githubToken: token,
                githubUsername: githubUsername,
                // Fallback chain to ensure email is NEVER null again
                email: user.email || result._tokenResponse.email || "Adventurer@questlog.com",
                lastLogin: new Date()
            };

            if (!userSnap.exists()) {
                await setDoc(userRef, {
                    ...userData,
                    username: user.displayName || "Adventurer",
                    level: 1,
                    xp: 0,
                    createdAt: new Date()
                });
            } else {
                await updateDoc(userRef, userData);
            }

            setLoading(false);
            return result;
        } catch (error) {
            setLoading(false);
            console.error("GitHub Login Error:", error);
            throw error;
        }
    }

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
        <AuthContext.Provider value={{ user, loading, signUp, login, logout, resetPassword, loginWithGithub }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}