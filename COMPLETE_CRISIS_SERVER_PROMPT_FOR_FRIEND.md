# 🤖 COMPLETE CRISIS AI SERVER - IMPLEMENTATION PROMPT

## 📨 FOR YOUR FRIEND TO GIVE TO CLAUDE/GPT-4

**INSTRUCTIONS FOR YOUR FRIEND:**
1. Copy this ENTIRE file
2. Paste into Claude or GPT-4
3. Say: "Implement this complete server with all features"
4. Claude will generate the full `server.py` file
5. Run it on your device at `10.25.26.187:8002`

---

# 🚨 AI ASSISTANT: BUILD CRISIS MISINFORMATION DETECTION SERVER

## 🎯 MISSION

Build a **FastAPI server** that detects misinformation during crisis events (COVID, earthquakes, floods, wars). The server must:

1. ✅ Analyze text for misinformation
2. ✅ Detect suspicious sentences
3. ✅ Verify images with CLIP
4. ✅ Detect emotional manipulation
5. ✅ Cross-reference with news sources
6. ✅ Verify entities with Wikipedia
7. 🚨 **DETECT CRISIS TYPE** (pandemic, earthquake, flood, hurricane, war, attack)
8. 🚨 **VERIFY WITH OFFICIAL SOURCES** (WHO, USGS, UN, Red Cross)
9. 🚨 **DETECT BIAS** in war/conflict news
10. 🚨 **GENERATE PUBLIC SUMMARIES** (easy-to-understand)

---

## ⚙️ SERVER REQUIREMENTS

```python
# Server Configuration
HOST = "10.25.26.187"
PORT = 8002
FRAMEWORK = "FastAPI"
CORS = "Allow all origins"

# Required Libraries
pip install fastapi uvicorn python-multipart pillow transformers torch newsapi-python requests wikipedia
```

---

## 📥 INPUT FORMAT

Extension sends to `POST /api/v1/analyze`:

```json
{
  "content": "Full article text...",
  "url": "https://example.com/article",
  "title": "Article headline",
  "images": [
    {
      "url": "https://example.com/img.jpg",
      "alt": "Image alt text",
      "caption": "Image caption"
    }
  ]
}
```

---

## 📤 OUTPUT FORMAT (MUST INCLUDE ALL FIELDS)

```json
{
  "classification": "verified" | "questionable" | "false",
  "confidence": 0.85,
  "explanation": "Brief analysis...",
  
  // CRISIS FIELDS (NEW!)
  "crisis_type": "earthquake" | "pandemic" | "flood" | "hurricane" | "war" | "attack" | "none",
  "crisis_severity": "low" | "medium" | "high" | "critical",
  
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
    "verdict": "VERIFIED" | "PARTIALLY VERIFIED" | "UNVERIFIED" | "CONTRADICTS OFFICIAL SOURCES",
    "summary": "Confirmed by X official sources"
  },
  
  "bias_detection": {
    "bias_detected": false,
    "bias_type": "none" | "political" | "religious",
    "bias_indicators": ["Uses 'terrorist' - Loaded term", ...],
    "recommendation": "⚠️ Verify with neutral sources: UN, Red Cross"
  },
  
  "public_summary": "✅ This earthquake information has been verified by USGS...",
  
  // EXISTING FIELDS
  "suspicious_sentences": [
    {
      "sentence": "EXACT text from article",
      "reason": "Why suspicious",
      "score": 0.92
    }
  ],
  
  "emotional_analysis": {
    "manipulation_detected": true,
    "manipulation_score": 0.78,
    "emotions": {"fear": 0.65, "anger": 0.52},
    "warning": "Article uses excessive fear-based language"
  },
  
  "image_verification": [
    {
      "image_url": "https://...",
      "caption_match": {
        "matches_caption": true,
        "confidence": 0.89,
        "warning": "Image context unclear"
      },
      "ai_generated": {
        "is_ai": false,
        "confidence": 0.23
      }
    }
  ],
  
  "news_crossref": {
    "total_articles_found": 15,
    "credible_sources": [
      {
        "name": "Reuters",
        "title": "Similar article title",
        "url": "https://reuters.com/...",
        "published": "2025-10-15"
      }
    ],
    "verdict": "VERIFIED BY CREDIBLE SOURCES"
  },
  
  "entity_verification": {
    "entities_found": 5,
    "verified_entities": [
      {
        "entity": "WHO",
        "type": "organization",
        "verified": true,
        "source": "Wikipedia"
      }
    ]
  }
}
```

