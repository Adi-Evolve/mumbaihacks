# 🚀 Advanced Features & Technologies Guide

## 📸 Part 1: Context Verification for Images & Videos

### **Image Verification Technologies**

#### 1. **Reverse Image Search** (Easy to implement)
Detect if image is manipulated or taken from different context.

**API Options:**
- **Google Reverse Image Search API** (unofficial)
- **TinEye API** (free tier available)
- **Bing Visual Search API**

**Implementation:**
```python
# Using TinEye API
import requests

def verify_image(image_url):
    """Check if image has been used before in different context"""
    api_key = "your_tineye_api_key"
    
    response = requests.post(
        "https://api.tineye.com/rest/search/",
        data={
            "image_url": image_url,
            "api_key": api_key
        }
    )
    
    results = response.json()
    
    return {
        "is_original": results["total_results"] == 0,
        "previous_uses": results["total_results"],
        "earliest_date": results["oldest_match_date"] if results["matches"] else None,
        "similar_images": [match["url"] for match in results["matches"][:5]]
    }
```

**Chrome Extension Side:**
```javascript
// In content.js - Extract images from article
function extractImages() {
    const images = document.querySelectorAll('article img, .content img, .post img');
    return Array.from(images).map(img => ({
        url: img.src,
        alt: img.alt,
        caption: img.closest('figure')?.querySelector('figcaption')?.textContent
    }));
}

// Send to server for verification
chrome.runtime.sendMessage({
    action: 'verifyImages',
    images: extractImages()
});
```

---

#### 2. **AI Image Manipulation Detection** (Advanced)

**Technologies:**
- **DeepFake Detection Models** (CNN-based)
- **ELA (Error Level Analysis)** - Detect edited regions
- **Metadata Analysis** - Check EXIF data tampering

**Using Hugging Face Transformers:**
```python
from transformers import pipeline
from PIL import Image
import requests

# Load deepfake detection model
detector = pipeline("image-classification", model="dima806/deepfake_vs_real_image_detection")

def detect_manipulated_image(image_url):
    """Detect if image is AI-generated or manipulated"""
    image = Image.open(requests.get(image_url, stream=True).raw)
    
    result = detector(image)
    
    return {
        "is_fake": result[0]["label"] == "fake",
        "confidence": result[0]["score"],
        "analysis": "AI-generated or manipulated" if result[0]["label"] == "fake" else "Likely authentic"
    }
```

**EXIF Metadata Check:**
```python
from PIL import Image
from PIL.ExifTags import TAGS
import io

def check_image_metadata(image_url):
    """Extract and verify EXIF metadata"""
    response = requests.get(image_url)
    image = Image.open(io.BytesIO(response.content))
    
    exif_data = {}
    if hasattr(image, '_getexif') and image._getexif():
        for tag_id, value in image._getexif().items():
            tag = TAGS.get(tag_id, tag_id)
            exif_data[tag] = str(value)
    
    return {
        "has_metadata": len(exif_data) > 0,
        "camera": exif_data.get("Model", "Unknown"),
        "date_taken": exif_data.get("DateTime", "Unknown"),
        "software": exif_data.get("Software", "None"),
        "warning": "No metadata - possibly edited" if not exif_data else None
    }
```

---

### **Video Verification Technologies**

#### 1. **DeepFake Video Detection** (Using AI)

**Best Models:**
- **Facebook's DeepFake Detection Challenge models**
- **Sensity AI**
- **Microsoft Video Authenticator**

**Using Pre-trained Model:**
```python
import cv2
import torch
from transformers import VideoMAEForVideoClassification, VideoMAEImageProcessor

def detect_deepfake_video(video_path):
    """Detect if video contains deepfakes"""
    
    # Load model
    processor = VideoMAEImageProcessor.from_pretrained("MCG-NJU/videomae-base")
    model = VideoMAEForVideoClassification.from_pretrained(
        "your-deepfake-detection-model"
    )
    
    # Extract frames
    cap = cv2.VideoCapture(video_path)
    frames = []
    while len(frames) < 16:  # Sample 16 frames
        ret, frame = cap.read()
        if not ret:
            break
        frames.append(frame)
    cap.release()
    
    # Process
    inputs = processor(frames, return_tensors="pt")
    outputs = model(**inputs)
    
    prediction = torch.softmax(outputs.logits, dim=1)
    
    return {
        "is_deepfake": prediction[0][1].item() > 0.5,
        "confidence": prediction[0][1].item(),
        "frame_analysis": "Multiple facial inconsistencies detected" if prediction[0][1].item() > 0.5 else "No manipulation detected"
    }
```

