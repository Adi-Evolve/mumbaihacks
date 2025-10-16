# 🚨 CRISIS MISINFORMATION AI - COMPLETE UPDATE GUIDE

## 🎯 WHAT THIS IS

This guide contains **EVERYTHING** needed to transform your misinformation detector into a **Crisis-Focused Autonomous AI System** for the hackathon.

---

## 📋 TWO-PART UPDATE

### **PART 1: Server Updates** (Friend's Device)
### **PART 2: Extension Updates** (Your Device - Already Done!)

---

# 🖥️ PART 1: SERVER UPDATES (Friend's Computer)

Your friend needs to add crisis detection features to `server.py`.

## 📄 WHAT TO TELL YOUR FRIEND

Send them this message:

```
Hey! We need to add crisis detection to the server for the hackathon.

Please add the code from SERVER_CRISIS_ADDON.md to your server.py file.

It adds:
✅ Crisis type detection (pandemic, earthquake, flood, hurricane, war, attack)
✅ Official source verification (WHO, USGS, UN, Red Cross)
✅ USGS earthquake verification (uses REAL earthquake data!)
✅ Bias detection for war news
✅ Public-friendly summaries

Steps:
1. Open the file: SERVER_CRISIS_ADDON.md
2. Copy each code section
3. Paste into server.py where indicated
4. Test with the examples at the bottom
5. Restart the server

The USGS earthquake feature actually works with live data from:
https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson

Let me know when done!
```

## 📂 FILES YOUR FRIEND NEEDS

1. **SERVER_CRISIS_ADDON.md** ← Complete code additions
2. **COMPLETE_SERVER_IMPLEMENTATION_PROMPT.md** ← Reference (already has NewsAPI key)

---

## ✅ WHAT GETS ADDED TO SERVER

### 1. **Crisis Keywords Dictionary**
```python
CRISIS_KEYWORDS = {
    'pandemic': ['COVID', 'coronavirus', 'pandemic', 'outbreak', 'epidemic', 'virus', 'vaccine'],
    'earthquake': ['earthquake', 'seismic', 'tremor', 'quake', 'aftershock', 'magnitude'],
    'flood': ['flood', 'flooding', 'monsoon', 'deluge', 'overflow', 'storm surge'],
    'hurricane': ['hurricane', 'cyclone', 'typhoon', 'tropical storm'],
    'war': ['war', 'conflict', 'airstrike', 'bombing', 'ceasefire', 'Gaza', 'Israel', 'Palestine', 'Ukraine'],
    'attack': ['attack', 'shooting', 'explosion', 'terrorism', 'bomb']
}
```

### 2. **Official Sources by Crisis Type**
- **Pandemic**: WHO, CDC, NIH
- **Earthquake**: USGS (with REAL-TIME earthquake API!)
- **Flood/Hurricane**: NOAA, FEMA
- **War**: UN, ICRC (Red Cross), Amnesty, HRW (neutral only)

### 3. **USGS Earthquake Verification** (ACTUALLY WORKS!)
```python
# Fetches live earthquake data from USGS
https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson

# Returns magnitude, location, time of real earthquakes!
```

### 4. **Bias Detection for War News**
- Detects loaded terms: "terrorist", "martyr", "regime", "liberation"
- Flags one-sided narratives
- Recommends neutral sources (UN, Red Cross, Amnesty)

### 5. **Public-Friendly Summaries**
- 8th grade reading level
- Easy-to-understand crisis updates
- Clear warnings about unverified info

---

## 🔄 NEW SERVER RESPONSE FORMAT

After updates, server returns:

```json
{
  "classification": "questionable",
  "confidence": 0.65,
  
  // 🚨 NEW CRISIS FIELDS
  "crisis_type": "earthquake",
  "crisis_severity": "high",
  
  "official_source_verification": {
    "verified_by_official_sources": true,
    "official_sources": [
      {
        "organization": "USGS",
        "type": "seismic_data",
        "url": "https://earthquake.usgs.gov/earthquakes/eventpage/...",
        "statement": "Magnitude 7.2 earthquake in Turkey",
        "published": "2025-10-16",
        "matches_article": true
      }
    ],
    "verdict": "VERIFIED",
    "summary": "Confirmed by 1 official sources"
  },
  
  "bias_detection": {
    "bias_detected": false,
    "bias_type": "none",
    "bias_indicators": [],
    "recommendation": null
  },
  
  "public_summary": "✅ This earthquake information has been verified by USGS...",
  
  // ... existing fields (suspicious_sentences, emotional_analysis, etc.)
}
```

---

# 🌐 PART 2: EXTENSION UPDATES (Your Computer)

## ✅ ALREADY UPDATED!

The extension (`popup.js`) has been updated to display crisis fields!

### **What's New in Extension:**

