# 🎯 Hackathon Setup Guide - Two Laptop Configuration

## Setup Overview
- **Your Laptop** = Frontend (Chrome Extension Demo)
- **Friend's Laptop** = Backend Server (API Server)

---

## 🔧 Part 1: Server Laptop Setup (Your Friend's Laptop)

### Step 1: Find Server IP Address

**On Windows:**
```powershell
ipconfig
```
Look for **IPv4 Address** under the active network connection (WiFi or Ethernet)
- Example: `192.168.1.100`

**On Mac/Linux:**
```bash
ifconfig | grep "inet "
```
or
```bash
hostname -I
```

### Step 2: Create the Backend Server

Create a file `server.py`:

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

app = FastAPI(title="Misinformation Detector API")

# IMPORTANT: Allow your laptop to access this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ContentRequest(BaseModel):
    url: str
    content: str
    title: str

class AnalysisResponse(BaseModel):
    credibilityScore: float
    riskLevel: str
    signals: list
    explanation: str

@app.get("/")
async def root():
    return {"status": "Server is running", "message": "Misinformation Detector API v1.0"}

@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_content(request: ContentRequest):
    """
    Analyze content for misinformation
    For demo: Returns simulated results
    """
    # Demo logic - replace with actual AI model
    content_length = len(request.content)
    title_length = len(request.title)
    
    # Simple heuristic for demo
    score = min(0.95, (content_length / 1000) * 0.7 + 0.3)
    
    if score > 0.7:
        risk = "low"
        signals = ["✓ Multiple credible sources cited", "✓ Fact-checked claims"]
    elif score > 0.4:
        risk = "medium"
        signals = ["⚠ Limited source verification", "⚠ Some unverified claims"]
    else:
        risk = "high"
        signals = ["✗ No credible sources", "✗ Sensational language detected"]
    
    return AnalysisResponse(
        credibilityScore=round(score, 2),
        riskLevel=risk,
        signals=signals,
        explanation=f"Analysis based on content structure and sources. Score: {score:.0%}"
    )

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    # Run on all network interfaces so other laptops can connect
    uvicorn.run(
        app, 
        host="0.0.0.0",  # IMPORTANT: Allows external connections
        port=8000,
        reload=False
    )
```

### Step 3: Install Dependencies on Server Laptop

```powershell
pip install fastapi uvicorn pydantic
```

### Step 4: Run the Server

```powershell
python server.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 5: Test Server Locally

Open browser on server laptop and go to:
```
http://localhost:8000
```

You should see: `{"status": "Server is running", ...}`

### Step 6: Allow Firewall Access (Windows)

**Important!** Allow Python through Windows Firewall:

1. Windows Security → Firewall & network protection → Allow an app through firewall
2. Click "Change settings" → "Allow another app"
3. Find Python or add `python.exe`
4. Check both "Private" and "Public" networks
5. Click "Add"

Or run this PowerShell command **as Administrator**:
```powershell
New-NetFirewallRule -DisplayName "Python Server" -Direction Inbound -Protocol TCP -LocalPort 8000 -Action Allow
```

---

## 💻 Part 2: Frontend Laptop Setup (Your Laptop)

### Step 1: Update Extension Configuration

Edit `extension/background.js` - Replace the API_URL:

```javascript
const API_URL = 'http://192.168.1.100:8000/api/analyze';  // Replace with friend's laptop IP
```

**Example:**
- If friend's IP is `192.168.43.25`, use: `http://192.168.43.25:8000/api/analyze`

### Step 2: Reload Extension

1. Go to `chrome://extensions/`
2. Click "Reload" button on your extension
3. Test on any webpage

---

## 🌐 Part 3: Network Connection

### Both Laptops MUST be on the SAME NETWORK

**Option A: Same WiFi Network** (Recommended)
- Both connect to the same WiFi (home, venue WiFi, etc.)
- Most reliable option

**Option B: Mobile Hotspot**
1. Enable hotspot on one phone
2. Connect both laptops to that hotspot
3. Find server laptop's IP in hotspot settings

**Option C: Direct Ethernet Connection**
- Connect laptops with Ethernet cable
- Set up static IPs
- More complex, not recommended

