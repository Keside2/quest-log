import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../../services/firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    GithubAuthProvider,
    signInWithRedirect,
    getRedirectResult
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 1. GITHUB LOGIN (REDIRECT)
    async function loginWithGithub() {
        const provider = new GithubAuthProvider();
        provider.addScope('repo');
        // We set loading true here so the loader shows immediately
        setLoading(true);
        return await signInWithRedirect(auth, provider);
    }

    // 2. CATCH THE REDIRECT RESULT & SAVE DATA
    useEffect(() => {
        const handleRedirect = async () => {
            try {
                const result = await getRedirectResult(auth);

                if (result) {
                    const user = result.user;
                    const credential = GithubAuthProvider.credentialFromResult(result);
                    const token = credential.accessToken;

                    // CRITICAL FIX: Extract the GitHub screen name (username)
                    const githubUsername = result._tokenResponse.screenName;

                    const userRef = doc(db, "users", user.uid);
                    const userSnap = await getDoc(userRef);

                    if (!userSnap.exists()) {
                        await setDoc(userRef, {
                            username: user.displayName || "Adventurer",
                            githubUsername: githubUsername, // Saved for Syncing!
                            email: user.email,
                            level: 1,
                            xp: 0,
                            githubToken: token,
                            createdAt: new Date()
                        });
                    } else {
                        // Update both so the Sync button finds them
                        await updateDoc(userRef, {
                            githubToken: token,
                            githubUsername: githubUsername
                        });
                    }
                    toast.success("GitHub Linked successfully!");
                }
            } catch (error) {
                console.error("Auth Redirect Error:", error);
                if (error.code !== 'auth/popup-closed-by-user') {
                    // toast.error("Handshake failed. Use VPN!");
                }
            } finally {
                // We only stop loading once the redirect check is DONE
                setLoading(false);
            }
        };

        handleRedirect();
    }, []);

    // 3. LISTEN FOR AUTH STATE
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            // Don't set loading to false here if we are still checking redirect
            if (!window.location.search.includes('code=')) {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const value = { user, loading, signUp: (e, p, u) => createUserWithEmailAndPassword(auth, e, p), login: (e, p) => signInWithEmailAndPassword(auth, e, p), logout: () => signOut(auth), resetPassword: (e) => sendPasswordResetEmail(auth, e), loginWithGithub };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);