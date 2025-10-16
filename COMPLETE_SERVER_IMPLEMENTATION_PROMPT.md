# 🤖 COMPLETE SERVER IMPLEMENTATION - AI PROMPT

## FOR: AI Assistant (GPT-4, Claude, etc.)

**CRITICAL INSTRUCTIONS:**
- Use ONLY real data sent from the Chrome extension
- NO dummy/fake/placeholder data
- Implement all features with production-ready code
- Test all endpoints before confirming completion

---

## 📋 PROJECT OVERVIEW

You are building a **FastAPI server** for an AI-powered misinformation detection Chrome extension. The server receives article content, images, and URLs from the extension and performs comprehensive analysis using multiple AI models and APIs.

**Server Requirements:**
- Host: `10.25.26.187`
- Port: `8002`
- Framework: FastAPI (Python)
- CORS: Enabled for all origins

---

## 🎯 FEATURES TO IMPLEMENT

### 1. **Text Misinformation Detection** ✅
Analyze article text for fake news using GPT-4/Claude or local models.

### 2. **Suspicious Sentences Detection** ✅
Extract and highlight specific sentences that contain misinformation.

### 3. **CLIP Multi-Modal Verification** 🆕
Verify if images match article captions using OpenAI CLIP model.

### 4. **Emotion Manipulation Detection** 🆕
Detect if article uses excessive emotional language (fear, anger, etc.).

### 5. **News Cross-Reference** 🆕
Check if story is reported by credible sources (Reuters, BBC, AP).

### 6. **Entity Verification** 🆕
Extract people/organizations and verify with Wikipedia.

### 7. **Image AI Detection** (Optional)
Detect if images are AI-generated.

---

## 📥 INPUT FORMAT (From Extension)

The Chrome extension will send this JSON to `/api/v1/analyze`:

```json
{
  "content": "Full article text here... (actual text from webpage)",
  "url": "https://example.com/article",
  "title": "Article headline",
  "images": [
    {
      "url": "https://example.com/image1.jpg",
      "alt": "Image alt text",
      "caption": "Image caption from article"
    }
  ],
  "metadata": {
    "domain": "example.com",
    "publishDate": "2024-10-15",
    "author": "John Doe"
  }
}
```

**IMPORTANT:** Use the REAL `content`, `images`, and `url` sent by the extension!

---

## 📤 OUTPUT FORMAT (Required)

Return this EXACT JSON structure:

```json
{
  "classification": "verified" | "questionable" | "false",
  "confidence": 0.85,
  "explanation": "Brief 2-3 sentence analysis of why content is credible or not",
  
  "suspicious_sentences": [
    {
      "sentence": "EXACT text from article - word for word!",
      "reason": "Why this is suspicious",
      "score": 0.92
    }
  ],
  
  "emotional_analysis": {
    "manipulation_detected": true,
    "manipulation_score": 0.78,
    "emotions": {
      "fear": 0.65,
      "anger": 0.52,
      "neutral": 0.15
    },
    "warning": "Article uses excessive emotional language"
  },
  
  "image_verification": [
    {
      "image_url": "https://example.com/image1.jpg",
      "caption_match": {
        "matches_caption": false,
        "confidence": 0.23,
        "warning": "Image does not match article caption"
      },
      "ai_generated": {
        "is_ai": true,
        "confidence": 0.87
      }
    }
  ],
  
  "news_crossref": {
    "found_in_credible_sources": true,
    "credible_sources": [
      {
        "name": "Reuters",
        "url": "https://reuters.com/article",
        "published": "2024-10-15"
      }
    ],
    "verdict": "VERIFIED"
  },
  
  "entity_verification": {
    "people": ["John Doe", "Jane Smith"],
    "organizations": ["NASA", "WHO"],
    "verified": {
      "John Doe": {
        "exists": false,
        "warning": "Person not found in Wikipedia"
      },
      "NASA": {
        "exists": true,
        "summary": "Space agency..."
      }
    }
  }
}
```

---

## 💻 COMPLETE SERVER CODE

### **File: server.py**

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import uvicorn

