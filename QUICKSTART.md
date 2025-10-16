# Quick Start Guide - Misinformation Detector Extension

## ⚡ Get Started in 5 Minutes

### Step 1: Create Extension Icons (2 minutes)

Since the extension needs icons, here are quick options:

#### Option A: Use Online Tool (Easiest)
1. Go to https://favicon.io/emoji-favicons/
2. Search for "shield" emoji 🛡️
3. Click "Download" 
4. Extract and rename files:
   - `android-chrome-192x192.png` → `icon128.png`
   - `favicon-32x32.png` → Use an image resizer to create `icon48.png` and `icon16.png`
5. Place all icons in `extension/icons/` folder

#### Option B: Use Placeholder Script (Windows PowerShell)
Run this in the extension folder:

```powershell
# This creates simple colored placeholder files
# You'll need to replace them with real icons later
New-Item -ItemType Directory -Force -Path "icons"
$null > icons/icon16.png
$null > icons/icon48.png
$null > icons/icon128.png
```

Then manually create simple PNG files using Paint or any image editor.

### Step 2: Load Extension in Chrome (1 minute)

1. Open Chrome and go to: `chrome://extensions/`
2. Toggle "Developer mode" ON (top-right corner)
3. Click "Load unpacked"
4. Navigate to and select the `extension` folder
5. Done! You should see "Misinformation Detector" in your extensions

### Step 3: Test the Extension (2 minutes)

#### Test the UI:
1. Click the extension icon (puzzle piece in Chrome toolbar)
2. You should see the popup with settings
3. Try toggling "Auto-analyze pages"

#### Test on a Page:
1. Visit any news website (e.g., https://www.bbc.com/news)
2. Open any article
3. Click the extension icon
4. Click "Analyze This Page"
5. **Expected**: You'll see an error because the backend isn't running yet

## 🔧 Next Steps

### For Frontend Testing Only:

Edit `content.js` line ~155 to use mock data:

```javascript
// Replace the fetch call with mock data
async function analyzeContent(content, contentHash) {
  // ... existing code ...
  
  // Comment out the fetch and use this instead:
  const result = {
    classification: 'verified',
    confidence: 0.92,
    explanation: 'This is a mock analysis result for testing the UI.',
    highlighted_phrases: ['test phrase', 'example'],
    fact_check_sources: [
      {
        name: 'Test Fact Checker',
        url: 'https://example.com',
        verdict: 'True'
      }
    ]
  };
  
  displayResult(result);
  return { success: true, result };
}
```

Now reload the extension and test again - you should see the mock result overlay!

### For Full Functionality:

You need to set up the backend server. See: `/backend/README.md` (coming soon)

## 🐛 Common Issues

### Issue: Extension won't load
**Solution**: 
- Check all files are present
- Ensure manifest.json has no syntax errors
- Make sure icons folder and files exist (even if empty)

### Issue: "Analyze This Page" button is disabled
**Solution**: 
- The page might not have analyzable content
- Try on a news article or blog post
- Check browser console for errors (F12)

### Issue: Extension icon not showing
**Solution**: 
- Pin the extension: Click puzzle icon → Pin "Misinformation Detector"
- Or access via puzzle icon dropdown

## 📚 What You Built

You now have a working browser extension that:
- ✅ Loads successfully in Chrome
- ✅ Has a functional popup UI
- ✅ Can detect article content on pages
- ✅ Has settings management
- ✅ Shows beautiful result overlays
- ⏳ Needs backend server for real analysis

## 🎯 Next Phase: Backend Server

To make the extension fully functional, you'll need to:

1. **Set up Python environment**
2. **Install dependencies** (FastAPI, PyTorch, Transformers)
3. **Download or train AI models**
4. **Start the backend server**
5. **Connect extension to backend**

Follow `/backend/README.md` for backend setup (coming in Phase 2).

## 💡 Tips

- **Keyboard Shortcut**: Set a keyboard shortcut in chrome://extensions/shortcuts
- **Multiple Browsers**: Works in Edge, Brave, and other Chromium browsers
- **Development**: Use `Ctrl+R` on chrome://extensions/ to reload after changes
- **Debugging**: Right-click extension popup → Inspect to debug popup code

## 📖 Learn More

- Extension README: `extension/README.md`
- Project Overview: Root `README.md`
- Code Documentation: Check inline comments in source files

---

**Ready to build the backend?** See the main README roadmap for Phase 2 tasks!
