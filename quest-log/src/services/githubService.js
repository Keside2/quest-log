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

        // Fix: Check for pushes within the last 24 hours to avoid timezone issues
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const dailyCommits = events.filter(event => {
            const eventDate = new Date(event.created_at);
            return event.type === "PushEvent" && eventDate > twentyFourHoursAgo;
        });

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