#### 2. **Video Context Verification**

**YouTube Data API:**
```python
from googleapiclient.discovery import build

def verify_youtube_video(video_id):
    """Verify YouTube video metadata and context"""
    
    youtube = build('youtube', 'v3', developerKey='YOUR_API_KEY')
    
    request = youtube.videos().list(
        part="snippet,statistics,contentDetails",
        id=video_id
    )
    response = request.execute()
    
    if not response['items']:
        return {"error": "Video not found"}
    
    video = response['items'][0]
    
    return {
        "title": video['snippet']['title'],
        "channel": video['snippet']['channelTitle'],
        "upload_date": video['snippet']['publishedAt'],
        "view_count": int(video['statistics']['viewCount']),
        "like_ratio": int(video['statistics']['likeCount']) / int(video['statistics']['viewCount']),
        "comments_disabled": 'commentCount' not in video['statistics'],
        "warning": "Comments disabled - potential misinformation" if 'commentCount' not in video['statistics'] else None
    }
```

#### 3. **Video Thumbnail Reverse Search**
```python
def verify_video_thumbnail(video_url):
    """Extract thumbnail and reverse search"""
    import yt_dlp
    
    ydl_opts = {'quiet': True}
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(video_url, download=False)
        thumbnail_url = info['thumbnail']
    
    # Reverse search the thumbnail
    return verify_image(thumbnail_url)
```

---

## 🤖 Part 2: Advanced AI Technologies for Hackathon

### **1. Multi-Modal AI Models** (Text + Image + Video)

#### **CLIP (OpenAI)**
Understands both text and images together.

```python
from transformers import CLIPProcessor, CLIPModel
from PIL import Image

model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

def verify_image_text_consistency(image_url, article_text):
    """Check if image matches article claims"""
    
    image = Image.open(requests.get(image_url, stream=True).raw)
    
    # Test if image matches article claims
    inputs = processor(
        text=[article_text, "fake news", "real news", "manipulated"],
        images=image,
        return_tensors="pt",
        padding=True
    )
    
    outputs = model(**inputs)
    logits_per_image = outputs.logits_per_image
    probs = logits_per_image.softmax(dim=1)
    
    return {
        "image_text_match": probs[0][0].item(),
        "appears_fake": probs[0][1].item(),
        "appears_real": probs[0][2].item(),
        "warning": "Image may not match article content" if probs[0][0].item() < 0.3 else None
    }
```

---

### **2. Named Entity Recognition (NER)** 
Extract and verify people, organizations, locations mentioned.

```python
from transformers import pipeline

ner = pipeline("ner", model="dslim/bert-base-NER", grouped_entities=True)

def extract_entities(text):
    """Extract named entities for fact-checking"""
    entities = ner(text)
    
    return {
        "people": [e['word'] for e in entities if e['entity_group'] == 'PER'],
        "organizations": [e['word'] for e in entities if e['entity_group'] == 'ORG'],
        "locations": [e['word'] for e in entities if e['entity_group'] == 'LOC'],
        "dates": [e['word'] for e in entities if e['entity_group'] == 'DATE']
    }

def verify_entities_with_wikipedia(entities):
    """Cross-reference entities with Wikipedia"""
    import wikipediaapi
    
    wiki = wikipediaapi.Wikipedia('en')
    verified = {}
    
    for person in entities['people']:
        page = wiki.page(person)
        verified[person] = {
            "exists": page.exists(),
            "summary": page.summary[:200] if page.exists() else None
        }
    
    return verified
```

---

### **3. Sentiment & Emotion Analysis**
Detect emotional manipulation in articles.

```python
from transformers import pipeline

emotion_classifier = pipeline("text-classification", 
                              model="j-hartmann/emotion-english-distilroberta-base",
                              top_k=None)

def detect_emotional_manipulation(text):
    """Detect if article uses emotional manipulation"""
    
    emotions = emotion_classifier(text[:512])[0]  # First 512 chars
    
    # High fear/anger/disgust = potential manipulation
    manipulation_emotions = ['fear', 'anger', 'disgust']
    manipulation_score = sum(
        e['score'] for e in emotions 
        if e['label'].lower() in manipulation_emotions
    )
    
    return {
        "emotions": {e['label']: e['score'] for e in emotions},
        "manipulation_detected": manipulation_score > 0.5,
        "manipulation_score": manipulation_score,
        "warning": "High emotional manipulation detected" if manipulation_score > 0.5 else None
    }
```

