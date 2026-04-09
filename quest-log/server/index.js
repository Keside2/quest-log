const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/github-proxy', async (req, res) => {
    const { token, username } = req.query;

    if (!token || !username) {
        return res.status(400).json({ error: "Missing credentials" });
    }

    try {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

        // This request happens from Render's server, bypassing Nigerian ISP blocks
        const response = await axios.get(`https://api.github.com/search/commits`, {
            params: { q: `author:${username} committer-date:>${sevenDaysAgo}` },
            headers: {
                Authorization: `token ${token}`,
                "Accept": "application/vnd.github.cloak-preview"
            }
        });

        res.json({ total_count: response.data.total_count });
    } catch (error) {
        console.error("Proxy Error:", error.response?.data || error.message);
        res.status(500).json({ error: "GitHub Oracle connection failed" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Oracle Proxy running on port ${PORT}`));