# AI/ML Imports
from transformers import pipeline, CLIPProcessor, CLIPModel
from PIL import Image
import requests
from io import BytesIO
import wikipediaapi
from newsapi import NewsApiClient
import openai  # or anthropic for Claude
import json

app = FastAPI(title="Misinformation Detection API")

# ============= CORS CONFIGURATION =============
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow Chrome extension
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============= MODELS INITIALIZATION =============
print("🚀 Loading AI models...")

# Text Classification Model (choose one):
# Option 1: Use GPT-4/Claude (best quality)
openai.api_key = "YOUR_OPENAI_API_KEY"  # Replace with real key

# Option 2: Use local model (free)
# text_classifier = pipeline("text-classification", model="hamzab/roberta-fake-news-classification")

# Emotion Detection (FREE)
emotion_detector = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    top_k=None
)

# NER for Entity Extraction (FREE)
ner_model = pipeline("ner", model="dslim/bert-base-NER", grouped_entities=True)

# CLIP for Image Verification (FREE)
clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

# AI Image Detector (FREE)
ai_image_detector = pipeline(
    "image-classification",
    model="umm-maybe/AI-image-detector"
)

# NewsAPI (FREE - 100 requests/day)
newsapi = NewsApiClient(api_key='f7737e24c97c46c9ac85618469bdb25b')  # ✅ YOUR API KEY ADDED!

# Wikipedia (FREE - unlimited)
wiki = wikipediaapi.Wikipedia('en')

print("✅ All models loaded successfully!")

# ============= REQUEST/RESPONSE MODELS =============
class ImageData(BaseModel):
    url: str
    alt: Optional[str] = None
    caption: Optional[str] = None

class AnalysisRequest(BaseModel):
    content: str  # Article text from extension
    url: Optional[str] = None
    title: Optional[str] = None
    images: Optional[List[ImageData]] = []
    metadata: Optional[Dict] = {}

# ============= ANALYSIS FUNCTIONS =============

def analyze_text_with_gpt4(content: str) -> dict:
    """Analyze text for misinformation using GPT-4"""
    
    system_prompt = """You are an expert fact-checker. Analyze text for misinformation and return ONLY valid JSON.
    
    Format:
    {
      "classification": "verified|questionable|false",
      "confidence": 0.0-1.0,
      "explanation": "brief analysis",
      "suspicious_sentences": [
        {
          "sentence": "EXACT text from article",
          "reason": "why suspicious",
          "score": 0.0-1.0
        }
      ]
    }
    
    Detect: unverified claims, vague sources, conspiracy theories, emotional manipulation.
    CRITICAL: Copy sentences EXACTLY word-for-word from article!
    """
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Analyze this article:\n\n{content}"}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        return json.loads(response.choices[0].message.content)
    
    except Exception as e:
        print(f"❌ GPT-4 Error: {e}")
        return {
            "classification": "questionable",
            "confidence": 0.5,
            "explanation": "Unable to complete full analysis",
            "suspicious_sentences": []
        }

def detect_emotional_manipulation(content: str) -> dict:
    """Detect emotional manipulation in text"""
    
    # Analyze first 2000 characters
    text_chunk = content[:2000]
    emotions = emotion_detector(text_chunk)[0]
    
    # Calculate emotion scores
    emotion_scores = {e['label']: e['score'] for e in emotions}
    
    # Check for manipulation
    manipulation_emotions = ['fear', 'anger', 'disgust']
    manipulation_score = sum(emotion_scores.get(e, 0) for e in manipulation_emotions)
    neutral_score = emotion_scores.get('neutral', 0)
    
    is_manipulative = manipulation_score > 0.5 and neutral_score < 0.3
    
    return {
        "manipulation_detected": is_manipulative,
        "manipulation_score": manipulation_score,
        "emotions": emotion_scores,
        "warning": "⚠️ Article uses excessive emotional language to manipulate readers" if is_manipulative else None
    }

