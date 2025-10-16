# 🤖 FOR YOUR FRIEND - SERVER UPDATE GUIDE

## Hey Friend! 👋 You need to update your server to support the new "Show Suspicious Lines" feature.

---

## 🎯 WHAT TO DO

Your `/api/v1/analyze` endpoint needs to return **suspicious sentences** in addition to the current response.

### ❌ OLD Response (what you have now):
```json
{
  "classification": "questionable",
  "confidence": 0.72,
  "explanation": "Article contains unverified claims"
}
```

### ✅ NEW Response (what you need to return):
```json
{
  "classification": "questionable",
  "confidence": 0.72,
  "explanation": "Article contains unverified claims",
  "suspicious_sentences": [
    {
      "sentence": "NASA announced that the moon landing was completely faked.",
      "reason": "Contradicts verified historical facts",
      "score": 0.95
    },
    {
      "sentence": "Multiple experts have confirmed this shocking discovery.",
      "reason": "Vague appeal to authority without specific sources",
      "score": 0.80
    }
  ]
}
```

**The NEW field is**: `suspicious_sentences` (array of objects)

---

## 🤖 COPY THIS AI PROMPT

### SYSTEM PROMPT (for your AI model):

```
You are an expert fact-checker analyzing news articles for misinformation.

You MUST return ONLY valid JSON in this EXACT format:
{
  "classification": "verified" | "questionable" | "false" | "misinformation",
  "confidence": 0.0 to 1.0,
  "explanation": "Brief 2-3 sentence overall analysis",
  "suspicious_sentences": [
    {
      "sentence": "EXACT sentence from the article - copy word-for-word with punctuation",
      "reason": "Clear explanation of why this sentence is suspicious",
      "score": 0.0 to 1.0
    }
  ]
}

WHAT TO DETECT (Red Flags):
❌ Unverified claims stated as facts
❌ Vague appeals to authority: "experts say", "studies show" (without specific sources)
❌ Sensational/emotional manipulation language
❌ Statistical claims without proper sources
❌ Conspiracy theories presented as news
❌ Missing context that changes the meaning
❌ "Many people believe/say" without evidence
❌ Absolute claims: "always", "never", "everyone", "nobody"
❌ Misleading cause-and-effect relationships

SUSPICION SCORE GUIDE:
- 0.90-1.0 = Almost certainly false (contradicts verified facts)
- 0.70-0.89 = Highly questionable (unverified, no credible sources)
- 0.50-0.69 = Suspicious (vague claims, needs fact-checking)
- 0.30-0.49 = Potentially misleading (missing important context)
- 0.00-0.29 = Minor concerns (mostly accurate)

CRITICAL RULE: The "sentence" field MUST contain the EXACT text from the article. Copy it word-for-word including all punctuation!

If no suspicious sentences are found, return empty array: "suspicious_sentences": []

Return ONLY the JSON object. No other text before or after.
```

### USER PROMPT (for each article):

```
Analyze this article for misinformation and identify suspicious sentences.

ARTICLE:
{insert_article_content_here}

INSTRUCTIONS:
1. Read the entire article carefully
2. Identify the overall credibility (classification)
3. Find specific sentences that are suspicious, misleading, or false
4. For EACH suspicious sentence you find:
   - Copy the EXACT text word-for-word from the article
   - Explain specifically why it's suspicious
   - Rate the suspicion level from 0.0 to 1.0
5. Extract key misleading phrases
6. Return ONLY valid JSON, no other text

IMPORTANT: The "sentence" field must match the article text EXACTLY. Copy-paste it!

Return your analysis now as JSON:
```

---

## 💻 CODE EXAMPLES

### If using **OpenAI (GPT-4 or GPT-3.5)**:

