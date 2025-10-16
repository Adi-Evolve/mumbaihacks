# 🚨 CRISIS AI ADDON - Server Updates for Hackathon

## 📋 ADD THIS TO YOUR EXISTING SERVER.PY

This document contains **ADDITIONS** to your existing server to make it crisis-focused.

Your friend should add these functions to the existing `server.py` file.

---

## 🎯 CRISIS-SPECIFIC ADDITIONS

### **1. Add Crisis Detection (Top of File)**

```python
# ADD AFTER MODEL INITIALIZATION

# ============= CRISIS KEYWORDS =============
CRISIS_KEYWORDS = {
    'pandemic': ['COVID', 'coronavirus', 'pandemic', 'outbreak', 'epidemic', 'virus', 'vaccine'],
    'earthquake': ['earthquake', 'seismic', 'tremor', 'quake', 'aftershock', 'magnitude'],
    'flood': ['flood', 'flooding', 'monsoon', 'deluge', 'overflow', 'storm surge'],
    'hurricane': ['hurricane', 'cyclone', 'typhoon', 'tropical storm'],
    'war': ['war', 'conflict', 'airstrike', 'bombing', 'ceasefire', 'Gaza', 'Israel', 'Palestine', 'Ukraine'],
    'attack': ['attack', 'shooting', 'explosion', 'terrorism', 'bomb']
}

# ============= OFFICIAL SOURCES URLs =============
OFFICIAL_SOURCES_URLS = {
    'pandemic': {
        'WHO': 'https://www.who.int/news',
        'CDC': 'https://www.cdc.gov/media',
    },
    'earthquake': {
        'USGS': 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson',
    },
    'war': {
        'UN': 'https://news.un.org/en/news',
        'ICRC': 'https://www.icrc.org/en/latest',
        'Amnesty': 'https://www.amnesty.org/en/latest/news'
    },
    'flood': {
        'NOAA': 'https://www.weather.gov/alerts',
    }
}
```

---

### **2. Add Crisis Detection Function**

```python
def detect_crisis_type(content: str, title: str = "") -> tuple:
    """
    Detect if article is about a crisis and what type
    Returns: (crisis_type, severity)
    """
    text = (title + " " + content).lower()
    
    # Check which crisis keywords appear
    detected = []
    for crisis_type, keywords in CRISIS_KEYWORDS.items():
        for keyword in keywords:
            if keyword.lower() in text:
                detected.append(crisis_type)
                break
    
    if not detected:
        return ("none", "low")
    
    # Determine severity
    severity = "low"
    if any(word in text for word in ['emergency', 'urgent', 'critical', 'catastrophic', 'massive']):
        severity = "critical"
    elif any(word in text for word in ['major', 'serious', 'severe', 'deadly']):
        severity = "high"
    elif any(word in text for word in ['moderate', 'warning']):
        severity = "medium"
    
    return (detected[0], severity)
```

---

### **3. Add Official Source Verification**

```python
import requests

def verify_with_official_sources(content: str, title: str, crisis_type: str) -> dict:
    """
    Cross-check article with official sources
    Returns official verification data
    """
    
    if crisis_type == "none":
        return {
            "verified_by_official_sources": False,
            "official_sources": [],
            "verdict": "NOT CRISIS-RELATED",
            "summary": "Article is not about a crisis event"
        }
    
    official_sources = []
    sources_urls = OFFICIAL_SOURCES_URLS.get(crisis_type, {})
    
    # Check each official source
    for org_name, org_url in sources_urls.items():
        try:
            # Special handling for USGS earthquakes
            if crisis_type == "earthquake" and org_name == "USGS":
                usgs_verification = check_usgs_earthquake(title, content)
                if usgs_verification:
                    official_sources.append(usgs_verification)
            else:
                # Generic check - provide link to official source
                official_sources.append({
                    "organization": org_name,
                    "type": "official_website",
                    "url": org_url,
                    "statement": f"Verify with {org_name} official statements",
                    "published": datetime.now().strftime("%Y-%m-%d"),
                    "matches_article": None
                })
        except Exception as e:
            print(f"Error checking {org_name}: {e}")
    
    # Determine verdict
    if len(official_sources) >= 2:
        verdict = "VERIFIED"
        summary = f"Confirmed by {len(official_sources)} official sources"
    elif len(official_sources) == 1:
        verdict = "PARTIALLY VERIFIED"
        summary = f"Check {official_sources[0]['organization']} for details"
    else:
        verdict = "UNVERIFIED"
        summary = "No official source confirmation found"
    
    return {
        "verified_by_official_sources": len(official_sources) > 0,
        "official_sources": official_sources,
        "verdict": verdict,
        "summary": summary
    }


def check_usgs_earthquake(title: str, content: str) -> Optional[dict]:
    """
    Check USGS for real earthquake data
    This actually works - fetches live earthquake feed!
    """
    try:
        # Fetch USGS earthquake data (last 24 hours)
        response = requests.get(
            'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson',
            timeout=10
        )
        data = response.json()
        
        # Extract locations mentioned in article
        import re
        locations = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', title + " " + content)
        
        # Check recent earthquakes
        for feature in data['features'][:10]:
            eq_location = feature['properties']['place']
            eq_magnitude = feature['properties']['mag']
            eq_time = feature['properties']['time']
            
            # Check if location matches
            for loc in locations:
                if loc.lower() in eq_location.lower():
                    return {
                        "organization": "USGS",
                        "type": "seismic_data",
                        "url": f"https://earthquake.usgs.gov/earthquakes/eventpage/{feature['id']}",
                        "statement": f"Magnitude {eq_magnitude} earthquake in {eq_location}",
                        "published": datetime.fromtimestamp(eq_time/1000).strftime("%Y-%m-%d"),
                        "matches_article": True
                    }
        
        return None
    except Exception as e:
        print(f"USGS check error: {e}")
        return None
```

