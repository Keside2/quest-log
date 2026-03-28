import { useState } from "react";
import { useAuth } from "../../context/AuthContext/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState(""); // For success messages

    const { login, signUp, resetPassword } = useAuth(); // Added resetPassword
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await signUp(email, password, username);
            }
            navigate("/");
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                setError("This email is already registered. Try logging in!");
            } else {
                setError("Invalid credentials or account error.");
            }
            console.error(err);
        }
    };

    // Handler for Forgot Password
    const handleForgotPassword = async () => {
        if (!email) {
            setError("Please enter your email address first.");
            return;
        }
        try {
            await resetPassword(email);
            setMessage("Check your inbox for password reset instructions!");
            setError("");
        } catch (err) {
            setError("Failed to send reset email. Check if the email is correct.");
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>{isLogin ? "Welcome Back, Hero" : "Begin Your Quest"}</h2>
                <p>{isLogin ? "The Tavern awaits your return." : "Create an account to track your XP."}</p>

                {error && <div style={{ color: "#ff4444", marginBottom: "1rem" }}>{error}</div>}
                {message && <div style={{ color: "#10b981", marginBottom: "1rem" }}>{message}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
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
                            required={isLogin} // Only strictly required for Login/Signup
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {/* Forgot Password Link */}
                    {isLogin && (
                        <div style={{ textAlign: "right", marginTop: "-10px", marginBottom: "15px" }}>
                            <span
                                onClick={handleForgotPassword}
                                style={{ color: "#38bdf8", fontSize: "0.8rem", cursor: "pointer", textDecoration: "underline" }}
                            >
                                Forgot Password?
                            </span>
                        </div>
                    )}

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