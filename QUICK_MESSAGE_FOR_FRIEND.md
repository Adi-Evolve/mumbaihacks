# 📨 SEND THIS TO YOUR FRIEND

Hey! I need you to update the server to add one new field to the response.

---

## 🎯 WHAT TO ADD

Your `/api/v1/analyze` endpoint currently returns:
```json
{
  "classification": "questionable",
  "confidence": 0.72,
  "explanation": "..."
}
```

**Add this field:**
```json
{
  "classification": "questionable",
  "confidence": 0.72,
  "explanation": "...",
  "suspicious_sentences": [
    {
      "sentence": "Exact sentence from article",
      "reason": "Why it's suspicious",
      "score": 0.85
    }
  ]
}
```

---

## 🤖 UPDATE YOUR AI PROMPT

Add this to your system prompt:

```
Also identify suspicious sentences and include them in response.

For each suspicious sentence, return:
{
  "sentence": "EXACT text from article - word for word",
  "reason": "Why it's suspicious",
  "score": 0.0 to 1.0 (how suspicious)
}

Look for:
- Unverified claims
- Vague sources ("experts say" without names)
- Conspiracy theories
- Misleading statistics
- Emotional manipulation

Return in JSON field: "suspicious_sentences": [...]

If no suspicious sentences, return: "suspicious_sentences": []
```

---

## 🧪 TEST IT

```bash
curl -X POST http://localhost:8002/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{"content": "NASA said moon landing was fake. Experts confirm this."}'
```

Should return `suspicious_sentences` with the fake claim!

---

## ✅ CHECKLIST

- [ ] Response includes `suspicious_sentences` array
- [ ] Each sentence has `sentence`, `reason`, `score`
- [ ] `sentence` is EXACT text from article
- [ ] CORS still enabled
- [ ] Server on port 8002
- [ ] Tested with curl

---

That's it! Let me know when done and I'll test from my side! 🚀

Full details in: `FOR_FRIEND_SERVER_UPDATE.md`
