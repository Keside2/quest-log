# QuestLog ⚔️ - Gamified Productivity for Developers

QuestLog is a specialized productivity SaaS that transforms daily coding tasks and professional habits into an RPG-style adventure. Built for developers who want to stay engaged with their goals, QuestLog turns every "To-Do" into a "Quest."

## 🚀 Concept

Most productivity tools feel like chores. **QuestLog** uses gamification mechanics—XP, Leveling, and Evolution Tiers—to drive user retention and make progress feel rewarding.

## 🛠️ Tech Stack (Current)

- **Frontend:** React (Plain CSS for high-performance styling)
- **State Management:** React Context API
- **Backend/DB:** Firebase (Firestore & Auth)
- **Navigation:** React Router DOM
- **Feedback:** React Hot Toast

---

## 📈 Technical Roadmap

### Phase 1: The Core Loop (Completed ✅)

- [x] **Project Setup:** React + Firebase Initialization.
- [x] **The Gatehouse:** Mobile-first Authentication (Login/Sign-up).
- [x] **Hero Identity:** Firestore integration for Usernames and Stats.
- [x] **The HUD:** Dynamic Dashboard with animated XP bar.
- [x] **The Archivist:** Quest History with Pagination and Delete logic.
- [x] **Victory Sequence:** Level-Up Overlay animation and logic.
- [x] **Quest CRUD:** Create, Read, Update, and Delete logic for tasks.
- [x] **Time Mastery:** Estimated duration tracking for better raid planning.
- [x] **Tactical HUD:** Real-time Difficulty Filtering (Easy/Medium/Hard).

### Phase 2: The Hero's Journey (In Progress 🏗️)

- [x] **Boss Battles:** High-stakes project milestones with "multi-hit" HP requirements. ✅
- [x] **Screen Shake:** Impact effects for Boss attacks. ✅
- [x] **Evolutionary Avatar:** Visual "Hero" character that transforms at level milestones. ✅
- [x] **Loot Drops:** Logic to "award" items to the user's Firestore inventory.✅
- [x] **Scaling Difficulty:** Level-based Boss evolution (Higher Level = More HP/Timers).

### Phase 3: Polish & Sound

- [x] Level Logic: Mathematical formula for scaling Level-Up thresholds ($100 \times 1.2^{L-1}$). ✅
- [x] **Habit Streaks:** Logic for daily login bonuses and task consistency. ✅
- [ ] **Sound Effects:** 8-bit audio cues for quest completion and UI interaction.

---

## 👤 Hero Evolution Tiers

The user's avatar physically evolves as they grow stronger.

| Tier           | Levels  | Icon | Title          |
| :------------- | :------ | :--- | :------------- |
| **Apprentice** | 1 - 4   | 👤   | The Wanderer   |
| **Warrior**    | 5 - 9   | ⚔️   | The Skirmisher |
| **Knight**     | 10 - 19 | 🛡️   | The Guardian   |
| **Lord**       | 20 - 49 | 👑   | The Sovereign  |
| **Mythic**     | 50+     | 🧙‍♂️   | The Eternal    |

---

## 💎 The Arsenal (Boss Loot Table)

Players earn unique gear by defeating Bosses at specific level milestones.

| Level  | Item             | Icon | Description                                      |
| :----- | :--------------- | :--- | :----------------------------------------------- |
| **5**  | Iron Boots       | 🥾   | Heavy plating for steady advancement.            |
| **10** | Wanderer's Cloak | 🧥   | A rugged cloak for seasoned travelers.           |
| **15** | Silver Blade     | ⚔️   | A sharp edge for cutting through technical debt. |
| **20** | Ethereal Aura    | ✨   | The glow of a true Sovereign.                    |

---

## 🏗️ Data Schema: The Quest Model

| Field        | Type      | Description                                 |
| :----------- | :-------- | :------------------------------------------ |
| `title`      | String    | What you need to do (e.g., "Fix Navbar").   |
| `difficulty` | String    | Easy, Medium, or Hard.                      |
| `xp`         | Number    | The calculated reward (10, 25, or 50 XP).   |
| `duration`   | String    | Estimated time (15m, 30m, 60m, 120m).       |
| `status`     | String    | `active` or `completed`.                    |
| `type`       | String    | `normal` or `boss`.                         |
| `hp`         | Number    | Required "hits" to finish (Boss only).      |
| `userId`     | String    | Links the quest to the specific Hero's UID. |
| `createdAt`  | Timestamp | For sorting quests by date.                 |

---

## 👹 Boss Battle Mechanics

To handle large projects, QuestLog implements **Scaling Bosses**:

- **Multi-Hit HP:** Unlike normal quests, Bosses require multiple "attacks" (progress updates) to defeat.
- **Dynamic Scaling:** Boss HP scales with the player's level ($HP = Base + Level \times 1.5$).
- **Tiered Rewards:** Level 10+ Bosses unlock Legendary Loot and Auras.

---

## 🛡️ Future Evolution (The Legendary Tier)

- [ ] **The Honor System:** Optional "Proof of Work" field required to claim XP.
- [ ] **Automated Quests:** GitHub API integration for XP via Commits/PRs.
- [ ] **Social Tavern:** View friend's avatars and compete on a leaderboard.

---

## 📜 Dev Log

### Day 83

> final pre-launch polish and documentation review.

---

## ⚙️ Development Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Keside2/quest-log.git](https://github.com/Keside2/quest-log.git)
   cd quest-log
   npm install
   npm start
   ```
