# 📨 MESSAGE FOR YOUR FRIEND

Copy-paste this message to send to your friend:

---

## 🚨 URGENT: Crisis Detection Server Update

Hey! We need to add crisis detection features for the hackathon. The extension is already updated on my end.

### 📋 What You Need to Do:

1. **Open this file:** `SERVER_CRISIS_ADDON.md`
2. **Follow the instructions** - it has 8 code sections to add to `server.py`
3. **Test with the examples** at the bottom of that file
4. **Let me know when done** so I can test the extension

### ⏱️ Time: ~20-30 minutes

### ✨ What This Adds:

- ✅ **Crisis Detection**: Automatically detects pandemic/earthquake/flood/hurricane/war/attack
- ✅ **Official Verification**: Cross-checks with WHO, USGS, UN, Red Cross
- ✅ **USGS Earthquake API**: Uses REAL earthquake data (this is the coolest part!)
- ✅ **Bias Detection**: Flags biased language in war news
- ✅ **Public Summaries**: Easy-to-understand crisis updates

### 🎯 Why This Matters:

The hackathon problem is about **crisis misinformation during disasters** (COVID, earthquakes, floods, wars), not general fact-checking.

We need to verify with **official sources** like:
- WHO for pandemics
- USGS for earthquakes (this actually works with live data!)
- UN/Red Cross for wars (unbiased sources)

### 📂 Files You Need:

- **SERVER_CRISIS_ADDON.md** ← Main file with all code (read this!)
- **CRISIS_SYSTEM_COMPLETE.md** ← Overview of what we're building

### 🧪 Quick Test After Update:

```bash
# Test earthquake detection (copy-paste in your terminal)
curl -X POST http://10.25.26.187:8002/api/v1/analyze -H "Content-Type: application/json" -d '{"content": "A magnitude 7.2 earthquake struck Turkey today according to USGS", "title": "Major Earthquake", "url": "https://news.com"}'
```

**You should see:**
- `"crisis_type": "earthquake"`
- `"official_source_verification"` with USGS data
- If there was a real earthquake recently, it will match actual USGS earthquake feed!

### ❓ Questions?

All the code is in `SERVER_CRISIS_ADDON.md` with comments explaining what each part does.

Just copy-paste each section where indicated and you're good!

Thanks! 🙏

---

## 📋 QUICK SUMMARY OF ADDITIONS

Your friend needs to add these 7 functions to `server.py`:

1. `CRISIS_KEYWORDS` dictionary (top of file)
2. `detect_crisis_type()` - Detects crisis from keywords
3. `verify_with_official_sources()` - Checks WHO/USGS/UN
4. `check_usgs_earthquake()` - Fetches REAL earthquake data
5. `detect_bias()` - Finds loaded language in war news
6. `generate_public_summary()` - Creates easy summaries
7. **Update** `/api/v1/analyze` endpoint - Return new fields

**Result:** Server returns 5 new fields:
- `crisis_type`
- `crisis_severity`
- `official_source_verification`
- `bias_detection`
- `public_summary`

Extension already displays these perfectly!