---

### **4. Stance Detection**
Check if article is biased or one-sided.

```python
from transformers import pipeline

stance_detector = pipeline("text-classification", 
                          model="card/stance_detection")

def detect_bias(text, topic):
    """Detect stance/bias on a topic"""
    
    result = stance_detector(f"{topic}: {text}")
    
    return {
        "stance": result[0]['label'],  # favor, against, neutral
        "confidence": result[0]['score'],
        "warning": "Strong bias detected" if result[0]['score'] > 0.8 and result[0]['label'] != 'neutral' else None
    }
```

---

### **5. Fact-Checking with External APIs**

#### **Google Fact Check Tools API**
```python
def check_with_google_factcheck(claim):
    """Use Google's Fact Check API"""
    
    url = "https://factchecktools.googleapis.com/v1alpha1/claims:search"
    params = {
        "query": claim,
        "key": "YOUR_GOOGLE_API_KEY"
    }
    
    response = requests.get(url, params=params)
    results = response.json()
    
    if 'claims' in results:
        return {
            "fact_checked": True,
            "rating": results['claims'][0]['claimReview'][0]['textualRating'],
            "source": results['claims'][0]['claimReview'][0]['publisher']['name'],
            "url": results['claims'][0]['claimReview'][0]['url']
        }
    return {"fact_checked": False}
```

#### **Snopes/PolitiFact Integration**
```python
def check_with_factcheck_apis(claim):
    """Check multiple fact-checking databases"""
    
    # FactCheckAPI aggregator
    response = requests.post(
        "https://api.factcheck.com/verify",
        json={"claim": claim}
    )
    
    return response.json()
```

---

### **6. Claim Detection & Extraction**
Automatically extract checkable claims from article.

```python
from transformers import pipeline

claim_detector = pipeline("text2text-generation", 
                         model="google/flan-t5-base")

def extract_claims(article_text):
    """Extract factual claims that can be checked"""
    
    prompt = f"""Extract all factual claims from this text that can be fact-checked. 
    List each claim on a new line:
    
    {article_text}
    
    Factual claims:"""
    
    result = claim_detector(prompt, max_length=200)
    claims = result[0]['generated_text'].split('\n')
    
    return {
        "claims": [c.strip() for c in claims if c.strip()],
        "count": len([c for c in claims if c.strip()])
    }
```

---

### **7. Source Credibility Scoring**

```python
import requests
from urllib.parse import urlparse

def check_domain_credibility(url):
    """Check domain credibility using multiple sources"""
    
    domain = urlparse(url).netloc
    
    # Check with Media Bias/Fact Check (if they have API)
    # Check domain age
    # Check SSL certificate
    # Check social media presence
    
    credibility_score = 0.5  # Default neutral
    
    # Check domain age (older = more credible)
    whois_data = get_whois_data(domain)
    if whois_data['age_years'] > 5:
        credibility_score += 0.2
    
    # Check HTTPS
    if url.startswith('https'):
        credibility_score += 0.1
    
    # Check against known fake news domains
    fake_domains = ['fakenewssite.com', 'clickbait.net']  # Expand this list
    if domain in fake_domains:
        credibility_score = 0.1
    
    # Check against trusted domains
    trusted_domains = ['bbc.com', 'reuters.com', 'apnews.com', 'npr.org']
    if domain in trusted_domains:
        credibility_score = 0.9
    
    return {
        "domain": domain,
        "credibility_score": credibility_score,
        "rating": "trusted" if credibility_score > 0.7 else "questionable" if credibility_score > 0.4 else "untrusted",
        "https": url.startswith('https'),
        "domain_age_years": whois_data.get('age_years', 0)
    }
```

---

### **8. Cross-Referencing with News APIs**

```python
from newsapi import NewsApiClient

def cross_reference_story(headline):
    """Check if story is reported by credible sources"""
    
    newsapi = NewsApiClient(api_key='YOUR_NEWS_API_KEY')
    
    # Search for similar headlines
    articles = newsapi.get_everything(
        q=headline,
        language='en',
        sort_by='relevancy'
    )
    
    credible_sources = ['reuters', 'bbc', 'ap-news', 'the-guardian']
    
    credible_matches = [
        a for a in articles['articles']
        if a['source']['id'] in credible_sources
    ]
    
    return {
        "found_in_credible_sources": len(credible_matches) > 0,
        "total_sources": len(articles['articles']),
        "credible_sources_count": len(credible_matches),
        "warning": "Not found in credible news sources" if len(credible_matches) == 0 else None
    }
```

