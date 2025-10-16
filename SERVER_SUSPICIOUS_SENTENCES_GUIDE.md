# 🎯 Server Implementation Guide: Suspicious Sentences Detection

## Overview

Your extension now has a "Show Suspicious Lines" feature! When the server analyzes content, it should return suspicious sentences that the extension will highlight on the page.

---

## 📊 Server Response Format

Your server's `/api/v1/analyze` endpoint should return this structure:

```json
{
  "classification": "questionable",
  "confidence": 0.65,
  "explanation": "This article contains several unverified claims...",
  "highlighted_phrases": ["moon landing", "conspiracy theory"],
  "fact_check_sources": [
    {
      "name": "Snopes",
      "url": "https://snopes.com/fact-check/...",
      "verdict": "False"
    }
  ],
  "suspicious_sentences": [
    {
      "sentence": "NASA announced that the moon landing was faked in 1969.",
      "reason": "Contains unverified claim contradicting established facts",
      "score": 0.95
    },
    {
      "sentence": "Multiple experts have confirmed this information.",
      "reason": "Vague appeal to authority without specific sources",
      "score": 0.75
    },
    {
      "sentence": "This has been proven by recent studies.",
      "reason": "References non-existent or unspecified studies",
      "score": 0.80
    }
  ]
}
```

---

## 🔑 Key Fields Explained

### `suspicious_sentences` (NEW!)
**Type:** Array of objects  
**Required:** No (optional field)  
**Description:** List of sentences from the analyzed content that are potentially misleading or false.

Each object in the array should have:

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `sentence` | string | ✅ Yes | The exact suspicious sentence from the article | `"NASA announced the moon landing was fake."` |
| `reason` | string | ⚠️ Optional | Why this sentence is suspicious | `"Contains unverified claim"` |
| `score` | float | ⚠️ Optional | Suspicion level (0.0 to 1.0) | `0.85` |

### Suspicion Score Guide:
- **0.9 - 1.0**: Extremely suspicious (likely false) → Red highlight
- **0.6 - 0.89**: Moderately suspicious (questionable) → Orange highlight  
- **0.0 - 0.59**: Mildly suspicious (needs verification) → Yellow highlight

---

## 🤖 AI Prompt for Your Server

Use this prompt with your AI model (GPT, Claude, Llama, etc.) to detect suspicious sentences:

```python
ANALYSIS_PROMPT = """
You are an expert fact-checker analyzing news articles for misinformation.

Your task:
1. Read the entire article carefully
2. Identify sentences that are potentially misleading, false, or unverified
3. For each suspicious sentence, explain why it's suspicious and rate its suspicion level

Return a JSON response in this exact format:
{
  "classification": "verified" | "questionable" | "false" | "misinformation",
  "confidence": 0.0 to 1.0,
  "explanation": "Brief overall analysis of the article",
  "suspicious_sentences": [
    {
      "sentence": "Exact sentence from the article",
      "reason": "Why this sentence is suspicious",
      "score": 0.0 to 1.0
    }
  ]
}

RED FLAGS to look for in sentences:
- Unverified claims presented as facts
- Appeal to unnamed "experts" or "studies" without sources
- Sensational language designed to trigger emotions
- Factual claims that contradict established knowledge
- Missing context that changes the meaning
- Statistical claims without proper sources
- Conspiracy theories presented as news
- Misleading cause-and-effect relationships
- Cherry-picked data or quotes
- "Many people are saying" without attribution

SUSPICION SCORE GUIDE:
- 0.9-1.0: Almost certainly false (contradicts verified facts)
- 0.7-0.89: Highly questionable (unverified, lacks sources)
- 0.5-0.69: Suspicious (needs fact-checking, vague claims)
- 0.3-0.49: Potentially misleading (missing context)
- 0.0-0.29: Likely accurate but worth noting

Article to analyze:
{article_content}

Return ONLY valid JSON, no other text.
"""
```

---

## 📝 Example Server Implementation (FastAPI)

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import openai  # or anthropic, or your AI library
import json

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalysisRequest(BaseModel):
    content: str
    url: str = None
    source: str = None

class SuspiciousSentence(BaseModel):
    sentence: str
    reason: str = "Potentially misleading"
    score: float = 0.5

class AnalysisResponse(BaseModel):
    classification: str
    confidence: float
    explanation: str
    suspicious_sentences: list[SuspiciousSentence] = []
    highlighted_phrases: list[str] = []
    fact_check_sources: list[dict] = []

