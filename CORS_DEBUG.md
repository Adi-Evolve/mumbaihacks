# 🔧 CORS Still Not Working - Troubleshooting

## The Problem

Console shows:
```
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present
```

**This means**: CORS middleware was added BUT not configured correctly or server wasn't restarted.

---

## ✅ Complete CORS Fix Checklist

### For Flask Server:

**Step 1: Install**
```bash
pip install flask-cors
```

**Step 2: Add to server code** (IMPORTANT: Must be AFTER creating app!)

```python
from flask import Flask, jsonify, request
from flask_cors import CORS  # Import at top

app = Flask(__name__)

# ADD CORS IMMEDIATELY AFTER CREATING APP
CORS(app, resources={
    r"/api/*": {
        "origins": "*",  # Allow all origins
        "methods": ["GET", "POST", "OPTIONS"],  # Include OPTIONS!
        "allow_headers": ["Content-Type"]
    }
})

# Now your routes...
@app.route('/api/v1/analyze', methods=['POST', 'OPTIONS'])  # Add OPTIONS!
def analyze():
    if request.method == 'OPTIONS':
        # Handle preflight
        return '', 204
    
    # Your analysis code here
    data = request.json
    # ... process data ...
    return jsonify({
        "classification": "verified",
        "confidence": 0.85
    })

@app.route('/api/v1/health', methods=['GET', 'OPTIONS'])  # Add this endpoint!
def health():
    if request.method == 'OPTIONS':
        return '', 204
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
```

**Step 3: RESTART SERVER** (CRITICAL!)
```bash
# Stop the old server (Ctrl+C)
# Start it again
python app.py
```

---

### For FastAPI Server:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# ADD CORS MIDDLEWARE FIRST (before any routes!)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

class AnalyzeRequest(BaseModel):
    text: str
    url: str
    title: str = None
    pageType: str = None
    language: str = "en"

@app.post("/api/v1/analyze")
async def analyze(req: AnalyzeRequest):
    return {
        "classification": "verified",
        "confidence": 0.85,
        "misinformation_score": 15
    }

@app.get("/api/v1/health")  # Add health endpoint!
async def health():
    return {"status": "ok"}

# Run with: uvicorn main:app --host 0.0.0.0 --port 8000
```

**Restart:**
```bash
# Ctrl+C to stop
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 🧪 Test if CORS is Actually Fixed

### Test 1: Browser Console Test

On the NDTV page, open console and run:

```javascript
fetch('http://10.25.26.187:8000/api/v1/health', {
  method: 'OPTIONS'  // Test preflight
}).then(r => {
  console.log('✅ PREFLIGHT OK!', r.status);
  return fetch('http://10.25.26.187:8000/api/v1/health');
}).then(r => r.json())
  .then(d => console.log('✅ CORS FIXED!', d))
  .catch(e => console.error('❌ Still blocked:', e.message));
```

**Expected Result:**
```
✅ PREFLIGHT OK! 204
✅ CORS FIXED! {status: "ok"}
```

### Test 2: Check Response Headers

Friend should see in server logs when request comes in:
```
OPTIONS /api/v1/analyze HTTP/1.1
```

And server should respond with these headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

---

## 🔍 Common Mistakes

### ❌ Mistake 1: CORS added but server not restarted
**Fix**: Ctrl+C and restart server

### ❌ Mistake 2: CORS added after routes defined
```python
# WRONG ORDER:
@app.route('/api/v1/analyze')
def analyze():
    pass

CORS(app)  # Too late!
```

```python
# CORRECT ORDER:
app = Flask(__name__)
CORS(app)  # First!

@app.route('/api/v1/analyze')  # Then routes
def analyze():
    pass
```

### ❌ Mistake 3: OPTIONS method not handled
```python
# Add OPTIONS to all API routes:
@app.route('/api/v1/analyze', methods=['POST', 'OPTIONS'])  # Add OPTIONS!
def analyze():
    if request.method == 'OPTIONS':
        return '', 204  # Handle preflight
    # ... rest of code
```

### ❌ Mistake 4: Wrong CORS package
```bash
# Make sure it's flask-cors, not just cors
pip uninstall cors  # Remove if installed
pip install flask-cors  # Install correct one
```

### ❌ Mistake 5: /health endpoint missing
```python
# Add this endpoint:
@app.route('/api/v1/health', methods=['GET', 'OPTIONS'])
def health():
    if request.method == 'OPTIONS':
        return '', 204
    return jsonify({"status": "ok"})
```

---

## 📋 Complete Flask Example (Copy-Paste Ready)

```python
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)

# Enable CORS for all routes
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

@app.route('/api/v1/health', methods=['GET', 'OPTIONS'])
def health():
    """Health check endpoint"""
    if request.method == 'OPTIONS':
        return '', 204
    return jsonify({"status": "ok", "version": "1.0"})

@app.route('/api/v1/analyze', methods=['POST', 'OPTIONS'])
def analyze():
    """Analyze content for misinformation"""
    if request.method == 'OPTIONS':
        return '', 204
    
    data = request.json
    print(f"Received request: {len(data.get('text', ''))} characters")
    
    # Your ML model analysis here
    # For now, return dummy data:
    return jsonify({
        "classification": "verified",
        "confidence": 0.85,
        "misinformation_score": 15,
        "explanation": "Content appears factual based on analysis",
        "highlighted_phrases": [],
        "fact_check_sources": []
    })

if __name__ == '__main__':
    print("🚀 Server starting on http://0.0.0.0:8000")
    print("📡 CORS enabled for all origins")
    app.run(host='0.0.0.0', port=8000, debug=True)
```

**Save as `app.py`, then run:**
```bash
python app.py
```

---

## 🎯 After Friend Restarts Server

**You should see:**

1. **In browser console:**
```
✅ Step 3: Server response received!
   ⏱️ Response time: 234 ms
   📊 Status: 200 OK

✅ Step 5: Analysis complete!
   📊 Analysis Result: {
      classification: 'verified',
      confidence: 0.85,
      misinformationScore: 15
   }

✅ ========== ANALYSIS COMPLETED SUCCESSFULLY ==========
```

2. **In friend's server console:**
```
OPTIONS /api/v1/health HTTP/1.1 204
GET /api/v1/health HTTP/1.1 200
OPTIONS /api/v1/analyze HTTP/1.1 204
POST /api/v1/analyze HTTP/1.1 200
Received request: 3011 characters
```

---

## 🚨 If Still Not Working

**Alternative: Disable CORS in Chrome (Temporary!)**

1. Close ALL Chrome windows
2. Open Command Prompt
3. Run:
```cmd
"C:\Program Files\Google\Chrome\Application\chrome.exe" --disable-web-security --user-data-dir="C:\temp\chrome_dev"
```

4. Chrome opens with security disabled
5. Extension will work
6. ⚠️ **Close this Chrome when done! It's insecure!**

---

## Need Help?

Ask friend to:
1. Show the EXACT server code (first 30 lines)
2. Show server startup logs
3. Show what happens when request comes in

Then we can debug the specific issue!