---

## 🏗️ IMPLEMENTATION GUIDE

### **STEP 1: Setup & Models**

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import torch
from transformers import (
    CLIPProcessor, CLIPModel,
    AutoTokenizer, AutoModelForSequenceClassification,
    pipeline
)
from newsapi import NewsApiClient
import requests
from datetime import datetime
import wikipedia

app = FastAPI(title="Crisis Misinformation Detection API")

# CORS for Chrome Extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============= LOAD AI MODELS =============
print("🤖 Loading AI models...")

# CLIP for image-text matching
clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

# Emotion detection
emotion_classifier = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    top_k=None
)

# NER for entity extraction
ner_pipeline = pipeline(
    "ner",
    model="dslim/bert-base-NER",
    aggregation_strategy="simple"
)

# AI image detector (optional)
try:
    ai_detector = pipeline(
        "image-classification",
        model="umm-maybe/AI-image-detector"
    )
except:
    ai_detector = None
    print("⚠️ AI image detector not available")

print("✅ Models loaded!")

# ============= NEWSAPI SETUP =============
newsapi = NewsApiClient(api_key='f7737e24c97c46c9ac85618469bdb25b')

# Credible news sources
CREDIBLE_SOURCES = [
    'reuters', 'bbc-news', 'associated-press', 'the-guardian-uk',
    'cnn', 'abc-news', 'al-jazeera-english', 'the-washington-post',
    'the-times-of-india', 'the-hindu'
]

# Indian news domains (Lallantop, The Wire, TNT World)
CREDIBLE_DOMAINS = [
    'lallantop.com', 'thewire.in', 'tntworld.in',
    'scroll.in', 'thequint.com', 'reuters.com',
    'bbc.com', 'apnews.com', 'theguardian.com'
]

# ============= CRISIS KEYWORDS =============
CRISIS_KEYWORDS = {
    'pandemic': ['COVID', 'coronavirus', 'pandemic', 'outbreak', 'epidemic', 'virus', 'vaccine', 'vaccination'],
    'earthquake': ['earthquake', 'seismic', 'tremor', 'quake', 'aftershock', 'magnitude', 'richter'],
    'flood': ['flood', 'flooding', 'monsoon', 'deluge', 'overflow', 'storm surge', 'tsunami'],
    'hurricane': ['hurricane', 'cyclone', 'typhoon', 'tropical storm', 'tornado'],
    'war': ['war', 'conflict', 'airstrike', 'bombing', 'ceasefire', 'Gaza', 'Israel', 'Palestine', 'Ukraine', 'Russia', 'invasion'],
    'attack': ['attack', 'shooting', 'explosion', 'terrorism', 'bomb', 'assault', 'terror']
}

# ============= OFFICIAL SOURCES =============
OFFICIAL_SOURCES_URLS = {
    'pandemic': {
        'WHO': 'https://www.who.int/news',
        'CDC': 'https://www.cdc.gov/media',
        'NIH': 'https://www.nih.gov/news-events'
    },
    'earthquake': {
        'USGS': 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson',
        'EMSC': 'https://www.emsc-csem.org'
    },
    'flood': {
        'NOAA': 'https://www.weather.gov/alerts',
        'FEMA': 'https://www.fema.gov'
    },
    'hurricane': {
        'NOAA': 'https://www.nhc.noaa.gov',
        'NWS': 'https://www.weather.gov'
    },
    'war': {
        'UN': 'https://news.un.org/en/news',
        'ICRC': 'https://www.icrc.org/en/latest',
        'Amnesty': 'https://www.amnesty.org/en/latest/news',
        'HRW': 'https://www.hrw.org/news'
    },
    'attack': {
        'UN': 'https://news.un.org/en/news'
    }
}

# ============= REQUEST MODEL =============
class ImageData(BaseModel):
    url: str
    alt: Optional[str] = None
    caption: Optional[str] = None

class AnalysisRequest(BaseModel):
    content: str
    url: Optional[str] = None
    title: Optional[str] = None
    images: Optional[List[ImageData]] = None