@app.post("/api/v1/analyze", response_model=AnalysisResponse)
async def analyze_content(request: AnalysisRequest):
    try:
        # Call your AI model
        prompt = f"""
        You are an expert fact-checker. Analyze this article and identify suspicious sentences.
        
        Article:
        {request.content}
        
        Return JSON with:
        {{
          "classification": "verified|questionable|false",
          "confidence": 0.0-1.0,
          "explanation": "brief analysis",
          "suspicious_sentences": [
            {{
              "sentence": "exact sentence from article",
              "reason": "why suspicious",
              "score": 0.0-1.0
            }}
          ]
        }}
        """
        
        # Example using OpenAI
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a fact-checking expert. Always return valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )
        
        result = json.loads(response.choices[0].message.content)
        
        return AnalysisResponse(**result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}
```

---

## 📝 Example Server Implementation (Flask)

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/v1/analyze', methods=['POST'])
def analyze_content():
    try:
        data = request.get_json()
        content = data.get('content', '')
        
        if not content:
            return jsonify({"error": "No content provided"}), 400
        
        # Call your AI model
        prompt = f"""
        Analyze this article and identify suspicious sentences.
        
        Article:
        {content}
        
        Return JSON format:
        {{
          "classification": "verified|questionable|false",
          "confidence": 0.65,
          "explanation": "analysis here",
          "suspicious_sentences": [
            {{
              "sentence": "exact text from article",
              "reason": "why it's suspicious",
              "score": 0.85
            }}
          ]
        }}
        """
        
        # Example using OpenAI
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a fact-checker. Return valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )
        
        result = json.loads(response.choices[0].message.content)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/v1/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "version": "1.0.0"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8002, debug=True)
```

---

## 🧪 Test Your Server

### Test Request:
```bash
curl -X POST http://10.25.26.187:8002/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "content": "NASA announced that the moon landing was faked in 1969. Multiple experts have confirmed this information. This has been proven by recent studies.",
    "url": null,
    "source": "test"
  }'
```

### Expected Response:
```json
{
  "classification": "false",
  "confidence": 0.92,
  "explanation": "This content contains multiple false claims contradicting established historical facts.",
  "suspicious_sentences": [
    {
      "sentence": "NASA announced that the moon landing was faked in 1969.",
      "reason": "Contradicts verified historical records and scientific evidence",
      "score": 0.98
    },
    {
      "sentence": "Multiple experts have confirmed this information.",
      "reason": "Vague appeal to authority without specific attribution",
      "score": 0.75
    },
    {
      "sentence": "This has been proven by recent studies.",
      "reason": "References non-existent studies without citation",
      "score": 0.80
    }
  ],
  "highlighted_phrases": ["moon landing", "faked", "experts"],
  "fact_check_sources": []
}
```

---

## ✅ Checklist for Server Implementation

- [ ] Server returns `suspicious_sentences` array in response
- [ ] Each suspicious sentence has `sentence` field (exact text)
- [ ] Each sentence has `reason` field explaining why it's suspicious
- [ ] Each sentence has `score` field (0.0 to 1.0)
- [ ] CORS is enabled (`Access-Control-Allow-Origin: *`)
- [ ] Server is running on port 8002 (not 8000!)
- [ ] Health check endpoint works: `http://10.25.26.187:8002/api/v1/health`
- [ ] Test with curl shows suspicious sentences in response

---

## 🎨 How It Works in Extension

1. **User visits news page** → Extension auto-analyzes
2. **Server returns results** → Including `suspicious_sentences` array
3. **Extension shows overlay** → With "🔍 Show Suspicious Lines" button
4. **User clicks button** → Extension highlights suspicious sentences on page
5. **Highlights appear** → Yellow/orange/red based on score
6. **Hover over highlight** → Shows tooltip with reason and confidence

---

## 🐛 Troubleshooting

### Extension not showing button?
- Check if server is returning `suspicious_sentences` in response
- Open browser console and look for: `🔍 Highlighting suspicious lines:`
- Verify response format matches expected structure

### Highlights not appearing?
- Sentences must match EXACTLY (case-insensitive, flexible whitespace)
- Server should return the exact sentence text as it appears in the article
- Check console for: `✓ Found match in paragraph:`

### Server errors?
- Make sure CORS is enabled
- Check server logs for AI model errors
- Verify JSON response is valid
- Test with simple curl request first

---

## 🚀 Ready to Test!

1. Update your server code to return `suspicious_sentences`
2. Restart the server
3. Reload the extension (chrome://extensions/)
4. Visit an NDTV article
5. Wait for analysis overlay
6. Click "🔍 Show Suspicious Lines"
7. See highlights on the page! ✨

---

## 📞 Need Help?

If suspicious sentences aren't being detected:
1. Check server logs for AI model responses
2. Verify the prompt is asking for sentence-level analysis
3. Make sure sentences are extracted correctly from article
4. Test with a simple example article first
5. Check that response JSON is valid

Good luck! 🎉
