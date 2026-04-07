import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../../services/firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    GithubAuthProvider,
    // Using Redirect for better network stability
    signInWithRedirect,
    getRedirectResult
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- GITHUB LOGIN (REDIRECT) ---
    async function loginWithGithub() {
        const provider = new GithubAuthProvider();
        // Permission to see repos for Day 87!
        provider.addScope('repo');
        return await signInWithRedirect(auth, provider);
    }

    // --- CATCH THE REDIRECT RESULT ---
    useEffect(() => {
        const handleRedirect = async () => {
            try {
                const result = await getRedirectResult(auth);
                if (result) {
                    const user = result.user;
                    const credential = GithubAuthProvider.credentialFromResult(result);
                    const token = credential.accessToken;

                    const userRef = doc(db, "users", user.uid);
                    const userSnap = await getDoc(userRef);

                    if (!userSnap.exists()) {
                        await setDoc(userRef, {
                            username: user.displayName || "Adventurer",
                            email: user.email,
                            level: 1,
                            xp: 0,
                            githubToken: token,
                            createdAt: new Date()
                        });
                    } else {
                        // Option 2 at work: If they exist, just update the token!
                        await updateDoc(userRef, { githubToken: token });
                    }
                }
            } catch (error) {
                console.error("Redirect Result Error:", error);
                // Alerting for mobile debugging if needed
                if (error.code !== 'auth/popup-closed-by-user') {
                    // alert("Auth Error: " + error.message);
                }
            }
        };

        handleRedirect();
    }, []);

    // Email/Password Sign Up
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
        <AuthContext.Provider value={{ user, signUp, login, logout, resetPassword, loginWithGithub }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}