import { useState } from "react";
import { useAuth } from "../../context/AuthContext/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState(""); // New state for Username
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const { login, signUp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                // In Phase 2, we will save the 'username' to Firestore here
                await signUp(email, password, username);
            }
            navigate("/");
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                setError("This email is already registered. Try logging in!");
            } else {
                setError("Failed to create account. Check your password length (min 6).");
            }
            console.error(err);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>{isLogin ? "Welcome Back, Hero" : "Begin Your Quest"}</h2>
                <p>{isLogin ? "The Tavern awaits your return." : "Create an account to track your XP."}</p>

                {error && <div style={{ color: "#ff4444", marginBottom: "1rem" }}>{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    {/* Username Field - Only shows during Sign Up */}
                    {!isLogin && (
                        <div className="input-group">
                            <label>Character Name (Username)</label>
                            <input
                                type="text"
                                placeholder="e.g. ShadowCoder"
                                required
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="input-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="hero@questlog.com"
                            required
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            required
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="auth-btn">
                        {isLogin ? "Enter Tavern" : "Start Adventure"}
                    </button>
                </form>

                <div className="toggle-auth">
                    {isLogin ? "New to the realm?" : "Already have a character?"}{" "}
                    <span className="toggle-link" onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? "Sign Up" : "Log In"}
                    </span>
                </div>
            </div>
        </div>
    );
}