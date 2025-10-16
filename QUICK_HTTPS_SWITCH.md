# Quick HTTPS Switch

## When Your Friend Has HTTPS Ready

Just uncomment the HTTPS lines and comment out the HTTP lines:

### File 1: extension/content.js (Line 7-8)

```javascript
// Configuration
const CONFIG = {
  // API_ENDPOINT: 'http://10.25.26.187:8000/api/v1/analyze', // HTTP (blocked by Chrome)
  API_ENDPOINT: 'https://10.25.26.187:8000/api/v1/analyze', // HTTPS (uncomment this)
  MIN_TEXT_LENGTH: 100,
```

### File 2: extension/background.js (Line 21-23)

```javascript
const CONFIG = {
  // API_BASE_URL: 'http://10.25.26.187:8000/api/v1', // HTTP (blocked)
  API_BASE_URL: 'https://10.25.26.187:8000/api/v1', // HTTPS (uncomment this)
  RETRY_ATTEMPTS: 3,
```

Then:
1. Save both files
2. Reload extension (chrome://extensions/)
3. Test on NDTV article
4. Should work! ✅

---

## For Now (Testing Without Server)

Current setup will show:
- ✅ Content extracted (10 paragraphs, 2912 chars)
- ❌ Mixed content error (can't connect to HTTP server from HTTPS page)

This is normal! Once friend sets up HTTPS, it will work.
