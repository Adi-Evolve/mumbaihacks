# 🚀 Quick Server Connection Guide

## ⚡ 3-Step Setup

### 1️⃣ Load the Extension
1. Open Chrome and go to: `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `extension` folder
5. ✅ Extension loaded!

### 2️⃣ Configure Server Connection

**When you're ready to connect to your server:**

1. Open `extension/background.js`
2. Find line 17:
   ```javascript
   API_BASE_URL: 'http://localhost:8000/api/v1', // 👈 UPDATE THIS
   ```
3. Replace with your server's URL:
   - **Same computer:** `http://localhost:8000/api/v1` ✅ (already set)
   - **Another laptop:** `http://[SERVER_IP]:8000/api/v1`
   - **Production:** `https://your-domain.com/api/v1`

**Example:**
```javascript
API_BASE_URL: 'http://192.168.1.100:8000/api/v1', // Your friend's laptop IP
```

### 3️⃣ Reload Extension
1. Go back to `chrome://extensions/`
2. Click the **reload icon** (🔄) on your extension
3. Done! 🎉

---

## 🔍 Finding Server IP Address

### On Your Friend's Laptop (Server):

**Windows:**
```powershell
ipconfig
```
Look for `IPv4 Address` under your network adapter (e.g., `192.168.1.100`)

**Mac/Linux:**
```bash
ifconfig
# or
ip addr
```

---

## ✅ Testing Connection

1. Make sure server is running on friend's laptop
2. Both laptops on **same WiFi network**
3. Open any news website
4. Click extension icon
5. Click "Analyze This Page"
6. Should see analysis results! 🎊

---

## 🎨 Current UI Features

✨ **Soft Modern Design**
- Gentle gradient colors (soft purple/pink)
- Smooth rounded corners (24px radius)
- Soft shadows and blur effects
- Calming color palette
- Professional but friendly appearance

🎯 **Key Elements**
- 400px width popup
- Soft gradient header
- White content cards with subtle shadows
- Smooth animations and transitions
- Modern typography

---

## 🐛 Troubleshooting

### Extension won't load?
- ✅ Icons are now generated and present
- Check Developer mode is ON
- Try removing and re-adding the extension

### Can't connect to server?
- Verify server is running
- Check both devices on same network
- Verify IP address is correct in `background.js`
- Check firewall isn't blocking port 8000

### UI looks broken?
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Reload extension at chrome://extensions/
- Clear browser cache

---

## 📱 Demo Tips

1. **Before demo:** Load extension, configure server IP, test connection
2. **During demo:** Show clean UI, demonstrate analysis on live site
3. **Highlight:** Soft modern design, real-time analysis, clear results

Good luck! 🍀