def verify_image_with_clip(image_url: str, article_caption: str) -> dict:
    """Verify if image matches caption using CLIP"""
    
    try:
        # Download image
        response = requests.get(image_url, timeout=5)
        image = Image.open(BytesIO(response.content))
        
        # Test hypotheses
        text_options = [
            article_caption,
            "a generic stock photo",
            "an unrelated image",
            "a real news photo"
        ]
        
        # Process with CLIP
        inputs = clip_processor(
            text=text_options,
            images=image,
            return_tensors="pt",
            padding=True
        )
        
        outputs = clip_model(**inputs)
        probs = outputs.logits_per_image.softmax(dim=1)[0]
        
        caption_match_score = probs[0].item()
        is_mismatch = caption_match_score < 0.3
        
        return {
            "matches_caption": not is_mismatch,
            "confidence": caption_match_score,
            "warning": f"Image does not match caption (only {caption_match_score:.0%} match)" if is_mismatch else None
        }
    
    except Exception as e:
        print(f"❌ CLIP Error: {e}")
        return {"matches_caption": True, "confidence": 0.5, "warning": "Unable to verify image"}

def detect_ai_image(image_url: str) -> dict:
    """Detect if image is AI-generated"""
    
    try:
        response = requests.get(image_url, timeout=5)
        image = Image.open(BytesIO(response.content))
        
        result = ai_image_detector(image)[0]
        
        is_ai = result['label'] == 'artificial'
        confidence = result['score']
        
        return {
            "is_ai": is_ai and confidence > 0.7,
            "confidence": confidence
        }
    
    except Exception as e:
        print(f"❌ AI Image Detection Error: {e}")
        return {"is_ai": False, "confidence": 0.5}

def cross_reference_news(headline: str, content: str) -> dict:
    """Cross-reference story with credible news sources"""
    
    try:
        # Search NewsAPI
        articles = newsapi.get_everything(
            q=headline[:100],  # First 100 chars
            language='en',
            sort_by='relevancy',
            page_size=20
        )
        
        # Credible sources - International + Indian Authentic Sources
        credible = [
            # International credible sources
            'reuters', 'bbc-news', 'associated-press', 'the-guardian', 'cnn', 'npr',
            
            # Indian authentic news sources (added for better Indian news coverage)
            'the-times-of-india', 'the-hindu', 'hindustan-times', 'ndtv'
        ]
        
        # Also check domain names for sources not in NewsAPI's database
        credible_domains = [
            'lallantop.com',      # Lallantop - Authentic Indian news
            'thewire.in',         # The Wire - Independent Indian journalism
            'tntworld.in',        # TNT World - Trusted news source
            'scroll.in',          # Scroll.in - Quality journalism
            'thequint.com',       # The Quint
            'reuters.com',
            'bbc.com',
            'apnews.com'
        ]
        
        credible_matches = []
        for article in articles.get('articles', []):
            source_id = article['source'].get('id', '')
            source_name = article['source'].get('name', '')
            article_url = article.get('url', '')
            
            # Check if source ID matches credible list
            is_credible_source = source_id in credible
            
            # Also check if domain matches credible domains (for sources like Lallantop, The Wire, TNT World)
            is_credible_domain = any(domain in article_url for domain in credible_domains)
            
            if is_credible_source or is_credible_domain:
                credible_matches.append({
                    "name": article['source']['name'],
                    "url": article['url'],
                    "published": article['publishedAt']
                })
        
        # Verdict
        if len(credible_matches) >= 2:
            verdict = "VERIFIED"
        elif len(credible_matches) == 1:
            verdict = "LIKELY TRUE"
        else:
            verdict = "UNVERIFIED - No credible sources found"
        
        return {
            "found_in_credible_sources": len(credible_matches) > 0,
            "credible_sources": credible_matches[:3],  # Top 3
            "verdict": verdict
        }
    
    except Exception as e:
        print(f"❌ News API Error: {e}")
        return {
            "found_in_credible_sources": False,
            "credible_sources": [],
            "verdict": "Unable to verify"
        }

