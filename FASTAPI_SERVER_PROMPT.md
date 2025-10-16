# 🤖 AI Prompt for FastAPI Server Fix

## ⚡ URGENT: Copy-Paste This to AI Now!

---

I'm building a misinformation detection Chrome extension for a hackathon. My server is running on FastAPI and responding, but the `/api/v1/analyze` endpoint is returning 503 error.

**Current Server Response:**
```json
{"detail":"Analysis model is not available."}
```

**Server Type:** FastAPI (confirmed from error message)  
**Port:** 8002  
**IP:** 10.25.26.187

**What I Need:**

Complete working FastAPI server code that:

1. **Runs on port 8002** (already configured)
2. **Has CORS enabled** for all origins
3. **Has these endpoints:**
   - `GET /api/v1/health` → Returns `{"status": "ok", "service": "misinformation-detector"}`
   - `POST /api/v1/analyze` → Accepts article JSON and returns dummy analysis

4. **Request format extension sends:**
```json
{
  "text": "Full article text here (2000-4000 characters)",
  "url": "https://www.ndtv.com/...",
  "title": "Article Title",
  "pageType": "news-portal",
  "language": "en",
  "author": "Author Name",
  "publishDate": "2025-10-15"
}
```

5. **Response format to return:**
```json
{
  "classification": "verified",
  "confidence": 0.85,
  "misinformation_score": 15,
  "explanation": "Content appears factual based on credible sources and consistent facts.",
  "highlighted_phrases": [
    "Indian-origin expert",
    "secret documents",
    "arrested by FBI"
  ],
  "fact_check_sources": [
    {
      "name": "Reuters Fact Check",
      "url": "https://www.reuters.com/fact-check",
      "verdict": "True"
    },
    {
      "name": "Associated Press",
      "url": "https://apnews.com",
      "verdict": "Verified"
    }
  ],
  "recommendations": [
    "Cross-reference with official government statements",
    "Verify dates and locations mentioned",
    "Check for sensational language"
  ]
}
```

6. **Must include:**
   - Full CORS configuration (allow all origins for hackathon)
   - Request validation using Pydantic models
   - Error handling for malformed requests
   - Logging for debugging
   - Can run with: `uvicorn app:app --host 0.0.0.0 --port 8002 --reload`

7. **For now:** Return dummy/mock analysis data (I'll add ML model later)

8. **CRITICAL:** Code must be copy-paste ready and work immediately!

---

## Code Requirements:

```python
# app.py structure needed:

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

app = FastAPI(title="Misinformation Detection API")

# CORS - Allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response models
class AnalysisRequest(BaseModel):
    text: str
    url: str
    title: str
    pageType: str
    language: str = "en"
    author: str = None
    publishDate: str = None

class AnalysisResponse(BaseModel):
    # ... fields from above

# Health endpoint
@app.get("/api/v1/health")
async def health_check():
    return {"status": "ok", "service": "misinformation-detector"}

# Analysis endpoint
@app.post("/api/v1/analyze")
async def analyze_content(request: AnalysisRequest):
    # Return dummy analysis for now
    return {
        # ... dummy data from above
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)
```

**Please provide the COMPLETE working code with:**
- All imports
- Full Pydantic models
- Both endpoints implemented
- Realistic dummy data
- Error handling
- Ready to run immediately

---

## Expected Output:

1. **Installation:**
```bash
pip install fastapi uvicorn pydantic
```

2. **Run command:**
```bash
python app.py
```
OR
```bash
uvicorn app:app --host 0.0.0.0 --port 8002 --reload
```

3. **Should see:**
```
INFO:     Uvicorn running on http://0.0.0.0:8002
INFO:     Application startup complete.
```

4. **Test endpoints:**
```bash
# Health check
curl http://localhost:8002/api/v1/health

# Should return: {"status":"ok","service":"misinformation-detector"}
```

---

## Why This Is Urgent:

- Chrome extension is already working and connecting
- CORS is already fixed
- Only missing the /analyze endpoint implementation
- Server returns 503 because endpoint doesn't exist or crashes
- Need working endpoint for hackathon demo!

**Please provide complete, ready-to-run FastAPI code!**
