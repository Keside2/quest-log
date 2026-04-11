# QuestLog ⚔️ - Gamified Productivity for Developers

QuestLog is a specialized productivity SaaS that transforms daily coding tasks and professional habits into an RPG-style adventure. Built for developers who want to stay engaged with their goals, QuestLog turns every "To-Do" into a "Quest."

## 🚀 Concept

Most productivity tools feel like chores. **QuestLog** uses gamification mechanics—XP, Leveling, and Evolution Tiers—to drive user retention and make progress feel rewarding.

## 🛠️ Tech Stack

### Frontend

- **Framework:** React (Plain CSS for high-performance, custom styling)
- **State Management:** React Context API
- **Real-time Data:** Firebase Firestore (Listeners for instant UI updates)
- **Feedback:** React Hot Toast + custom CSS animations

### Backend (The Oracle Proxy)

- **Environment:** Node.js & Express
- **Deployment:** Render (Bypassing regional ISP restrictions for global access)
- **Integrations:** GitHub Search API (Automated XP via Commits)
- **Security:** Proxy-layer authentication to shield API tokens.

---

## 📈 Technical Roadmap

### Phase 1: The Core Loop (Completed ✅)

- [x] **The Gatehouse:** Mobile-first Authentication (Login/Sign-up).
- [x] **Hero Identity:** Firestore integration for Usernames and Stats.
- [x] **The HUD:** Dynamic Dashboard with animated XP bar.
- [x] **Victory Sequence:** Level-Up Overlay animation and logic.
- [x] **Tactical HUD:** Real-time Difficulty Filtering (Easy/Medium/Hard).

### Phase 2: The Hero's Journey (Completed ✅)

- [x] **Boss Battles:** High-stakes project milestones with "multi-hit" HP requirements.
- [x] **Screen Shake:** Impact effects for Boss attacks.
- [x] **Evolutionary Avatar:** Visual "Hero" character that transforms at level milestones.
- [x] **The Honor System:** "Proof of Work" verification required to claim XP.
- [x] **Habit Streaks:** Daily login bonuses and task consistency tracking.

### Phase 3: The Oracle Integration (New! 🛡️)

- [x] **GitHub Sync:** Automated XP gain from GitHub commits.
- [x] **Oracle Proxy:** Node.js backend to bypass ISP blocks and ensure 100% uptime.
- [x] **Anti-Cheat Lock:** `lastSyncedCommitCount` logic to prevent XP double-dipping.
- [x] **Auto-Chronicle:** GitHub syncs automatically generate entries in Quest History.

### Phase 4: Future Evolution (The Legendary Tier 🏗️)

- [ ] **Social Tavern:** Global Leaderboard (Hall of Heroes) to compare XP with friends.
- [ ] **The Forge:** Use XP/Gold to unlock custom CSS themes and avatar frames.
- [ ] **Soundscape:** 8-bit audio cues for quest completion and UI interaction.

---

## 👹 Advanced Mechanics

### The Oracle Proxy Architecture

To ensure users in all regions (including Nigeria) can sync their GitHub data without a VPN, QuestLog uses a **Node.js Proxy Server**.

- **The Flow:** Client ➔ Express Proxy (Render) ➔ GitHub API.
- **The Result:** Faster response times and zero connectivity issues.

### Mathematical Scaling

- **Level Progression:** XP requirements scale using $100 \times 1.2^{L-1}$.
- **Boss Scaling:** Boss HP scales dynamically: $HP = Base + Level \times 1.5$.

---

## 👤 Hero Evolution Tiers

| Tier           | Levels  | Icon | Title          |
| :------------- | :------ | :--- | :------------- |
| **Apprentice** | 1 - 4   | 👤   | The Wanderer   |
| **Warrior**    | 5 - 9   | ⚔️   | The Skirmisher |
| **Knight**     | 10 - 19 | 🛡️   | The Guardian   |
| **Lord**       | 20 - 49 | 👑   | The Sovereign  |
| **Mythic**     | 50+     | 🧙‍♂️   | The Eternal    |

---

## 📜 Dev Log

### Day 90

> The big 9-0 is finally here! Taking a well-deserved rest day today.

---

## ⚙️ Development Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Keside2/quest-log.git](https://github.com/Keside2/quest-log.git)
   cd quest-log
   ```