print("✅ Server initialized!")
```

---

### **STEP 2: Crisis Detection Functions**

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
    
    # Determine severity based on keywords
    severity = "low"
    urgent_words = ['emergency', 'urgent', 'critical', 'catastrophic', 'massive', 'devastating']
    serious_words = ['major', 'serious', 'severe', 'deadly', 'significant']
    moderate_words = ['moderate', 'warning', 'alert']
    
    if any(word in text for word in urgent_words):
        severity = "critical"
    elif any(word in text for word in serious_words):
        severity = "high"
    elif any(word in text for word in moderate_words):
        severity = "medium"
    
    return (detected[0], severity)


def check_usgs_earthquake(title: str, content: str) -> Optional[dict]:
    """
    Check USGS for real earthquake data
    Uses LIVE USGS earthquake feed!
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
        text = title + " " + content
        # Extract capitalized words (potential location names)
        locations = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', text)
        
        # Check recent earthquakes
        for feature in data['features'][:20]:  # Check last 20 earthquakes
            eq_location = feature['properties']['place']
            eq_magnitude = feature['properties']['mag']
            eq_time = feature['properties']['time']
            eq_id = feature['id']
            
            # Check if any location matches
            for loc in locations:
                if loc.lower() in eq_location.lower():
                    return {
                        "organization": "USGS",
                        "type": "seismic_data",
                        "url": f"https://earthquake.usgs.gov/earthquakes/eventpage/{eq_id}",
                        "statement": f"Magnitude {eq_magnitude} earthquake in {eq_location}",
                        "published": datetime.fromtimestamp(eq_time/1000).strftime("%Y-%m-%d"),
                        "matches_article": True
                    }
        
        # No match found
        return None
        
    except Exception as e:
        print(f"❌ USGS check error: {e}")
        return None


def verify_with_official_sources(content: str, title: str, crisis_type: str) -> dict:
    """
    Cross-check article with official sources (WHO, USGS, UN, Red Cross)
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
            print(f"❌ Error checking {org_name}: {e}")
    
    # Determine verdict
    verified_count = sum(1 for s in official_sources if s.get('matches_article') == True)
    
    if verified_count >= 2:
        verdict = "VERIFIED"
        summary = f"Confirmed by {verified_count} official sources"
    elif verified_count == 1:
        verdict = "PARTIALLY VERIFIED"
        summary = f"Check {official_sources[0]['organization']} for details"
    elif len(official_sources) > 0:
        verdict = "UNVERIFIED"
        summary = f"No official confirmation found. Verify with {', '.join([s['organization'] for s in official_sources[:2]])}"
    else:
        verdict = "UNVERIFIED"
        summary = "No official sources available for verification"
    
    return {
        "verified_by_official_sources": verified_count > 0,
        "official_sources": official_sources,
        "verdict": verdict,
        "summary": summary
    }


def detect_bias(content: str, crisis_type: str) -> dict:
    """
    Detect biased language - CRITICAL for war/conflict news
    Flags loaded terms and one-sided narratives
    """
    
    if crisis_type != "war":
        return {
            "bias_detected": False,
            "bias_type": "none",
            "bias_indicators": [],
            "recommendation": None
        }
    
    content_lower = content.lower()
    
    # Check for loaded/biased language
    loaded_terms = {
        'terrorist': 'Loaded term - consider: militant, fighter, armed group',
        'terrorists': 'Loaded term - consider: militants, fighters, armed groups',
        'martyr': 'Religious/political bias detected',
        'martyrs': 'Religious/political bias detected',
        'regime': 'Biased term - prefer: government, administration',
        'liberation': 'May indicate political bias',
        'freedom fighters': 'May indicate political bias',
        'occupation': 'Politically loaded term',
        'heroes': 'May indicate bias towards one side'
    }
    
    bias_indicators = []
    for term, note in loaded_terms.items():
        if term in content_lower:
            bias_indicators.append(f"Uses '{term}' - {note}")
    
    # Check if both sides are represented
    balance_words = ['however', 'but', 'meanwhile', 'on the other hand', 'according to', 'claims', 'alleges']
    has_balance = any(word in content_lower for word in balance_words)
    
    if not has_balance and len(content) > 500:
        bias_indicators.append("One-sided narrative - lacks perspective from other party")
    
    bias_detected = len(bias_indicators) > 0
    
    return {
        "bias_detected": bias_detected,
        "bias_type": "political" if bias_detected else "none",
        "bias_indicators": bias_indicators,
        "recommendation": "⚠️ For conflicts, verify ONLY with neutral sources: UN, Red Cross, Amnesty International" if bias_detected else None
    }


def generate_public_summary(crisis_type: str, official_verdict: str, classification: str, bias_detected: bool = False) -> str:
    """
    Generate easy-to-understand summary for public
    8th grade reading level
    """
    
    if crisis_type == "none":
        if classification == "false":
            return "🚫 This article contains false information. Do not share without verifying from official sources."
        return "This article is not about a current crisis or disaster."
    
    # Handle bias warning
    if bias_detected and crisis_type == "war":
        return f"⚠️ This {crisis_type} article shows signs of bias. For accurate information about conflicts, check neutral sources like the UN, Red Cross, or Amnesty International. Avoid sharing until verified."
    
    # Handle official verification
    if official_verdict == "VERIFIED":
        return f"✅ This {crisis_type} information has been verified by official sources (WHO/UN/USGS). The facts appear accurate based on government and international organization reports."
    
    elif "CONTRADICT" in official_verdict:
        return f"🚫 WARNING: This {crisis_type} article contradicts official reports from trusted sources like WHO, UN, or USGS. Be very cautious and check official websites before believing or sharing this information."
    
    elif official_verdict == "UNVERIFIED":
        if classification == "false":
            return f"🚫 This {crisis_type} article appears to contain false information. It has NOT been confirmed by any official sources. Do not share this without verifying with government or UN websites first."
        else:
            return f"⚠️ This {crisis_type} information has not been confirmed by official sources yet. Check WHO, UN, or your government's official crisis websites for verified updates before sharing."
    
    else:  # PARTIALLY VERIFIED
        return f"⚡ This {crisis_type} article is partially verified. Some facts match official reports, but verify details with WHO, UN, or government websites before sharing."
```