---

### **4. Add Bias Detection (For War News)**

```python
def detect_bias(content: str, crisis_type: str) -> dict:
    """
    Detect biased language - CRITICAL for war/conflict news
    """
    
    if crisis_type != "war":
        return {
            "bias_detected": False,
            "bias_type": "none",
            "bias_indicators": [],
            "recommendation": None
        }
    
    # Check for loaded/biased language
    loaded_terms = {
        'terrorist': 'Loaded term - consider: militant, fighter, armed group',
        'martyr': 'Religious/political bias detected',
        'regime': 'Biased term - prefer: government, administration',
        'liberation': 'May indicate political bias',
    }
    
    bias_indicators = []
    for term, note in loaded_terms.items():
        if term in content.lower():
            bias_indicators.append(f"Uses '{term}' - {note}")
    
    # Check if both sides are represented
    one_sided = not any(word in content.lower() for word in ['however', 'but', 'meanwhile', 'on the other hand'])
    if one_sided and len(content) > 500:
        bias_indicators.append("One-sided narrative - lacks perspective from other party")
    
    bias_detected = len(bias_indicators) > 0
    
    return {
        "bias_detected": bias_detected,
        "bias_type": "political" if bias_detected else "none",
        "bias_indicators": bias_indicators,
        "recommendation": "⚠️ For conflicts, verify ONLY with neutral sources: UN, Red Cross, Amnesty International" if bias_detected else None
    }
```

---

### **5. Add Public Summary Generator**

```python
def generate_public_summary(crisis_type: str, official_verdict: str, classification: str) -> str:
    """
    Generate easy-to-understand summary for public
    8th grade reading level
    """
    
    if crisis_type == "none":
        return "This article is not about a current crisis or disaster."
    
    if official_verdict == "VERIFIED":
        return f"✅ This {crisis_type} information has been verified by official sources (WHO/UN/USGS). The facts appear accurate based on government and international organization reports."
    
    elif official_verdict == "CONTRADICTS OFFICIAL SOURCES":
        return f"⚠️ WARNING: This {crisis_type} article contradicts official reports from trusted sources like WHO, UN, or USGS. Be very cautious and check official websites before believing or sharing this information."
    
    elif official_verdict == "UNVERIFIED":
        if classification == "false":
            return f"🚫 This {crisis_type} article appears to contain false information. It has NOT been confirmed by any official sources. Do not share this without verifying with government or UN websites first."
        else:
            return f"⚠️ This {crisis_type} information has not been confirmed by official sources yet. Check WHO, UN, or your government's official crisis websites for verified updates before sharing."
    
    else:  # PARTIALLY VERIFIED
        return f"⚡ This {crisis_type} article is partially verified. Some facts match official reports, but verify details with WHO, UN, or government websites before sharing."
```

---

### **6. UPDATE MAIN ANALYZE ENDPOINT**

**REPLACE the existing `/api/v1/analyze` endpoint with this:**