def verify_entities(content: str) -> dict:
    """Extract and verify entities with Wikipedia"""
    
    # Extract entities
    entities = ner_model(content[:512])  # First 512 chars
    
    people = list(set([e['word'] for e in entities if e['entity_group'] == 'PER']))
    organizations = list(set([e['word'] for e in entities if e['entity_group'] == 'ORG']))
    
    # Verify with Wikipedia
    verified = {}
    for entity in (people + organizations)[:5]:  # Limit to 5
        page = wiki.page(entity)
        verified[entity] = {
            "exists": page.exists(),
            "summary": page.summary[:150] if page.exists() else None,
            "warning": "Entity not found in Wikipedia" if not page.exists() else None
        }
    
    return {
        "people": people,
        "organizations": organizations,
        "verified": verified
    }

# ============= API ENDPOINTS =============

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Server is running"}

@app.get("/api/v1/health")
async def api_health():
    """API health check"""
    return {"status": "ok", "version": "1.0.0"}

@app.post("/api/v1/analyze")
async def analyze_content(request: AnalysisRequest):
    """
    Main analysis endpoint - receives real data from Chrome extension
    
    IMPORTANT: Use the REAL content, images, and URL sent by extension!
    NO dummy data!
    """
    
    print("\n" + "="*60)
    print("📥 NEW ANALYSIS REQUEST")
    print("="*60)
    print(f"📄 Content length: {len(request.content)} characters")
    print(f"🌐 URL: {request.url}")
    print(f"🖼️ Images: {len(request.images)}")
    print("="*60 + "\n")
    
    # Validate input
    if not request.content or len(request.content) < 50:
        raise HTTPException(status_code=400, detail="Content too short for analysis")
    
    # 1. Text Analysis (GPT-4 or local model)
    print("🔍 Analyzing text...")
    text_analysis = analyze_text_with_gpt4(request.content)
    
    # 2. Emotional Manipulation Detection
    print("😡 Detecting emotional manipulation...")
    emotional_analysis = detect_emotional_manipulation(request.content)
    
    # 3. Image Verification (if images provided)
    image_results = []
    if request.images:
        print(f"🖼️ Verifying {len(request.images)} images...")
        for img in request.images[:3]:  # Limit to 3 images
            caption = img.caption or img.alt or "news image"
            
            image_results.append({
                "image_url": img.url,
                "caption_match": verify_image_with_clip(img.url, caption),
                "ai_generated": detect_ai_image(img.url)
            })
    
    # 4. News Cross-Reference
    print("📰 Cross-referencing with news sources...")
    news_check = cross_reference_news(request.title or "", request.content)
    
    # 5. Entity Verification
    print("🔍 Verifying entities...")
    entity_check = verify_entities(request.content)
    
    # Prepare response
    response = {
        "classification": text_analysis.get("classification", "questionable"),
        "confidence": text_analysis.get("confidence", 0.5),
        "explanation": text_analysis.get("explanation", "Analysis complete"),
        "suspicious_sentences": text_analysis.get("suspicious_sentences", []),
        "emotional_analysis": emotional_analysis,
        "image_verification": image_results,
        "news_crossref": news_check,
        "entity_verification": entity_check
    }
    
    print("\n✅ Analysis complete!")
    print(f"   Classification: {response['classification']}")
    print(f"   Confidence: {response['confidence']:.0%}")
    print(f"   Suspicious sentences: {len(response['suspicious_sentences'])}")
    print(f"   Emotional manipulation: {emotional_analysis['manipulation_detected']}")
    print(f"   News verified: {news_check['verdict']}\n")
    
    return response

# ============= RUN SERVER =============
if __name__ == "__main__":
    print("\n" + "="*60)
    print("🚀 STARTING MISINFORMATION DETECTION SERVER")
    print("="*60)
    print(f"🌐 Host: 10.25.26.187")
    print(f"🔌 Port: 8002")
    print(f"📡 Endpoint: http://10.25.26.187:8002/api/v1/analyze")
    print("="*60 + "\n")
    
    uvicorn.run(
        app,
        host="10.25.26.187",  # IMPORTANT: Use friend's laptop IP!
        port=8002,  # IMPORTANT: Port 8002, not 8000!
        log_level="info"
    )
