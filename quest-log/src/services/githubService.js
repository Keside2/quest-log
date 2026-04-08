// src/services/githubService.js
const GITHUB_API_URL = "https://api.github.com";

export const fetchGithubCommits = async (githubToken, username) => {
    try {
        const response = await fetch(`${GITHUB_API_URL}/users/${username}/events`, {
            headers: {
                Authorization: `token ${githubToken}`,
                "Accept": "application/vnd.github.v3+json",
            },
        });
        if (!response.ok) throw new Error("Failed to fetch GitHub events");

        const events = await response.json();
        const today = new Date().toISOString().split('T')[0];

        const dailyCommits = events.filter(event =>
            event.type === "PushEvent" && event.created_at.startsWith(today)
        );

        let commitCount = 0;
        dailyCommits.forEach(event => {
            commitCount += event.payload.commits.length;
        });

        return commitCount;
    } catch (error) {
        console.error("Github Service Error:", error);
        return 0;
    }
};

// --- NEW: THE QUADRATIC LEVELING FORMULA ---
export const calculateLevelInfo = (totalXP) => {
    // Level = sqrt(XP / 100) + 1
    const currentLevel = Math.floor(Math.sqrt(totalXP / 100)) + 1;
    // XP needed for NEXT level: (Level)^2 * 100
    const nextLevelXP = Math.pow(currentLevel, 2) * 100;

    return { currentLevel, nextLevelXP };
};