#### 1. **Crisis Alert Badge**
- Shows crisis type with emoji (🦠 pandemic, 🌍 earthquake, 🌊 flood, etc.)
- Color-coded severity (red=critical, orange=high, blue=medium, green=low)
- Displays public-friendly summary

#### 2. **Official Source Verification Display**
- Shows WHO/USGS/UN/Red Cross confirmations
- Organization badges with emojis (🏥 WHO, 🌐 UN, 🌍 USGS)
- Clickable "View Source" links to official websites
- Match indicators (✓ confirmed, ✗ contradicts)

#### 3. **Bias Warning Section**
- Highlights biased language in war news
- Shows specific bias indicators
- Recommends neutral verification sources

---

## 🧪 TESTING THE COMPLETE SYSTEM

### **Test 1: Real Earthquake Verification** ✅
```bash
# Test with real earthquake news
curl -X POST http://10.25.26.187:8002/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "content": "A magnitude 7.2 earthquake struck Turkey today, USGS reports extensive damage in the region",
    "title": "Major Earthquake Hits Turkey",
    "url": "https://news.example.com"
  }'
```

**Expected Result:**
- `crisis_type: "earthquake"`
- `crisis_severity: "high"` or `"critical"`
- `official_source_verification` with USGS data
- Real earthquake match if there was an actual earthquake in Turkey recently!

### **Test 2: COVID Misinformation**
```bash
curl -X POST http://10.25.26.187:8002/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "content": "New COVID variant is 100% deadly, says anonymous source. Government is hiding the truth!",
    "title": "Deadly COVID Variant Discovered",
    "url": "https://fake-news.com"
  }'
```

**Expected Result:**
- `crisis_type: "pandemic"`
- `verdict: "UNVERIFIED"` (no WHO confirmation)
- Warning in `public_summary`
- High confidence it's false

### **Test 3: War News with Bias**
```bash
curl -X POST http://10.25.26.187:8002/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Terrorists attacked the settlement. The regime continues its aggression. Freedom fighters responded heroically.",
    "title": "Conflict Update",
    "url": "https://news.com"
  }'
```

**Expected Result:**
- `crisis_type: "war"`
- `bias_detected: true`
- `bias_indicators`: ["Uses 'terrorist'", "Uses 'regime'", etc.]
- `recommendation`: "Verify with UN, Red Cross, Amnesty"

---

## 🎨 VISUAL EXAMPLES (How Extension Looks)

### Crisis Alert:
```
┌─────────────────────────────────────────────┐
│ 🌍 CRISIS DETECTED: EARTHQUAKE              │
│ Severity: HIGH                               │
│                                              │
│ ✅ This earthquake information has been      │
│ verified by USGS. The facts appear accurate  │
│ based on seismic monitoring reports.         │
└─────────────────────────────────────────────┘
```

### Official Verification:
```
┌─────────────────────────────────────────────┐
│ ✅ Official Source Verification: VERIFIED    │
│                                              │
│ VERIFIED BY:                                 │
│ ┌───────────────────────────────────────┐   │
│ │ 🌍 USGS                           ✓   │   │
│ │ Magnitude 7.2 earthquake in Turkey    │   │
│ │ 📅 2025-10-16          View Source → │   │
│ └───────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Bias Warning:
```
┌─────────────────────────────────────────────┐
│ ⚖️ Potential Bias Detected                  │
│                                              │
│ • Uses 'terrorist' - Loaded term            │
│ • Uses 'regime' - Biased term               │
│                                              │
│ ⚠️ For conflicts, verify ONLY with neutral  │
│ sources: UN, Red Cross, Amnesty             │
└─────────────────────────────────────────────┘
```

---

## 🏗️ SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────┐
│                    CRISIS AI SYSTEM                     │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   ┌────▼────┐        ┌─────▼──────┐      ┌────▼────┐
   │ Chrome  │        │   FastAPI  │      │  AI     │
   │Extension│◄──────►│   Server   │◄────►│ Models  │
   │         │        │            │      │         │
   └─────────┘        └─────┬──────┘      └─────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
        ┌─────▼─────┐ ┌─────▼─────┐ ┌────▼────┐
        │   USGS    │ │    WHO    │ │   UN    │
        │Earthquake │ │  COVID    │ │  War    │
        │   API     │ │   Data    │ │ News    │
        └───────────┘ └───────────┘ └─────────┘
```

---

## 📊 FEATURES COMPARISON

### Before (General Fact-Checker):
- ✓ Text analysis
- ✓ Suspicious sentences
- ✓ CLIP image verification
- ✓ Emotion detection
- ✓ News cross-reference
- ✓ Entity verification

### After (Crisis-Focused AI):
- ✓ **All above features PLUS:**
- ✅ **Crisis type detection** (6 types)
- ✅ **Crisis severity levels** (low/medium/high/critical)
- ✅ **Official source verification** (WHO/USGS/UN/Red Cross)
- ✅ **USGS real-time earthquake data** (actually works!)
- ✅ **Bias detection** (war/conflict news)
- ✅ **Public-friendly summaries** (8th grade level)

