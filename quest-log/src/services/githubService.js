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

        // WIDEN THE WINDOW: Check for pushes in the last 48 hours
        // This stops the "expiration" issue if you push late at night
        const fortyEightHoursAgo = new Date();
        fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);

        console.log("Checking for pushes since:", fortyEightHoursAgo.toLocaleString());

        const dailyCommits = events.filter(event => {
            const eventDate = new Date(event.created_at);
            return event.type === "PushEvent" && eventDate > fortyEightHoursAgo;
        });

        let commitCount = 0;
        dailyCommits.forEach(event => {
            if (event.payload && event.payload.commits) {
                commitCount += event.payload.commits.length;
            }
        });

        console.log(`Total Commits found: ${commitCount}`);
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