```python
import openai
import json

def analyze_article(article_content):
    system_prompt = """
    You are an expert fact-checker. Return valid JSON with suspicious sentences.
    
    Format:
    {
      "classification": "verified|questionable|false",
      "confidence": 0.0-1.0,
      "explanation": "brief analysis",
      "suspicious_sentences": [
        {
          "sentence": "exact text from article",
          "reason": "why suspicious",
          "score": 0.0-1.0
        }
      ]
    }
    
    Look for: unverified claims, vague sources, conspiracy theories, 
    misleading statistics, emotional manipulation.
    
    CRITICAL: Copy sentences EXACTLY from article word-for-word.
    Return ONLY valid JSON.
    """
    
    user_prompt = f"""
    Analyze this article for suspicious sentences:
    
    {article_content}
    
    Return JSON with suspicious sentences:
    """
    
    response = openai.ChatCompletion.create(
        model="gpt-4",  # or "gpt-3.5-turbo" if you don't have GPT-4
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.3,  # Lower = more consistent
        response_format={"type": "json_object"}  # Ensures JSON response
    )
    
    result_text = response.choices[0].message.content
    return json.loads(result_text)
```

### If using **Anthropic (Claude)**:

```python
import anthropic
import json

def analyze_article(article_content):
    client = anthropic.Anthropic(api_key="your-api-key")
    
    prompt = f"""
    You are a fact-checker. Analyze this article and return JSON.
    
    Article:
    {article_content}
    
    Return this exact format:
    {{
      "classification": "verified|questionable|false",
      "confidence": 0.65,
      "explanation": "brief analysis",
      "suspicious_sentences": [
        {{
          "sentence": "exact text from article",
          "reason": "why suspicious",
          "score": 0.85
        }}
      ]
    }}
    
    Detect: unverified claims, vague sources, conspiracy theories, misleading stats.
    Copy sentences EXACTLY from article.
    Return ONLY valid JSON.
    """
    
    message = client.messages.create(
        model="claude-3-opus-20240229",
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}]
    )
    
    result_text = message.content[0].text
    return json.loads(result_text)
```

### If using **Local Model (Llama, Mistral, etc.)**:

```python
import json

def analyze_article(article_content):
    prompt = f"""
    <s>[INST] You are a fact-checker. Analyze and return JSON.
    
    Article:
    {article_content}
    
    Format:
    {{
      "classification": "verified|questionable|false",
      "confidence": 0.7,
      "explanation": "brief analysis",
      "suspicious_sentences": [
        {{
          "sentence": "exact text from article",
          "reason": "why suspicious",
          "score": 0.8
        }}
      ]
    }}
    
    Return ONLY valid JSON. [/INST]
    """
    
    # Use your model's generate function
    response = your_model.generate(prompt, temperature=0.3)
    return json.loads(response)
```

---

## 📋 STEP-BY-STEP IMPLEMENTATION

### Step 1: Find your AI analysis function
Look in your server code for where you call the AI model.

### Step 2: Update the AI prompt
Replace your current prompt with the one above (System + User prompt).

### Step 3: Parse the response
Make sure you're parsing the `suspicious_sentences` field from the JSON.

### Step 4: Return it to the extension
Your `/api/v1/analyze` endpoint should return the complete JSON including `suspicious_sentences`.

### Step 5: Test with curl
```bash
curl -X POST http://localhost:8002/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{"content": "NASA announced the moon landing was faked. Experts confirm this."}'
```

**Expected output should include:**
```json
{
  "suspicious_sentences": [
    {
      "sentence": "NASA announced the moon landing was faked.",
      "reason": "Contradicts verified historical evidence",
      "score": 0.95
    }
  ]
}
```

### Step 6: Restart your server
```bash
# Stop server (Ctrl+C)
# Start again
python your_server_file.py
```

---

## ✅ CHECKLIST - Make sure your response has:

