# QuestLog ⚔️ - Gamified Productivity for Developers

QuestLog is a specialized productivity SaaS that transforms daily coding tasks and professional habits into an RPG-style adventure. Built for developers who want to stay engaged with their goals, QuestLog turns every "To-Do" into a "Quest."

## 🚀 Concept

Most productivity tools feel like chores. **QuestLog** uses gamification mechanics—XP, Leveling, and Achievement Badges—to drive user retention and make progress feel rewarding.

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

### Phase 2: The Hero's Journey (In Progress 🏗️)

- [ ] **Difficulty Matrix:** Implementation of XP rewards based on task complexity.
- [ ] **Layered Avatar System:** A visual "Hero" character that unlocks gear at specific levels.
- [ ] **Loot Drops:** Logic to "award" items (Cloaks, Swords, Auras) to the user's Firestore profile.
- [ ] **Boss Battles:** High-stakes quests with "multi-hit" requirements and legendary rewards.

### Phase 3: Polish & Sound

- [ ] **Level Logic:** Mathematical formula for scaling Level-Up thresholds.
- [ ] **Habit Streaks:** Logic for daily login bonuses and task consistency.
- [ ] **Sound Effects:** 8-bit audio cues for quest completion and UI interaction.

---

## 🏗️ Data Schema: The Quest Model

| Field         | Type      | Description                                 |
| :------------ | :-------- | :------------------------------------------ |
| `title`       | String    | What you need to do (e.g., "Fix Navbar").   |
| `difficulty`  | String    | Easy, Medium, or Hard.                      |
| `xp`          | Number    | The calculated reward (10, 25, or 50 XP).   |
| `status`      | String    | `active` or `completed`.                    |
| `userId`      | String    | Links the quest to the specific Hero's UID. |
| `createdAt`   | Timestamp | For sorting quests by date.                 |
| `completedAt` | Timestamp | For tracking when the legend was written.   |

---

## 🛡️ Future Evolution (The Legendary Tier)

- [ ] **The Honor System:** Optional "Proof of Work" field required to claim XP.
- [ ] **Automated Quests:** GitHub API integration for XP via Commits/PRs.
- [ ] **Social Tavern:** View friend's avatars and compete on a leaderboard.

---

## ⚙️ Development Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Keside2/quest-log.git](https://github.com/Keside2/quest-log.git)
   cd quest-log
   ```
