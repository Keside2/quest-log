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

        // DEBUG: See what's coming back from GitHub
        console.log("All GitHub Events:", events);

        // Check for pushes within the last 24 hours
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const dailyCommits = events.filter(event => {
            const eventDate = new Date(event.created_at);
            // ONLY process PushEvents that happened in the last 24h
            return event.type === "PushEvent" && eventDate > twentyFourHoursAgo;
        });

        let commitCount = 0;
        dailyCommits.forEach(event => {
            // SAFE CHECK: Use ?. to prevent the "undefined" error
            // Also check if payload.commits actually exists
            if (event.payload && event.payload.commits) {
                commitCount += event.payload.commits.length;
            }
        });

        console.log(`Found ${commitCount} commits for ${username}`);
        return commitCount;
    } catch (error) {
        // This will now catch actual network errors instead of code crashes
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