---

## ✅ Part 4: Testing the Connection

### From Your Laptop (Frontend):

**Test 1: Ping the Server**
```powershell
ping 192.168.1.100
```
Should get replies. If "Request timed out", check firewall.

**Test 2: Open Server in Browser**
Open Chrome and go to:
```
http://192.168.1.100:8000
```
Should see the server response.

**Test 3: Test Extension**
1. Visit any news website
2. Click extension icon
3. Click "Analyze This Page"
4. Check console (F12) for API calls

---

## 🎪 Part 5: Hackathon Demo Flow

### Before the Demo:

1. **30 minutes before:**
   - Both laptops connected to WiFi
   - Find server IP: `ipconfig`
   - Update `background.js` with correct IP
   - Start server: `python server.py`
   - Test connection from your laptop

2. **Test websites ready:**
   - BBC News (credible)
   - Known fake news site (for contrast)

### During Demo:

1. **Show the extension:**
   - Open Chrome, go to news site
   - Click extension icon
   - Show auto-analysis or manual analysis

2. **Show the backend:**
   - Switch to server laptop
   - Show server logs (real-time API calls)
   - Show the FastAPI docs at `http://localhost:8000/docs`

3. **Explain the flow:**
   - Extension extracts content
   - Sends to backend API
   - AI analyzes (show server processing)
   - Results displayed in extension

---

## 🚨 Troubleshooting

### Issue 1: "ERR_CONNECTION_REFUSED"
- ✓ Server running? Check terminal
- ✓ Correct IP address in background.js?
- ✓ Firewall allowing port 8000?

### Issue 2: "CORS Error"
- ✓ Check CORS middleware in server.py
- ✓ `allow_origins=["*"]` should be there

### Issue 3: No Response
- ✓ Both on same network?
- ✓ Try pinging server IP
- ✓ Server shows incoming requests in logs?

### Issue 4: Server Stops
- ✓ Keep terminal window open
- ✓ Don't close laptop lid (prevents sleep)
- ✓ Disable laptop sleep in Power Settings

---

## 📝 Quick Reference Card

### Server Laptop Commands:
```powershell
# Find IP
ipconfig

# Run server
python server.py

# Keep window open!
```

### Frontend Laptop:
```javascript
// Update this in extension/background.js
const API_URL = 'http://[SERVER_IP]:8000/api/analyze';
```

### Server IP Format:
- ✓ `http://192.168.1.100:8000/api/analyze`
- ✓ `http://192.168.43.25:8000/api/analyze`
- ✗ `localhost` (won't work from other laptop)
- ✗ `127.0.0.1` (won't work from other laptop)

---

## 🎯 15-Minute Quick Setup (At Venue)

1. **Minute 1-2:** Both laptops connect to same WiFi
2. **Minute 3-4:** Server laptop: `ipconfig` → note IP
3. **Minute 5-7:** Server laptop: `pip install fastapi uvicorn` (if needed)
4. **Minute 8:** Server laptop: `python server.py`
5. **Minute 9-10:** Frontend laptop: Update `background.js` with IP
6. **Minute 11-12:** Frontend laptop: Reload extension at `chrome://extensions/`
7. **Minute 13:** Test: Open `http://[SERVER_IP]:8000` in browser
8. **Minute 14-15:** Test extension on news website

**Done!** Ready to demo. 🚀

---

## 💡 Pro Tips for Hackathon

1. **Have backup plan:** If network fails, run everything on one laptop using `localhost`
2. **Print this guide:** Network might be slow, have paper backup
3. **Pre-test everything:** Do a full dry run night before
4. **Battery management:** Both laptops fully charged, bring chargers
5. **Screenshot working demo:** If live demo fails, show screenshots
6. **Mobile hotspot backup:** Bring phone with hotspot capability

---

## 📞 Emergency Localhost Fallback

If network completely fails, run server on your laptop:

```javascript
// In background.js - change to:
const API_URL = 'http://localhost:8000/api/analyze';
```

Run server on your laptop and demo from same machine.

---

Good luck with your hackathon! 🏆
