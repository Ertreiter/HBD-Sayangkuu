# 💖 Our Journey Map — Birthday Game

An interactive pixel-art map game to celebrate your birthday. Click each **Memory Hub** on the map, answer a question about your journey together, and unlock a heartfelt memory.

When all 5 memories are unlocked — surprise! 🎂

---

## 🛠️ Personalising the Game

Edit **`data.js`** — it's the only file you need to change:

```js
const CONFIG = {
  herName: "Her Name",         // ← Her name for the surprise screen
  surpriseMessage: "...",      // ← The big birthday message
};

const HUBS = [
  {
    name: "Where We First Met",
    question: "What was the name of the café?",
    answer: "cafe name",       // ← Case-insensitive, trim-matched
    note:  "That day changed my life…",
    photo: "static/photos/photo_1.jpg",
    emoji: "☕",
  },
  // … repeat for all 5 hubs
];
```

### 📸 Adding Photos

Drop your photos into `static/photos/` named:
```
photo_1.jpg  photo_2.jpg  photo_3.jpg  photo_4.jpg  photo_5.jpg
```
If a photo is missing, a placeholder is shown automatically.

---

## 🚀 Running Locally

No installation needed — just open in a local server:

```bash
# Option 1: Python (built-in)
cd /path/to/HBD
python3 -m http.server 8080
# Open http://localhost:8080

# Option 2: Node.js
npx serve .
```

> ⚠️ Opening `index.html` directly (`file://`) may have issues loading photos due to browser security. Use a local server instead.

---

## 🌐 Deploying to GitHub Pages

1. Push this folder to a GitHub repository.
2. Go to **Settings → Pages**.
3. Set **Source** to `main` branch, root `/`.
4. Click **Save** — your game will be live at:
   ```
   https://<your-username>.github.io/<repo-name>/
   ```

No build step. No CI. Just push and play. ✨

---

## 🎮 Features

- 🗺️ Procedurally drawn pixel-art top-down map
- 🔒 5 locked Memory Hubs — unlocked by answering questions
- 💌 Photo + heartfelt note reveal on correct answer
- 🎂 Big Surprise screen with confetti when all 5 are unlocked
- 💾 Progress saved in browser (`localStorage`) — refresh-safe
- 📱 Touch-friendly for mobile play
