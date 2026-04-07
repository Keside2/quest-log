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
    const [message, setMessage] = useState("");

    // 1. ADD loginWithGithub HERE
    const { login, signUp, resetPassword, loginWithGithub } = useAuth();
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
            setError("Invalid credentials or account error.");
            console.error(err);
        }
    };

    // 2. CREATE THE GITHUB HANDLER
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    const handleGithubLogin = async () => {
        if (isAuthenticating) return; // Prevent double clicks

        setIsAuthenticating(true);
        setError("");
        try {
            await loginWithGithub();
            navigate("/");
        } catch (err) {
            // If the user just closed the popup manually, don't show a scary error
            if (err.code !== 'auth/popup-closed-by-user') {
                setError("Failed to link GitHub account.");
            }
            console.error(err);
        } finally {
            setIsAuthenticating(false);
        }
    };

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
            setError("Failed to send reset email.");
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>{isLogin ? "Welcome Back, Hero" : "Begin Your Quest"}</h2>
                <p>{isLogin ? "The Tavern awaits your return." : "Create an account to track your XP."}</p>

                {error && <div className="error-msg">{error}</div>}
                {message && <div className="success-msg">{message}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="input-group">
                            <label>Character Name</label>
                            <input type="text" placeholder="e.g. ShadowCoder" required onChange={(e) => setUsername(e.target.value)} />
                        </div>
                    )}

                    <div className="input-group">
                        <label>Email Address</label>
                        <input type="email" placeholder="hero@questlog.com" required onChange={(e) => setEmail(e.target.value)} />
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <input type="password" placeholder="••••••••" required={isLogin} onChange={(e) => setPassword(e.target.value)} />
                    </div>

                    {isLogin && (
                        <div className="forgot-pw">
                            <span onClick={handleForgotPassword}>Forgot Password?</span>
                        </div>
                    )}

                    <button type="submit" className="auth-btn">
                        {isLogin ? "Enter Tavern" : "Start Adventure"}
                    </button>
                </form>

                {/* 3. ADD THE GITHUB BUTTON SECTION */}
                <div className="auth-divider">
                    <span>OR</span>
                </div>

                <button type="button" onClick={handleGithubLogin} className="github-btn">
                    <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub" />
                    Continue with GitHub
                </button>

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