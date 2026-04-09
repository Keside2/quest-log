// src/services/githubService.js

// Replace 'your-backend-url' with the actual URL from your Render Web Service
const API_BASE_URL = window.location.hostname === 'localhost'
    ? "http://localhost:5000"
    : "https://your-backend-url.onrender.com";

/**
 * Fetches commit count via our Proxy Server to bypass ISP blocks
 */
export const fetchGithubCommits = async (githubToken, username) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/api/github-proxy?token=${githubToken}&username=${username}`
        );

        if (!response.ok) {
            // If the proxy fails, we log it but return 0 to prevent app crashes
            console.error("Proxy Shield Failed: The Oracle is currently unreachable.");
            return 0;
        }

        const data = await response.json();

        // The proxy returns { total_count: X }
        console.log(`Oracle Proxy found ${data.total_count} commits.`);
        return data.total_count || 0;

    } catch (error) {
        console.error("Github Service Error:", error);
        return 0;
    }
};

/**
 * Logic for calculating Level and Next Level Requirements
 */
export const calculateLevelInfo = (totalXP) => {
    // Level = floor(sqrt(XP / 100)) + 1
    const currentLevel = Math.floor(Math.sqrt(totalXP / 100)) + 1;
    // XP needed for NEXT level: (Level)^2 * 100
    const nextLevelXP = Math.pow(currentLevel, 2) * 100;

    return { currentLevel, nextLevelXP };
};