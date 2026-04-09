// src/services/githubService.js
const GITHUB_API_URL = "https://api.github.com";

export const fetchGithubCommits = async (githubToken, username) => {
    try {
        // Look back 7 days to ensure we catch everything
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

        const response = await fetch(
            `${GITHUB_API_URL}/search/commits?q=author:${username}+committer-date:>${sevenDaysAgo}`,
            {
                headers: {
                    Authorization: `token ${githubToken}`,
                    "Accept": "application/vnd.github.cloak-preview"
                },
            }
        );

        if (!response.ok) return 0;
        const data = await response.json();
        return data.total_count || 0;
    } catch (error) {
        console.error("Github Service Error:", error);
        return 0;
    }
};

export const calculateLevelInfo = (totalXP) => {
    // Level = floor(sqrt(XP/100)) + 1
    const currentLevel = Math.floor(Math.sqrt(totalXP / 100)) + 1;
    const nextLevelXP = Math.pow(currentLevel, 2) * 100;
    return { currentLevel, nextLevelXP };
};