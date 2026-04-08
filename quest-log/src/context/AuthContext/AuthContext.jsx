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
    async function loginWithGithub() {
        const provider = new GithubAuthProvider();
        provider.addScope('repo');

        setLoading(true); // Start loader
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Get the token and the username (screenName)
            const credential = GithubAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const githubUsername = result._tokenResponse.screenName;

            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                await setDoc(userRef, {
                    username: user.displayName || "Adventurer",
                    githubUsername: githubUsername, // Added this!
                    email: user.email,
                    level: 1,
                    xp: 0,
                    githubToken: token,
                    createdAt: new Date()
                });
            } else {
                // Update both so the Sync button works immediately
                await updateDoc(userRef, {
                    githubToken: token,
                    githubUsername: githubUsername
                });
            }

            setLoading(false); // Stop loader
            return result;
        } catch (error) {
            setLoading(false); // Stop loader on error
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