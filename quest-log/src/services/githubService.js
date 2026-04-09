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

        // 1. Get Today's Date in your local time (YYYY-MM-DD)
        const localToday = new Date();
        const year = localToday.getFullYear();
        const month = String(localToday.getMonth() + 1).padStart(2, '0');
        const day = String(localToday.getDate()).padStart(2, '0');
        const todayString = `${year}-${month}-${day}`;

        console.log("Looking for events on date:", todayString);

        // 2. Filter events: Just check if the 'created_at' includes today's date string
        const dailyCommits = events.filter(event => {
            const isPush = event.type === "PushEvent";
            const isToday = event.created_at.includes(todayString);
            return isPush && isToday;
        });

        let commitCount = 0;
        dailyCommits.forEach(event => {
            if (event.payload && event.payload.commits) {
                commitCount += event.payload.commits.length;
            }
        });

        // 3. EMERGENCY FALLBACK: If 0 found for today, check the very last event 
        // just to see if the API is working at all.
        if (commitCount === 0 && events.length > 0) {
            console.log("No commits for today string. Latest event type:", events[0].type);
        }

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