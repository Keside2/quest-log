// src/services/githubService.js
const GITHUB_API_URL = "https://api.github.com";

export const fetchGithubCommits = async (githubToken, username) => {
    try {
        // We add a timestamp to the URL to try and "bust" any browser caching
        const response = await fetch(`${GITHUB_API_URL}/users/${username}/events?nocache=${Date.now()}`, {
            headers: {
                Authorization: `token ${githubToken}`,
                "Accept": "application/vnd.github.v3+json",
            },
        });

        if (!response.ok) throw new Error("Failed to fetch GitHub events");

        const events = await response.json();

        // 1. Create a 48-hour safety window
        const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

        console.log("Oracle is searching all events since:", fortyEightHoursAgo.toLocaleString());

        // 2. Filter: Find any PushEvent in that 48h window
        const recentPushes = events.filter(event => {
            const eventDate = new Date(event.created_at);
            return event.type === "PushEvent" && eventDate > fortyEightHoursAgo;
        });

        let commitCount = 0;
        recentPushes.forEach(event => {
            if (event.payload && event.payload.commits) {
                console.log(`✅ Found ${event.payload.commits.length} commits at ${event.created_at}`);
                commitCount += event.payload.commits.length;
            }
        });

        console.log(`Total Oracle Count: ${commitCount}`);
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