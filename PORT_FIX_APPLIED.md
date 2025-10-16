# ✅ PORT FIXED: 8000 → 8002

## What I Changed:

Your extension was trying to connect to **port 8000**, but your friend's server is running on **port 8002**!

### Files Updated:

1. **`extension/content.js`**
   - Changed: `http://10.25.26.187:8000` → `http://10.25.26.187:8002`
   - Line 7: API_ENDPOINT now points to port 8002

2. **`extension/background.js`**
   - Changed: `http://10.25.26.187:8000` → `http://10.25.26.187:8002`
   - Line 22: API_BASE_URL now points to port 8002

3. **`AI_PROMPT_FOR_SERVER.md`**
   - Updated all references to use port 8002
   - AI will now generate server code for port 8002

---

## ⚡ NEXT STEPS - DO THIS NOW:

### 1. Reload Extension
```
1. Go to: chrome://extensions/
2. Click "Reload" button on your extension
```

### 2. Reload NDTV Page
```
Press Ctrl+Shift+R (hard reload) on the NDTV article page
```

### 3. Check Console
You should now see:
```
🔍 ========== TESTING SERVER CONNECTION ==========
🌐 Server URL: http://10.25.26.187:8002/api/v1/analyze
📡 Attempting to connect to: http://10.25.26.187:8002/api/v1/health
```

---

## 🎯 Expected Outcome:

**If server has CORS properly configured:**
```
✅ SERVER CONNECTED!
✅ Step 3: Server response received!
✅ Step 5: Analysis complete!
```

**If still getting CORS error:**
- Server needs CORS fix (use AI_PROMPT_FOR_SERVER.md)
- Make sure server is listening on `0.0.0.0:8002` (not `127.0.0.1`)
- Friend must restart server after adding CORS

---

## 🔍 Quick Test:

**In your browser, open new tab and visit:**
```
http://10.25.26.187:8002/api/v1/health
```

**Should see:**
```json
{"status": "ok"}
```

**If you see this → Server is reachable! Just needs CORS fix.**

**If connection fails → Check:**
- Server running?
- Same WiFi network?
- Firewall blocking port 8002?

---

## 📋 Summary:

| Item | Before | After | Status |
|------|--------|-------|--------|
| Extension Port | 8000 | 8002 | ✅ FIXED |
| Background.js Port | 8000 | 8002 | ✅ FIXED |
| AI Prompt Port | 8000 | 8002 | ✅ UPDATED |
| CORS Issue | ❌ Still there | ⏳ Needs server fix | PENDING |

---

## 🚀 Ready!

Your extension now points to the correct port (8002). 

**Just reload the extension and the page, and it should try to connect to the right server!** 🎉