---

### **STEP 3: Text Analysis (GPT-4/Local)**

```python
def analyze_text_with_gpt4(content: str) -> dict:
    """
    Analyze text for misinformation using GPT-4 or local model
    
    OPTION 1: Use GPT-4 API (if you have OpenAI API key)
    OPTION 2: Use local model (faster, no API costs)
    """
    
    # OPTION 1: GPT-4 (Uncomment if you have API key)
    # import openai
    # openai.api_key = "your-api-key"
    # response = openai.ChatCompletion.create(
    #     model="gpt-4",
    #     messages=[{
    #         "role": "system",
    #         "content": "You are a fact-checker. Analyze if the article contains misinformation."
    #     }, {
    #         "role": "user",
    #         "content": f"Analyze this article for misinformation:\n\n{content[:2000]}"
    #     }]
    # )
    # ...
    
    # OPTION 2: Simple heuristic analysis (works without API)
    suspicious_phrases = [
        'you won\'t believe', 'doctors hate', 'one weird trick',
        'scientists baffled', 'they don\'t want you to know',
        'miracle cure', 'secret revealed', 'shocking truth',
        'fake news media', 'mainstream media won\'t tell you'
    ]
    
    content_lower = content.lower()
    suspicious_count = sum(1 for phrase in suspicious_phrases if phrase in content_lower)
    
    # Check for excessive caps
    caps_ratio = sum(1 for c in content if c.isupper()) / max(len(content), 1)
    
    # Calculate confidence
    confidence = 0.7  # Base confidence
    
    if suspicious_count >= 3:
        classification = "false"
        confidence = 0.85
        explanation = f"Article contains {suspicious_count} suspicious phrases commonly used in misinformation."
    elif suspicious_count >= 1 or caps_ratio > 0.15:
        classification = "questionable"
        confidence = 0.6
        explanation = "Article shows some signs of sensationalism or unreliable sourcing."
    else:
        classification = "verified"
        confidence = 0.75
        explanation = "Article appears credible based on language analysis."
    
    # Extract suspicious sentences
    suspicious_sentences = []
    sentences = content.split('.')
    for sentence in sentences:
        for phrase in suspicious_phrases:
            if phrase in sentence.lower():
                suspicious_sentences.append({
                    "sentence": sentence.strip(),
                    "reason": f"Contains suspicious phrase: '{phrase}'",
                    "score": 0.85
                })
                break
    
    return {
        "classification": classification,
        "confidence": confidence,
        "explanation": explanation,
        "suspicious_sentences": suspicious_sentences[:5]
    }


def detect_emotional_manipulation(content: str) -> dict:
    """
    Detect if article uses excessive emotional language
    """
    try:
        # Analyze emotions in text (first 500 words)
        text_sample = ' '.join(content.split()[:500])
        emotions = emotion_classifier(text_sample)[0]
        
        # Convert to dict
        emotion_scores = {e['label']: e['score'] for e in emotions}
        
        # Check for manipulation (high fear, anger, disgust)
        manipulation_score = (
            emotion_scores.get('fear', 0) * 1.5 +
            emotion_scores.get('anger', 0) * 1.3 +
            emotion_scores.get('disgust', 0) * 1.2
        ) / 3
        
        manipulation_detected = manipulation_score > 0.5
        
        warning = None
        if manipulation_detected:
            dominant = max(emotion_scores.items(), key=lambda x: x[1])
            warning = f"Article uses excessive {dominant[0]}-based language ({int(dominant[1]*100)}% confidence)"
        
        return {
            "manipulation_detected": manipulation_detected,
            "manipulation_score": round(manipulation_score, 2),
            "emotions": {k: round(v, 2) for k, v in emotion_scores.items()},
            "warning": warning
        }
        
    except Exception as e:
        print(f"❌ Emotion analysis error: {e}")
        return {
            "manipulation_detected": False,
            "manipulation_score": 0.0,
            "emotions": {},
            "warning": None
        }
```

