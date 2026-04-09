// src/services/githubService.js
const GITHUB_API_URL = "https://api.github.com";

export const fetchGithubCommits = async (githubToken, username) => {
    try {
        // Look for commits in the last 24 hours
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        // The Search API is the "Heavy Hitter" - it finds everything
        const response = await fetch(
            `${GITHUB_API_URL}/search/commits?q=author:${username}+committer-date:>${twentyFourHoursAgo}`,
            {
                headers: {
                    Authorization: `token ${githubToken}`,
                    "Accept": "application/vnd.github.cloak-preview" // Required for Search API
                },
            }
        );

        if (!response.ok) {
            const errData = await response.json();
            console.error("GitHub API Error:", errData);
            throw new Error("Failed to search commits");
        }

        const data = await response.json();

        // 'total_count' tells us exactly how many commits you made
        console.log(`Oracle Search found ${data.total_count} commits.`);
        return data.total_count || 0;

    } catch (error) {
        console.error("Github Service Error:", error);
        return 0;
    }
};

export const calculateLevelInfo = (totalXP) => {
    const currentLevel = Math.floor(Math.sqrt(totalXP / 100)) + 1;
    const nextLevelXP = Math.pow(currentLevel, 2) * 100;
    return { currentLevel, nextLevelXP };
};