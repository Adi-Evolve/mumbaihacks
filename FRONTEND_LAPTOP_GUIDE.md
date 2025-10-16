# 🎯 FRONTEND LAPTOP - Quick Reference

## This Laptop = Chrome Extension Demo ONLY

---

## ✅ What You Need to Do:

### 1. Download Icons (2 minutes)
1. Open `extension/icon-generator.html` in browser
2. Click "Download All Three Sizes"
3. Move `icon16.png`, `icon48.png`, `icon128.png` to `extension/icons/` folder

### 2. Update Server Connection
**Edit `extension/background.js` - Line 2:**
```javascript
const API_URL = 'http://[YOUR_FRIEND_IP]:8000/api/analyze';
```

**Example:** If friend's laptop IP is `192.168.1.100`:
```javascript
const API_URL = 'http://192.168.1.100:8000/api/analyze';
```

### 3. Load Extension in Chrome
1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select the `extension` folder

---

## 🔥 At Hackathon - Quick Setup:

### Step 1: Connect to WiFi (same network as server laptop)

### Step 2: Get Server IP from Friend
Ask friend to run on their laptop:
```powershell
ipconfig
```
Note the IPv4 Address

### Step 3: Update background.js
```javascript
const API_URL = 'http://[FRIEND_IP]:8000/api/analyze';
```

### Step 4: Reload Extension
- Go to `chrome://extensions/`
- Click reload button on your extension

### Step 5: Test
- Visit BBC.com or any news site
- Click extension icon
- Click "Analyze This Page"

---

## 🎪 Demo Flow:

1. **Before judges arrive:**
   - Have 2-3 test websites open in tabs
   - Extension loaded and tested
   - Server connection verified

2. **During demo:**
   - Show automatic detection on page load
   - Click extension icon to show analysis
   - Explain the credibility score
   - Show the visual overlay

3. **Talking points:**
   - "Our extension analyzes content in real-time"
   - "Uses AI on our backend server to detect misinformation"
   - "Shows credibility scores and risk signals"
   - "Helps users identify fake news before sharing"

---

## 📱 Emergency Fallback:

If network fails, demo with screenshots or video recording of working extension.

---

## 🚫 DON'T Do This on Frontend Laptop:
- ❌ Install Python packages
- ❌ Run server.py
- ❌ Install backend dependencies
- ❌ Configure database

## ✅ DO This on Frontend Laptop:
- ✅ Load Chrome extension
- ✅ Update API URL
- ✅ Demo the extension
- ✅ Show the UI/UX

---

## Files on This Laptop:
```
extension/
├── manifest.json          ← Extension config
├── content.js             ← Main content analyzer
├── background.js          ← API communication (UPDATE SERVER IP HERE!)
├── popup.html/js          ← Extension popup UI
├── styles.css             ← Overlay styling
├── utils/
│   ├── contentExtractor.js ← Content extraction logic
│   └── cache.js           ← Caching system
└── icons/                 ← PUT DOWNLOADED ICONS HERE
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## Troubleshooting:

**Issue:** Extension not detecting content
- ✓ Check console (F12) for errors
- ✓ Refresh the webpage
- ✓ Check if auto-detect is enabled in popup

**Issue:** Can't connect to server
- ✓ Verify correct IP in background.js
- ✓ Check if both laptops on same WiFi
- ✓ Ping server: `ping [SERVER_IP]`

**Issue:** Icons not showing
- ✓ Download icons from icon-generator.html
- ✓ Place in extension/icons/ folder
- ✓ Reload extension

---

Good luck! 🏆