---

### **STEP 4: Image Verification**

```python
from PIL import Image
from io import BytesIO

def verify_image_with_clip(image_url: str, caption: str) -> dict:
    """
    Use CLIP to verify if image matches caption
    """
    try:
        # Download image
        response = requests.get(image_url, timeout=10)
        image = Image.open(BytesIO(response.content)).convert('RGB')
        
        # Prepare texts
        texts = [
            caption,
            "unrelated image",
            "stock photo",
            "advertisement"
        ]
        
        # Process with CLIP
        inputs = clip_processor(
            text=texts,
            images=image,
            return_tensors="pt",
            padding=True
        )
        
        outputs = clip_model(**inputs)
        logits_per_image = outputs.logits_per_image
        probs = logits_per_image.softmax(dim=1)
        
        caption_score = probs[0][0].item()
        
        matches_caption = caption_score > 0.4
        
        warning = None
        if not matches_caption:
            warning = "Image may not match the caption or context"
        
        return {
            "matches_caption": matches_caption,
            "confidence": round(caption_score, 2),
            "warning": warning
        }
        
    except Exception as e:
        print(f"❌ CLIP verification error: {e}")
        return {
            "matches_caption": None,
            "confidence": 0.0,
            "warning": f"Could not verify image: {str(e)}"
        }


def detect_ai_image(image_url: str) -> dict:
    """
    Detect if image is AI-generated
    """
    if not ai_detector:
        return {"is_ai": None, "confidence": 0.0}
    
    try:
        response = requests.get(image_url, timeout=10)
        image = Image.open(BytesIO(response.content)).convert('RGB')
        
        results = ai_detector(image)
        
        # Check if likely AI
        for result in results:
            if 'artificial' in result['label'].lower() or 'ai' in result['label'].lower():
                return {
                    "is_ai": result['score'] > 0.5,
                    "confidence": round(result['score'], 2)
                }
        
        return {"is_ai": False, "confidence": 0.0}
        
    except Exception as e:
        print(f"❌ AI detection error: {e}")
        return {"is_ai": None, "confidence": 0.0}
```

---

### **STEP 5: News Cross-Reference**