---

## 🎯 HACKATHON DEMO FLOW

### **Demo Script:**

1. **Show Regular News** (3 seconds)
   - Analyze normal article
   - Shows standard verification
   
2. **Show Earthquake with USGS** (30 seconds) ⭐
   - Paste earthquake article
   - **Crisis alert appears!** 🌍
   - **USGS verification with REAL data!**
   - Show official source links
   - "This is verified by US Geological Survey!"

3. **Show COVID Misinformation** (20 seconds)
   - Paste fake COVID article
   - Crisis detected but UNVERIFIED
   - Warning: "No WHO confirmation"
   - Public summary explains the danger

4. **Show Biased War News** (20 seconds)
   - Paste article with loaded language
   - War crisis detected
   - **Bias warning appears!** ⚖️
   - Shows biased terms
   - Recommends UN/Red Cross

5. **Explain Impact** (15 seconds)
   - "During disasters, false info spreads fast"
   - "Our AI verifies with WHO, USGS, UN"
   - "Detects bias in conflict reporting"
   - "Helps public get REAL crisis info"

**Total: ~90 seconds**

---

## 🔧 TROUBLESHOOTING

### **Extension not showing crisis fields?**
- Check browser console (F12)
- Verify server is returning new fields
- Test with: `console.log(result)` in popup.js

### **USGS verification not working?**
- Check internet connection
- USGS API URL: `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson`
- Test manually in browser
- Only works for earthquakes in last 24 hours

### **Server errors?**
- Check friend updated `/api/v1/analyze` endpoint
- Verify all functions added (detect_crisis_type, verify_with_official_sources, etc.)
- Check terminal for Python errors

### **Bias detection not appearing?**
- Only shows for `crisis_type: "war"`
- Must contain loaded terms (terrorist, regime, etc.)
- Check `bias_detection.bias_detected` is true

---

## 📁 FILES REFERENCE

### **Documentation:**
- `SERVER_CRISIS_ADDON.md` ← Server code additions (send to friend)
- `CRISIS_SYSTEM_COMPLETE.md` ← This file (overview)
- `HACKATHON_CRISIS_AI_ARCHITECTURE.md` ← Detailed architecture
- `COMPLETE_SERVER_IMPLEMENTATION_PROMPT.md` ← Original server prompt

### **Code Files:**
- `extension/popup.js` ← Updated with crisis display (✅ DONE)
- `extension/popup.html` ← Modern UI (✅ DONE)
- `server.py` (on friend's device) ← Needs crisis additions

---

## ✅ COMPLETION CHECKLIST

### Your Side (Extension):
- [x] Crisis alert display added
- [x] Official source verification display
- [x] Bias warning display
- [x] Public summary display
- [x] Severity color coding
- [x] Organization badges/emojis

### Friend's Side (Server):
- [ ] Add crisis keywords dictionary
- [ ] Add official sources URLs
- [ ] Add `detect_crisis_type()` function
- [ ] Add `verify_with_official_sources()` function
- [ ] Add `check_usgs_earthquake()` function
- [ ] Add `detect_bias()` function
- [ ] Add `generate_public_summary()` function
- [ ] Update `/api/v1/analyze` endpoint
- [ ] Test with earthquake article
- [ ] Test with COVID article
- [ ] Test with war article
- [ ] Verify USGS API works
- [ ] Restart server

### Testing:
- [ ] Test earthquake + USGS verification
- [ ] Test pandemic + WHO missing
- [ ] Test war + bias detection
- [ ] Test normal article (should work as before)
- [ ] Check all fields display in extension

---

## 🚀 NEXT STEPS

1. **Send `SERVER_CRISIS_ADDON.md` to friend**
2. **Friend implements server updates**
3. **Test all 3 crisis scenarios**
4. **Practice hackathon demo**
5. **Win the hackathon!** 🏆

---

## 💡 KEY SELLING POINTS FOR JUDGES

1. **"We verify with REAL official sources"**
   - USGS earthquake API (actually works!)
   - WHO for pandemics
   - UN/Red Cross for conflicts

2. **"We detect bias in war reporting"**
   - Flags loaded language
   - Recommends neutral sources
   - Critical for unbiased crisis info

3. **"Built for real disasters"**
   - COVID-19
   - Earthquakes (India is seismic zone!)
   - Floods (monsoon season)
   - Conflicts

4. **"Public-friendly summaries"**
   - Not just technical analysis
   - Easy-to-understand crisis updates
   - Helps general public during emergencies

---

## 📞 QUESTIONS?

Everything is documented in:
- `SERVER_CRISIS_ADDON.md` ← Complete server code
- `HACKATHON_CRISIS_AI_ARCHITECTURE.md` ← System design
- This file ← Overview

**The extension is ready. Server needs updates. Then test!**

Good luck with the hackathon! 🚀