- [x] `classification` (string: "verified", "questionable", "false", or "misinformation")
- [x] `confidence` (number: 0.0 to 1.0)
- [x] `explanation` (string: brief analysis)
- [x] `suspicious_sentences` (array - can be empty `[]` if nothing suspicious)
- [x] Each object in `suspicious_sentences` has:
  - [x] `sentence` (EXACT text from article - word for word!)
  - [x] `reason` (why it's suspicious)
  - [x] `score` (0.0 to 1.0)
- [x] CORS is enabled (allow origin `*`)
- [x] Server is running on port **8002** (NOT 8000!)

---

## 🧪 QUICK TEST

Test your updated server with this command:

```bash
curl -X POST http://10.25.26.187:8002/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d "{\"content\": \"The Earth is flat and NASA has confirmed this. Scientists worldwide agree that gravity is a hoax. This has been proven by multiple studies.\"}" \
  | python -m json.tool
```

**You should see** `suspicious_sentences` with 3 sentences about flat earth, gravity hoax, and fake studies.

---

## 🎯 EXAMPLE FULL REQUEST/RESPONSE

### REQUEST:
```json
{
  "content": "NASA recently announced that the moon landing in 1969 was completely faked in a Hollywood studio. Multiple experts have confirmed this shocking discovery. According to recent studies, all space missions have been hoaxes."
}
```

### RESPONSE:
```json
{
  "classification": "false",
  "confidence": 0.95,
  "explanation": "This article contains multiple demonstrably false claims that contradict well-documented historical events and overwhelming scientific evidence.",
  "suspicious_sentences": [
    {
      "sentence": "NASA recently announced that the moon landing in 1969 was completely faked in a Hollywood studio.",
      "reason": "Completely false - NASA has never made such an announcement and extensive photographic, video, and physical evidence confirms the moon landing occurred",
      "score": 0.98
    },
    {
      "sentence": "Multiple experts have confirmed this shocking discovery.",
      "reason": "Vague appeal to unnamed experts without any specific attribution, names, or credible sources provided",
      "score": 0.85
    },
    {
      "sentence": "According to recent studies, all space missions have been hoaxes.",
      "reason": "References non-existent studies and makes absurd claims contradicting thousands of documented space missions with verifiable evidence",
      "score": 0.95
    }
  ],
  "highlighted_phrases": ["faked", "Hollywood studio", "experts", "studies", "hoaxes"]
}
```

---

## 🐛 TROUBLESHOOTING

### "JSON parsing error"
→ Make sure AI returns ONLY JSON, no extra text before or after  
→ Use `response_format={"type": "json_object"}` for OpenAI

### "Extension button not showing"
→ Check response includes `suspicious_sentences` field  
→ Even if empty, return: `"suspicious_sentences": []`

### "Highlights not appearing on page"
→ `sentence` field must be EXACT text from article  
→ Check for typos, extra spaces, missing punctuation  
→ Test with simple obvious example first

### "CORS errors"
→ Enable CORS middleware with `allow_origins=["*"]`  
→ For FastAPI: `app.add_middleware(CORSMiddleware, allow_origins=["*"])`  
→ For Flask: `CORS(app)`

### "Server not responding"
→ Verify server is running on correct IP (10.25.26.187)  
→ Confirm port is 8002 (not 8000!)  
→ Check firewall allows connections

---

## 💡 PRO TIPS

1. **Use lower temperature** (0.2-0.4) for more consistent JSON formatting
2. **Test with obvious examples** first (moon hoax, flat earth)
3. **Copy sentences exactly** - this is the MOST CRITICAL part!
4. **Start with 2-3 sentences** - don't try to detect everything
5. **Print server logs** to debug what AI is returning
6. **Test your endpoint** before telling your friend to test extension

---

## 📞 QUESTIONS?

Common questions:

**Q: What if article has no suspicious sentences?**  
A: Return empty array: `"suspicious_sentences": []`

**Q: How many sentences should I return?**  
A: Return all that are suspicious, but 3-5 is usually good

**Q: What if AI doesn't return exact text?**  
A: Update prompt to emphasize "EXACT text" more clearly

**Q: Can I test without AI?**  
A: Yes! Return hardcoded suspicious sentences for testing

---

## ✨ THAT'S IT!

Once you update your server:
1. ✅ Extension gets `suspicious_sentences` in response
2. ✅ Extension automatically shows "Show Suspicious Lines" button
3. ✅ User clicks button
4. ✅ Sentences are highlighted on the page
5. ✅ Feature complete! 🎉

**Let me know when server is updated and we can test together!** 🚀

---

## 📄 SAVE THIS FILE

Send this entire file to your friend or copy-paste the prompts into your AI model configuration.

Server IP: **10.25.26.187**  
Server Port: **8002**  
Endpoint: **/api/v1/analyze**

Good luck! 🎊