```python
def cross_reference_news(title: str, content: str) -> dict:
    """
    Check if story is reported by credible sources using NewsAPI
    """
    try:
        # Search for similar articles
        keywords = ' '.join(title.split()[:5])  # First 5 words of title
        
        articles = newsapi.get_everything(
            q=keywords,
            language='en',
            sort_by='relevancy',
            page_size=20
        )
        
        credible_sources = []
        
        for article in articles.get('articles', []):
            source_id = article.get('source', {}).get('id', '').lower()
            source_name = article.get('source', {}).get('name', '')
            article_url = article.get('url', '')
            
            # Check if source is credible (by ID or domain)
            is_credible = False
            
            if source_id in CREDIBLE_SOURCES:
                is_credible = True
            else:
                # Check domain
                for domain in CREDIBLE_DOMAINS:
                    if domain in article_url.lower():
                        is_credible = True
                        break
            
            if is_credible:
                credible_sources.append({
                    "name": source_name,
                    "title": article.get('title', ''),
                    "url": article_url,
                    "published": article.get('publishedAt', '')[:10]
                })
        
        # Determine verdict
        if len(credible_sources) >= 3:
            verdict = "VERIFIED BY MULTIPLE CREDIBLE SOURCES"
        elif len(credible_sources) >= 1:
            verdict = "FOUND IN CREDIBLE SOURCES"
        else:
            verdict = "NOT FOUND IN CREDIBLE SOURCES - LIKELY FAKE"
        
        return {
            "total_articles_found": len(articles.get('articles', [])),
            "credible_sources": credible_sources[:5],
            "verdict": verdict
        }
        
    except Exception as e:
        print(f"❌ News cross-reference error: {e}")
        return {
            "total_articles_found": 0,
            "credible_sources": [],
            "verdict": "ERROR - Could not verify"
        }
```

---

### **STEP 6: Entity Verification**

```python
def verify_entities(content: str) -> dict:
    """
    Extract entities and verify with Wikipedia
    """
    try:
        # Extract entities
        entities = ner_pipeline(content[:1000])
        
        verified_entities = []
        
        for entity in entities[:10]:
            entity_text = entity['entity_group']
            entity_word = entity['word']
            
            # Try to verify with Wikipedia
            try:
                wiki_summary = wikipedia.summary(entity_word, sentences=1, auto_suggest=False)
                verified_entities.append({
                    "entity": entity_word,
                    "type": entity_text,
                    "verified": True,
                    "source": "Wikipedia"
                })
            except:
                verified_entities.append({
                    "entity": entity_word,
                    "type": entity_text,
                    "verified": False,
                    "source": None
                })
        
        return {
            "entities_found": len(entities),
            "verified_entities": verified_entities
        }
        
    except Exception as e:
        print(f"❌ Entity verification error: {e}")
        return {
            "entities_found": 0,
            "verified_entities": []
        }
```

---

### **STEP 7: Main Analysis Endpoint**

```python
@app.post("/api/v1/analyze")
async def analyze_content(request: AnalysisRequest):
    """
    Main analysis endpoint with CRISIS DETECTION
    """
    
    print("\n" + "="*60)
    print("📥 NEW ANALYSIS REQUEST - CRISIS MODE")
    print("="*60)
    print(f"Title: {request.title}")
    print(f"Content length: {len(request.content)} chars")
    print(f"Images: {len(request.images) if request.images else 0}")
    
    # 1. DETECT CRISIS TYPE (NEW!)
    crisis_type, severity = detect_crisis_type(request.content, request.title or "")
    print(f"🚨 Crisis Type: {crisis_type} | Severity: {severity}")
    
    # 2. Text analysis
    print("📝 Analyzing text...")
    text_analysis = analyze_text_with_gpt4(request.content)
    
    # 3. OFFICIAL SOURCE VERIFICATION (NEW!)
    print(f"🏛️ Checking official sources for {crisis_type}...")
    official_verification = verify_with_official_sources(
        request.content,
        request.title or "",
        crisis_type
    )
    
    # 4. Emotional analysis
    print("😡 Detecting emotional manipulation...")
    emotional_analysis = detect_emotional_manipulation(request.content)
    
    # 5. Image verification
    image_results = []
    if request.images:
        print(f"🖼️ Verifying {len(request.images)} images...")
        for img in request.images[:3]:
            caption = img.caption or img.alt or "image"
            image_results.append({
                "image_url": img.url,
                "caption_match": verify_image_with_clip(img.url, caption),
                "ai_generated": detect_ai_image(img.url)
            })
    
    # 6. News cross-reference
    print("📰 Cross-referencing with news sources...")
    news_check = cross_reference_news(request.title or "", request.content)
    
    # 7. Entity verification
    print("🔍 Verifying entities...")
    entity_check = verify_entities(request.content)
    
    # 8. BIAS DETECTION (NEW!)
    print("⚖️ Checking for bias...")
    bias_check = detect_bias(request.content, crisis_type)
    
    # 9. GENERATE PUBLIC SUMMARY (NEW!)
    public_summary = generate_public_summary(
        crisis_type,
        official_verification['verdict'],
        text_analysis.get("classification", "questionable"),
        bias_check.get("bias_detected", False)
    )
    
    # 10. PREPARE RESPONSE
    response = {
        "classification": text_analysis.get("classification", "questionable"),
        "confidence": text_analysis.get("confidence", 0.5),
        "explanation": text_analysis.get("explanation", "Analysis complete"),
        
        # NEW CRISIS FIELDS
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
    print(f"   Bias: {bias_check['bias_detected']}")
    print(f"   Classification: {response['classification']}\n")
    
    return response


@app.get("/")
async def root():
    return {
        "service": "Crisis Misinformation Detection API",
        "status": "online",
        "version": "2.0-crisis",
        "features": [
            "text_analysis",
            "suspicious_sentences",
            "clip_image_verification",
            "emotional_manipulation",
            "news_crossref",
            "entity_verification",
            "crisis_detection",
            "official_source_verification",
            "bias_detection",
            "usgs_earthquake_api"
        ]
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "models_loaded": True}
```

