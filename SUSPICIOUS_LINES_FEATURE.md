# ✨ New Feature Added: Show Suspicious Lines

## 🎉 What's New?

Your extension can now **highlight suspicious sentences** directly on news pages!

---

## 🎨 How It Works

### 1. Auto-Analysis
When you visit a news page:
- Extension automatically analyzes the article
- Server identifies suspicious sentences
- Results appear in an overlay

### 2. Show Suspicious Lines Button
If suspicious sentences are found:
- Overlay shows: **"⚠️ Found X suspicious sentences"**
- New button appears: **"🔍 Show Suspicious Lines"**

### 3. Highlighting
Click the button and:
- ✨ Suspicious sentences are highlighted on the page
- 🎨 Color-coded by suspicion level:
  - **Red**: High suspicion (90%+ confidence it's false)
  - **Orange**: Medium suspicion (60-89% questionable)
  - **Yellow**: Low suspicion (needs verification)
- 💡 Hover over highlights to see **why** it's suspicious

### 4. Visual Feedback
- Green notification appears: **"✓ Highlighted X suspicious sentences on page"**
- Click **"✕ Remove"** to clear highlights
- Auto-disappears after 10 seconds

---

## 📸 Visual Examples

### Overlay with Button:
```
┌─────────────────────────────────┐
│ ⚠ Questionable     65% confident│
│                                 │
│ This article contains several   │
│ unverified claims...            │
│                                 │
│ ⚠️ Found 3 suspicious sentences │
│                                 │
│ [🔍 Show Suspicious Lines]      │
│ [View Details] [Report Issue]   │
└─────────────────────────────────┘
```

### Highlighted on Page:
```
NASA announced that the moon landing was faked.
     ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
     🟡 Hover: "Contradicts verified facts (98%)"
```

---

## 🛠️ What You Need to Do

### Extension Side (✅ DONE!)
- ✅ Updated `content.js` with highlighting logic
- ✅ Added "Show Suspicious Lines" button
- ✅ Added CSS styles for highlights
- ✅ Added notification when highlights appear
- ✅ Color-coded highlighting by suspicion score

### Server Side (⚠️ TODO!)
Your server needs to return `suspicious_sentences` in the API response.

**Read this file for complete guide:**
📄 `SERVER_SUSPICIOUS_SENTENCES_GUIDE.md`

**Quick version:**
```python
# Your server should return this:
{
  "classification": "questionable",
  "confidence": 0.65,
  "explanation": "Brief analysis...",
  "suspicious_sentences": [
    {
      "sentence": "Exact text from article",
      "reason": "Why it's suspicious",
      "score": 0.85
    }
  ]
}
```

---

## 🧪 Testing Steps

### Step 1: Update Server
1. Open your server code
2. Add `suspicious_sentences` to the response
3. Use the AI prompt from `SERVER_SUSPICIOUS_SENTENCES_GUIDE.md`
4. Restart server

### Step 2: Test Server
```bash
curl -X POST http://10.25.26.187:8002/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{"content": "NASA said moon landing was fake."}'
```

Should return suspicious_sentences in response.

### Step 3: Reload Extension
1. Go to `chrome://extensions/`
2. Click **Reload** on your extension

### Step 4: Test on Real Page
1. Visit any NDTV article
2. Wait for analysis overlay
3. Look for "⚠️ Found X suspicious sentences"
4. Click "🔍 Show Suspicious Lines"
5. See highlights on page!

---

## 🎯 Example Server Response

```json
{
  "classification": "questionable",
  "confidence": 0.72,
  "explanation": "Article contains unverified claims and vague sources",
  "suspicious_sentences": [
    {
      "sentence": "Multiple experts have confirmed this shocking discovery.",
      "reason": "Vague appeal to authority without specific sources",
      "score": 0.75
    },
    {
      "sentence": "This has been proven by recent studies.",
      "reason": "References non-existent or unspecified studies",
      "score": 0.80
    }
  ],
  "highlighted_phrases": ["experts", "studies"],
  "fact_check_sources": []
}
```

---

## 🎨 Color Guide

| Suspicion Score | Color | Border | Meaning |
|----------------|-------|--------|---------|
| 0.80 - 1.00 | Red (#fee2e2) | Dark Red | Almost certainly false |
| 0.60 - 0.79 | Orange (#fed7aa) | Orange | Highly questionable |
| 0.00 - 0.59 | Yellow (#fef3c7) | Yellow | Needs verification |

---

## 📝 Files Changed

### Extension Files:
- ✅ `content.js` - Added highlighting logic (150+ lines)
- ✅ `styles.css` - Added highlight styles
- ✅ Button appears automatically if suspicious sentences exist

### New Functions Added:
- `highlightSuspiciousLines(sentences)` - Highlights text on page
- `removeHighlights()` - Clears all highlights
- `showHighlightNotification(count)` - Shows success notification

---

## 🚀 Next Steps

1. **Read the server guide**: `SERVER_SUSPICIOUS_SENTENCES_GUIDE.md`
2. **Update your AI prompt** to detect suspicious sentences
3. **Update server response** to include suspicious_sentences array
4. **Test with curl** to verify response format
5. **Reload extension** and test on real article
6. **Enjoy!** 🎉

---

## 💡 Tips

### For Better Detection:
- Make sure server returns the **exact sentence text** as it appears in the article
- Include a good `reason` to help users understand why it's suspicious
- Use appropriate `score` values (0.0 to 1.0) for color-coding

### For Better Highlights:
- Extension handles different text formatting automatically
- Highlights scroll into view when button clicked
- Tooltips show on hover (reason + confidence %)

### For Debugging:
- Check browser console for: `🔍 Highlighting suspicious lines:`
- Look for: `✓ Found match in paragraph:`
- Server should log suspicious sentences being sent

---

## 🐛 Common Issues

**Button not showing?**
- Server must return `suspicious_sentences` array
- Array must have at least 1 sentence
- Check browser console for response

**Highlights not appearing?**
- Sentence text must match exactly
- Check console for "Could not find suspicious sentences"
- Verify page hasn't changed since analysis

**Wrong colors?**
- Check `score` value in server response
- 0.8+ = red, 0.6-0.79 = orange, <0.6 = yellow

---

## ✅ Feature Complete!

Extension side is **100% ready** ✅  
Server side needs **suspicious_sentences** in response ⚠️

Read `SERVER_SUSPICIOUS_SENTENCES_GUIDE.md` for full implementation details!