---

## 🎯 Recommended Tech Stack for Hackathon

### **Backend (FastAPI)**
```python
from fastapi import FastAPI, UploadFile
from transformers import pipeline
import uvicorn

app = FastAPI()

# Load all models at startup
@app.on_event("startup")
async def load_models():
    global text_classifier, emotion_detector, ner_model, image_detector
    
    text_classifier = pipeline("text-classification", model="your-model")
    emotion_detector = pipeline("text-classification", model="emotion-model")
    ner_model = pipeline("ner", model="ner-model")
    image_detector = pipeline("image-classification", model="deepfake-model")

@app.post("/api/v1/analyze")
async def analyze_comprehensive(
    content: str,
    images: list[str] = None,
    video_url: str = None
):
    """Comprehensive multi-modal analysis"""
    
    # Text analysis
    text_result = analyze_text(content)
    
    # Image verification (if provided)
    image_results = []
    if images:
        for img_url in images:
            image_results.append({
                "url": img_url,
                "reverse_search": verify_image(img_url),
                "deepfake_check": detect_manipulated_image(img_url),
                "metadata": check_image_metadata(img_url)
            })
    
    # Video verification (if provided)
    video_result = None
    if video_url:
        video_result = {
            "deepfake_check": detect_deepfake_video(video_url),
            "metadata": verify_youtube_video(video_url)
        }
    
    return {
        "text_analysis": text_result,
        "image_analysis": image_results,
        "video_analysis": video_result,
        "overall_credibility": calculate_overall_score(
            text_result, image_results, video_result
        )
    }
```

---

## 📊 Recommended Models & APIs

### **Free & Open Source:**
1. ✅ **Hugging Face Transformers** - Text analysis
2. ✅ **CLIP (OpenAI)** - Image-text matching
3. ✅ **spaCy** - NER and entity extraction
4. ✅ **TensorFlow/PyTorch** - Custom models
5. ✅ **Beautiful Soup** - Web scraping

### **Free Tier APIs:**
1. ✅ **Google Fact Check API** - 10k requests/day
2. ✅ **NewsAPI** - 100 requests/day
3. ✅ **TinEye** - 150 searches/month
4. ✅ **YouTube Data API** - 10k units/day
5. ✅ **Wikipedia API** - Unlimited (with rate limiting)

### **Paid (but impressive for demos):**
1. 💰 **OpenAI GPT-4** - Best text analysis ($0.03/1k tokens)
2. 💰 **Claude (Anthropic)** - Advanced reasoning
3. 💰 **Google Cloud Vision** - Image analysis
4. 💰 **AWS Rekognition** - Video analysis

---

## 🏆 Hackathon-Winning Feature Stack

### **Must Have:**
- ✅ Text misinformation detection (GPT-4/Claude)
- ✅ Suspicious sentence highlighting
- ✅ Source credibility scoring
- ✅ Named entity extraction & verification

### **Should Have:**
- ⭐ Reverse image search
- ⭐ Emotional manipulation detection
- ⭐ Cross-reference with fact-check APIs
- ⭐ Claim extraction

### **Wow Factor:**
- 🌟 DeepFake image detection
- 🌟 Video verification
- 🌟 Multi-modal analysis (CLIP)
- 🌟 Real-time Wikipedia verification

---

## 💡 Quick Implementation Plan

### **Week 1: Core + Images**
```
Day 1-2: Integrate reverse image search (TinEye API)
Day 3-4: Add EXIF metadata checker
Day 5-7: Implement deepfake image detection model
```

### **Week 2: Advanced Text + Video**
```
Day 1-2: NER + Wikipedia verification
Day 3-4: Emotion analysis integration
Day 5-7: Video thumbnail verification
```

### **Week 3: Polish**
```
Day 1-3: Cross-reference with fact-check APIs
Day 4-5: Source credibility database
Day 6-7: Performance optimization
```

---

## 🚀 Start Here (Quick Wins)

1. **Add Reverse Image Search** (2 hours)
   - Sign up for TinEye API
   - Extract images from articles
   - Show "Image used in X other contexts" warning

2. **Add Emotion Detection** (1 hour)
   - Load emotion model
   - Flag high fear/anger scores
   - Show "Emotional manipulation detected"

3. **Add Entity Verification** (3 hours)
   - Extract people/orgs with NER
   - Cross-check with Wikipedia
   - Flag unverified entities

These 3 features will make your hackathon project stand out! 🎉