---

### **STEP 8: Run Server**

```python
if __name__ == "__main__":
    import uvicorn
    print("\n🚀 Starting Crisis Misinformation Detection Server...")
    print(f"📍 Host: 10.25.26.187")
    print(f"🔌 Port: 8002")
    print(f"🌐 Access: http://10.25.26.187:8002\n")
    
    uvicorn.run(
        app,
        host="10.25.26.187",
        port=8002,
        log_level="info"
    )
```

---

## 🧪 TESTING COMMANDS

### Test 1: Earthquake with USGS Verification
```bash
curl -X POST http://10.25.26.187:8002/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d "{\"content\": \"A magnitude 7.2 earthquake struck Turkey today, USGS reports extensive damage\", \"title\": \"Major Earthquake in Turkey\", \"url\": \"https://news.com\"}"
```

**Expected:** `crisis_type: "earthquake"`, USGS verification with REAL data!

### Test 2: COVID Misinformation
```bash
curl -X POST http://10.25.26.187:8002/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d "{\"content\": \"New COVID variant is 100% deadly says secret source\", \"title\": \"Deadly COVID Variant\", \"url\": \"https://fake.com\"}"
```

**Expected:** `crisis_type: "pandemic"`, `verdict: "UNVERIFIED"`

### Test 3: War News with Bias
```bash
curl -X POST http://10.25.26.187:8002/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d "{\"content\": \"Terrorists attacked civilians. The regime is responsible.\", \"title\": \"Conflict Update\", \"url\": \"https://news.com\"}"
```

**Expected:** `crisis_type: "war"`, `bias_detected: true`

---

## ✅ COMPLETION CHECKLIST

- [ ] All imports working
- [ ] Models loaded successfully
- [ ] Crisis detection works
- [ ] USGS earthquake API working (check with real earthquake)
- [ ] Official source verification returns data
- [ ] Bias detection flags loaded terms
- [ ] Public summaries generated
- [ ] Server runs on 10.25.26.187:8002
- [ ] CORS enabled
- [ ] All endpoints return correct JSON format

---

## 🎯 CRITICAL REQUIREMENTS

1. **MUST return ALL fields** in the output JSON format above
2. **MUST detect crisis types** correctly
3. **MUST use USGS API** for earthquakes (it's real live data!)
4. **MUST detect bias** in war news
5. **MUST generate public summaries** that are easy to understand
6. **MUST run on 10.25.26.187:8002**
7. **MUST enable CORS** for Chrome extension

---

## 🚀 START IMPLEMENTATION NOW!

Copy all code sections above into a single `server.py` file and run:

```bash
python server.py
```

The extension is ready and waiting for your server!

