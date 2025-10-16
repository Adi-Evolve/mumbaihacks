# HTTPS Server Setup for Friend's Laptop

## Problem
Chrome blocks HTTP requests from HTTPS pages (Mixed Content Policy).

## Solution: Run Server with HTTPS

### Step 1: Generate SSL Certificate (Friend's Laptop)

**Option A: Self-Signed Certificate (Quick)**

Open terminal/command prompt:

```bash
# Generate self-signed certificate (valid for 365 days)
openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365
```

When prompted:
- Country: IN
- State: Maharashtra  
- City: Mumbai
- Organization: Hackathon
- Common Name: **10.25.26.187** (important!)
- Email: (press Enter to skip)

This creates 2 files: `cert.pem` and `key.pem`

---

### Step 2: Update Server Code (Friend's Laptop)

**If using Flask:**
```python
from flask import Flask
app = Flask(__name__)

# ... your routes here ...

if __name__ == '__main__':
    # Add SSL context
    app.run(
        host='0.0.0.0', 
        port=8000,
        ssl_context=('cert.pem', 'key.pem')  # Add this line!
    )
```

**If using FastAPI:**
```python
import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        ssl_keyfile="key.pem",      # Add this
        ssl_certfile="cert.pem"     # Add this
    )
```

---

### Step 3: Update Extension URLs (Your Laptop)

**File: `extension/content.js` (Line 8)**
```javascript
API_ENDPOINT: 'https://10.25.26.187:8000/api/v1/analyze'  // Change http to https
```

**File: `extension/background.js` (Line 22)**
```javascript
API_BASE_URL: 'https://10.25.26.187:8000/api/v1'  // Change http to https
```

---

### Step 4: Accept Self-Signed Certificate (Your Laptop)

Since it's self-signed, Chrome will warn you. One-time setup:

1. Open in browser: `https://10.25.26.187:8000/api/v1/health`
2. Chrome shows: "Your connection is not private"
3. Click **"Advanced"**
4. Click **"Proceed to 10.25.26.187 (unsafe)"**
5. Now the extension can connect!

---

## Quick Commands Summary

### Friend's Laptop:
```bash
# 1. Generate certificate
openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365

# 2. Start server with HTTPS
python app.py  # (after updating code above)
```

### Your Laptop:
```bash
# 1. Update extension files (see Step 3 above)
# 2. Reload extension in Chrome
# 3. Accept certificate (see Step 4 above)
```

---

## Alternative: Use Chrome Flags (Development Only)

**Temporary fix for testing:**

1. Go to: `chrome://flags/`
2. Search: **"insecure"**
3. Find: **"Block insecure private network requests"**
4. Set to: **"Disabled"**
5. Click **"Relaunch"**

⚠️ This disables security for ALL sites! Only use during development.

---

## Which Option to Use?

| Option | Speed | Security | Recommended |
|--------|-------|----------|-------------|
| Allow insecure content | ⚡ 1 minute | ❌ Low | Hackathon demo only |
| Self-signed HTTPS | ⚡⚡ 5 minutes | ⚠️ Medium | **Best for hackathon** |
| Chrome flags | ⚡ 2 minutes | ❌ Very low | Testing only |

**Recommendation:** Use self-signed HTTPS (Option 2) - takes 5 minutes but works reliably!