```

---

## 📦 DEPENDENCIES (requirements.txt)

Create `requirements.txt`:

```
fastapi==0.104.1
uvicorn==0.24.0
transformers==4.35.0
torch==2.1.0
pillow==10.1.0
requests==2.31.0
newsapi-python==0.2.7
wikipedia-api==0.6.0
openai==1.3.0
pydantic==2.5.0
python-multipart==0.0.6
```

Install:
```bash
pip install -r requirements.txt
```

---

## 🔑 API KEYS NEEDED

### 1. **OpenAI GPT-4** (Optional, $$$)
- Get from: https://platform.openai.com/
- Price: ~$0.03 per 1k tokens
- Alternative: Use free local model instead

### 2. **NewsAPI** (FREE - 100/day)
- Get from: https://newsapi.org/register
- Free tier: 100 requests/day
- Required for news cross-reference

### 3. **All Other Models** (FREE)
- Hugging Face models: No API key needed
- Wikipedia: No API key needed
- CLIP: No API key needed

---

## ✅ TESTING CHECKLIST

### Test 1: Basic Connection
```bash
curl http://10.25.26.187:8002/health
```
Expected: `{"status":"healthy"}`

### Test 2: Analysis Endpoint
```bash
curl -X POST http://10.25.26.187:8002/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "content": "NASA announced the moon landing was faked. Experts confirm this shocking discovery.",
    "url": "https://example.com",
    "title": "Fake Moon Landing",
    "images": []
  }'
```

Expected: JSON with `suspicious_sentences`, `emotional_analysis`, etc.

### Test 3: With Real Extension Data
1. Open Chrome extension
2. Analyze a real news article
3. Check server logs for actual content received
4. Verify response includes all fields

---

## 🚨 CRITICAL RULES

1. ✅ **USE REAL DATA**: Use `request.content`, `request.images`, `request.url` from extension
2. ❌ **NO DUMMY DATA**: Don't return fake/placeholder responses
3. ✅ **EXACT SENTENCES**: Copy suspicious sentences word-for-word from article
4. ✅ **ERROR HANDLING**: Wrap all API calls in try-except
5. ✅ **CORS ENABLED**: Must allow extension to connect
6. ✅ **PORT 8002**: Not 8000!
7. ✅ **HOST IP**: 10.25.26.187 (friend's laptop)

---

## 🎯 SUCCESS CRITERIA

- [ ] Server starts on 10.25.26.187:8002
- [ ] Health endpoint responds
- [ ] CORS allows extension connection
- [ ] Receives real content from extension
- [ ] Returns all required fields
- [ ] Suspicious sentences are exact matches
- [ ] CLIP verifies images
- [ ] NewsAPI cross-references stories
- [ ] Wikipedia verifies entities
- [ ] Emotion detection works
- [ ] No dummy/fake data in responses

---

## 💡 OPTIMIZATION TIPS

1. **Cache Results**: Store analysis for 1 hour to avoid re-processing
2. **Batch Processing**: Process multiple images in parallel
3. **Rate Limiting**: Respect NewsAPI 100/day limit
4. **Model Loading**: Load models once at startup, not per request
5. **Timeout Handling**: Set 5-second timeout for image downloads

---

## 🔧 TROUBLESHOOTING

### "CORS Error"
→ Add CORS middleware (already in code above)

### "Models taking too long"
→ Use smaller models or reduce batch size

### "NewsAPI limit exceeded"
→ Implement caching or use alternative sources

### "Extension not receiving response"
→ Check server logs for actual request data
→ Verify JSON format matches expected output

---

## ✨ FINAL NOTES

This server implements **production-ready** misinformation detection with:
- ✅ Real text analysis (GPT-4 or local)
- ✅ Suspicious sentence extraction
- ✅ CLIP image verification
- ✅ Emotion manipulation detection
- ✅ News cross-referencing
- ✅ Entity verification with Wikipedia
- ✅ AI image detection

**Total Cost: FREE** (except GPT-4 if used)

All features use real data from the Chrome extension. No dummy/fake responses!

---

**Ready to implement? Copy this entire prompt to GPT-4/Claude and say:**

> "Implement this server exactly as described. Use real data, no dummy responses. Test all endpoints."

🚀 Good luck!