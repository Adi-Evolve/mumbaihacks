# ⚡ INSTANT SERVER SETUP

## 📋 Copy-Paste These 3 Commands

### Step 1: Install
```bash
pip install fastapi uvicorn openai pydantic
```

### Step 2: Configure (Choose ONE)

**Option A: With OpenAI API (Better Results)**
```bash
# Edit server.py line 22:
# Change: OPENAI_API_KEY = "your-api-key-here"
# To:     OPENAI_API_KEY = "sk-your-actual-openai-key"
```

**Option B: Without API Key (Free, Still Works!)**
```bash
# Do nothing - server will use rule-based detection
```

### Step 3: Run
```bash
python server.py
```

✅ **Done!** Server running on port 8002

---

## 🧪 Quick Test

```bash
curl http://localhost:8002/api/v1/health
```

Should see: `{"status": "healthy"}`

---

## 🎯 What You Got

✅ **One file**: `server.py` (450 lines)  
✅ **Complete API**: Health check + Analysis  
✅ **AI-powered**: GPT-4 detection  
✅ **Fallback**: Works without API key  
✅ **CORS enabled**: Extension can connect  
✅ **Auto-docs**: Visit http://localhost:8002/docs  

---

## 🚀 Next: Test with Extension

1. Server running? ✅
2. Reload extension: `chrome://extensions/` → Reload
3. Visit NDTV article
4. See "Show Suspicious Lines" button
5. Click it → Highlights appear! 🎨

---

## 🔑 Get OpenAI API Key (Optional)

1. Visit: https://platform.openai.com/api-keys
2. Sign up / Log in
3. Click "Create new secret key"
4. Copy key (starts with `sk-`)
5. Paste in `server.py` line 22

**Cost**: ~$0.01 per article analysis (very cheap!)

---

## 📊 Server Status

When running, you'll see:
```
🚀 MISINFORMATION DETECTION SERVER
Host: 0.0.0.0
Port: 8002
AI Enabled: True

📊 NEW ANALYSIS REQUEST
🤖 Using OpenAI GPT-4 for analysis...
✅ ANALYSIS COMPLETE
Suspicious sentences found: 3
```

---

## ⚡ That's It!

**Created**: Production-ready server in 1 file  
**Setup**: 3 commands  
**Time**: 2 minutes  
**Status**: Ready for hackathon! 🎉

Read `SERVER_SETUP_COMPLETE.md` for full details!