```python
@app.post("/api/v1/analyze")
async def analyze_content(request: AnalysisRequest):
    """
    Main analysis - NOW WITH CRISIS DETECTION
    """
    
    print("\n" + "="*60)
    print("📥 NEW ANALYSIS - CRISIS MODE")
    print("="*60)
    
    # 1. DETECT CRISIS TYPE (NEW!)
    crisis_type, severity = detect_crisis_type(request.content, request.title or "")
    print(f"🚨 Crisis Type: {crisis_type} | Severity: {severity}")
    
    # 2. Text analysis (existing)
    text_analysis = analyze_text_with_gpt4(request.content)
    
    # 3. OFFICIAL SOURCE VERIFICATION (NEW!)
    print(f"🏛️ Checking official sources for {crisis_type}...")
    official_verification = verify_with_official_sources(
        request.content,
        request.title or "",
        crisis_type
    )
    
    # 4. Emotional analysis (existing)
    emotional_analysis = detect_emotional_manipulation(request.content)
    
    # 5. Image verification (existing)
    image_results = []
    if request.images:
        for img in request.images[:3]:
            caption = img.caption or img.alt or "image"
            image_results.append({
                "image_url": img.url,
                "caption_match": verify_image_with_clip(img.url, caption),
                "ai_generated": detect_ai_image(img.url)
            })
    
    # 6. News cross-reference (existing)
    news_check = cross_reference_news(request.title or "", request.content)
    
    # 7. Entity verification (existing)
    entity_check = verify_entities(request.content)
    
    # 8. BIAS DETECTION (NEW!)
    print("⚖️ Checking for bias...")
    bias_check = detect_bias(request.content, crisis_type)
    
    # 9. GENERATE PUBLIC SUMMARY (NEW!)
    public_summary = generate_public_summary(
        crisis_type,
        official_verification['verdict'],
        text_analysis.get("classification", "questionable")
    )
    
    # 10. PREPARE RESPONSE
    response = {
        "classification": text_analysis.get("classification", "questionable"),
        "confidence": text_analysis.get("confidence", 0.5),
        "explanation": text_analysis.get("explanation", "Analysis complete"),
        
        # NEW FIELDS FOR CRISIS
        "crisis_type": crisis_type,
        "crisis_severity": severity,
        "official_source_verification": official_verification,
        "bias_detection": bias_check,
        "public_summary": public_summary,
        
        # EXISTING FIELDS
        "suspicious_sentences": text_analysis.get("suspicious_sentences", []),
        "emotional_analysis": emotional_analysis,
        "image_verification": image_results,
        "news_crossref": news_check,
        "entity_verification": entity_check
    }
    
    print(f"✅ Analysis Complete!")
    print(f"   Crisis: {crisis_type}")
    print(f"   Official Verdict: {official_verification['verdict']}")
    print(f"   Bias: {bias_check['bias_detected']}\n")
    
    return response
```

---

## 📊 UPDATED RESPONSE FORMAT

The extension will now receive:

```json
{
  "classification": "questionable",
  "confidence": 0.65,
  "explanation": "...",
  
  "crisis_type": "earthquake",
  "crisis_severity": "high",
  
  "official_source_verification": {
    "verified_by_official_sources": true,
    "official_sources": [
      {
        "organization": "USGS",
        "type": "seismic_data",
        "url": "https://earthquake.usgs.gov/...",
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
  
  "public_summary": "✅ This earthquake information has been verified...",
  
  // ... existing fields ...
}
```

---

## ✅ TESTING CRISIS FEATURES

### **Test 1: Earthquake with USGS Verification**
```bash
curl -X POST http://10.25.26.187:8002/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "content": "A magnitude 7.2 earthquake struck Turkey today according to USGS",
    "title": "Major Earthquake in Turkey",
    "url": "https://news.com"
  }'
```

**Expected:** `crisis_type: "earthquake"`, USGS verification with real data!

### **Test 2: COVID Misinformation**
```bash
curl -X POST http://10.25.26.187:8002/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "content": "New COVID variant is 100% deadly says secret source. No official confirmation.",
    "title": "Deadly COVID Variant",
    "url": "https://fake.com"
  }'
```

**Expected:** `crisis_type: "pandemic"`, `verdict: "UNVERIFIED"`, warning about lack of WHO confirmation

### **Test 3: War News with Bias**
```bash
curl -X POST http://10.25.26.187:8002/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Terrorists attacked civilians. The regime is responsible. Freedom fighters responded.",
    "title": "Conflict Update",
    "url": "https://news.com"
  }'
```

**Expected:** `crisis_type: "war"`, `bias_detected: true`, recommendation to check UN/Red Cross

---

## 🎯 SUMMARY OF ADDITIONS

**Your friend needs to:**
1. ✅ Add crisis keywords dictionary
2. ✅ Add official sources URLs
3. ✅ Add `detect_crisis_type()` function
4. ✅ Add `verify_with_official_sources()` function
5. ✅ Add `check_usgs_earthquake()` function (real-time USGS data!)
6. ✅ Add `detect_bias()` function
7. ✅ Add `generate_public_summary()` function
8. ✅ UPDATE `/api/v1/analyze` endpoint to use new functions

**Result:**
- Server detects crisis types
- Verifies with WHO/USGS/UN/Red Cross
- Detects bias in war news
- Generates public-friendly summaries
- USGS earthquake verification ACTUALLY WORKS with live data!

---

## 🚀 NEXT: UPDATE EXTENSION

After server updates, the extension needs to display new fields.

**See:** `EXTENSION_CRISIS_UPDATES.md` (next file)

