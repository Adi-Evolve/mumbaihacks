# 🚀 QUICK START: Suspicious Lines Feature

## ✅ Extension Side (DONE!)

Your extension is **ready to go**! Just reload it:

1. Go to `chrome://extensions/`
2. Click **Reload** on Misinformation Detector
3. Visit any NDTV article
4. Look for the "Show Suspicious Lines" button!

---

## ⚠️ Server Side (TODO!)

Your server needs to return this in the response:

```json
{
  "classification": "questionable",
  "confidence": 0.72,
  "explanation": "Article contains unverified claims...",
  "suspicious_sentences": [
    {
      "sentence": "NASA announced the moon landing was fake.",
      "reason": "Contradicts verified historical facts",
      "score": 0.95
    }
  ]
}
```

---

## 📋 3-Step Server Update

### Step 1: Add AI Prompt
Copy from: `AI_PROMPT_SUSPICIOUS_SENTENCES.md`

Quick version for GPT-4:
```python
system_prompt = """
You are a fact-checker. Return JSON with suspicious sentences.

Format:
{
  "classification": "verified|questionable|false",
  "confidence": 0.0-1.0,
  "explanation": "analysis",
  "suspicious_sentences": [
    {
      "sentence": "exact text from article",
      "reason": "why suspicious",
      "score": 0.0-1.0
    }
  ]
}
"""
```

### Step 2: Update Response
Make sure your `/api/v1/analyze` endpoint returns the new format.

### Step 3: Test
```bash
curl -X POST http://10.25.26.187:8002/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{"content": "NASA said moon landing was fake."}' \
  | python -m json.tool
```

Should see `suspicious_sentences` in output!

---

## 🎨 How It Looks

### Before clicking button:
```
┌────────────────────────────┐
│ ⚠ Questionable             │
│ 65% confident              │
│                            │
│ Article contains           │
│ unverified claims...       │
│                            │
│ ⚠️ Found 3 suspicious      │
│    sentences               │
│                            │
│ [🔍 Show Suspicious Lines] │
└────────────────────────────┘
```

### After clicking button:
```
Article text here...

NASA announced that the moon landing was fake.
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
🟥 Red highlight (98% confidence)
💬 Hover: "Contradicts verified facts"

More article text...

Multiple experts have confirmed this.
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
🟧 Orange highlight (75% confidence)
💬 Hover: "Vague appeal to authority"
```

---

## 🎯 Key Points

### Server Must Return:
- ✅ `suspicious_sentences` array (can be empty `[]`)
- ✅ Each sentence has `sentence`, `reason`, `score`
- ✅ `sentence` must be **EXACT text** from article

### Extension Will:
- ✅ Show button if suspicious sentences found
- ✅ Highlight sentences when button clicked
- ✅ Color-code: Red (90%+), Orange (60-89%), Yellow (<60%)
- ✅ Show tooltip on hover with reason

---

## 📚 Full Documentation

- 📄 **`SUSPICIOUS_LINES_FEATURE.md`** - Complete feature overview
- 📄 **`SERVER_SUSPICIOUS_SENTENCES_GUIDE.md`** - Detailed server implementation
- 📄 **`AI_PROMPT_SUSPICIOUS_SENTENCES.md`** - Copy-paste AI prompts

---

## 🧪 Testing Checklist

- [ ] Server returns `suspicious_sentences` in response
- [ ] Reload extension at chrome://extensions/
- [ ] Visit NDTV article
- [ ] See analysis overlay
- [ ] Button shows: "🔍 Show Suspicious Lines"
- [ ] Click button
- [ ] See highlights on page
- [ ] Hover over highlights to see reason
- [ ] Green notification appears
- [ ] Works! 🎉

---

## 🐛 Quick Troubleshooting

**No button showing?**
→ Server isn't returning `suspicious_sentences` array

**Button shows but no highlights?**
→ Sentence text doesn't match exactly - check console

**Wrong colors?**
→ Check `score` values (0.8+ = red, 0.6-0.79 = orange)

---

## 💡 Pro Tips

1. **Test server first** with curl before testing extension
2. **Use exact sentence text** from the article (copy-paste)
3. **Lower AI temperature** (0.2-0.4) for better JSON
4. **Check browser console** for debugging info
5. **Start simple** - test with 1-2 sentences first

---

## 🎉 You're All Set!

Extension is **ready** ✅  
Server needs **update** ⚠️  
Read the docs for details! 📚

Good luck! 🚀
