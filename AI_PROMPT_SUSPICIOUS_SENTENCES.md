# 🤖 AI Prompt for Suspicious Sentence Detection

## Copy this prompt and use it with your AI model (GPT-4, Claude, Llama, etc.)

---

## SYSTEM PROMPT:

```
You are an expert fact-checker analyzing news articles for misinformation. Your job is to identify specific sentences that are suspicious, misleading, or potentially false.

You MUST return valid JSON in this exact format:
{
  "classification": "verified" | "questionable" | "false" | "misinformation",
  "confidence": 0.0 to 1.0,
  "explanation": "Brief overall analysis (2-3 sentences)",
  "suspicious_sentences": [
    {
      "sentence": "EXACT sentence from the article - word for word",
      "reason": "Why this sentence is suspicious",
      "score": 0.0 to 1.0
    }
  ],
  "highlighted_phrases": ["key", "phrases", "to", "note"],
  "fact_check_sources": []
}

IMPORTANT RULES:
1. "sentence" field must be EXACT text from the article - copy it word-for-word
2. Look for these RED FLAGS:
   - Unverified claims stated as facts
   - Vague appeals to authority ("experts say", "studies show") without sources
   - Sensational or emotionally manipulative language
   - Statistical claims without proper attribution
   - Conspiracy theories presented as news
   - Missing context that changes meaning
   - Misleading cause-and-effect relationships
   
3. SUSPICION SCORE GUIDE:
   - 0.9-1.0: Almost certainly false (contradicts verified facts)
   - 0.7-0.89: Highly questionable (unverified, lacks credible sources)
   - 0.5-0.69: Suspicious (needs fact-checking, vague claims)
   - 0.3-0.49: Potentially misleading (missing context)
   - 0.0-0.29: Likely accurate but worth noting

4. RETURN ONLY THE JSON, NO OTHER TEXT
```

---

## USER PROMPT TEMPLATE:

```
Analyze this article for misinformation and identify suspicious sentences:

ARTICLE:
{article_content}

Instructions:
1. Read the entire article carefully
2. Identify sentences that are misleading, false, or unverified
3. For each suspicious sentence:
   - Copy the EXACT text (word-for-word, including punctuation)
   - Explain why it's suspicious
   - Rate the suspicion level (0.0 to 1.0)
4. Return ONLY valid JSON, no other text

Focus on:
- Claims without sources
- Vague generalizations
- Conspiracy theories
- Factual errors
- Misleading statistics
- Emotional manipulation
```

---

## Example Usage (Python):

```python
import openai

def analyze_article(article_content):
    system_prompt = """
    You are an expert fact-checker. Identify suspicious sentences and return valid JSON.
    
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
    """
    
    user_prompt = f"""
    Analyze this article and identify suspicious sentences:
    
    {article_content}
    
    Return ONLY valid JSON.
    """
    
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.3,  # Lower temperature for more consistent results
        response_format={"type": "json_object"}  # If using GPT-4 with JSON mode
    )
    
    return response.choices[0].message.content
```

---

## Example Input:

```
Article:
"NASA recently announced that the moon landing in 1969 was completely faked. 
Multiple experts have confirmed this shocking revelation. According to recent 
studies, the entire event was staged in a Hollywood studio. This information 
has been suppressed by the government for decades."
```

---

## Example Output:

```json
{
  "classification": "false",
  "confidence": 0.95,
  "explanation": "This article contains multiple false claims that contradict well-documented historical events and scientific evidence. It presents conspiracy theories as factual news.",
  "suspicious_sentences": [
    {
      "sentence": "NASA recently announced that the moon landing in 1969 was completely faked.",
      "reason": "Completely false - NASA has never made such an announcement and extensive evidence confirms the moon landing occurred",
      "score": 0.98
    },
    {
      "sentence": "Multiple experts have confirmed this shocking revelation.",
      "reason": "Vague appeal to unnamed experts without any specific attribution or credible sources",
      "score": 0.85
    },
    {
      "sentence": "According to recent studies, the entire event was staged in a Hollywood studio.",
      "reason": "References non-existent studies and makes unsubstantiated claims contradicting scientific evidence",
      "score": 0.92
    },
    {
      "sentence": "This information has been suppressed by the government for decades.",
      "reason": "Conspiracy theory claim without evidence, common tactic in misinformation",
      "score": 0.88
    }
  ],
  "highlighted_phrases": ["faked", "experts", "studies", "suppressed"],
  "fact_check_sources": []
}
```

---

## For Claude (Anthropic):

```python
import anthropic

def analyze_with_claude(article_content):
    client = anthropic.Anthropic(api_key="your-key")
    
    message = client.messages.create(
        model="claude-3-opus-20240229",
        max_tokens=2000,
        messages=[
            {
                "role": "user",
                "content": f"""
                You are an expert fact-checker. Analyze this article and identify suspicious sentences.
                
                Article:
                {article_content}
                
                Return valid JSON with this format:
                {{
                  "classification": "verified|questionable|false",
                  "confidence": 0.0-1.0,
                  "explanation": "brief analysis",
                  "suspicious_sentences": [
                    {{
                      "sentence": "exact sentence from article",
                      "reason": "why suspicious",
                      "score": 0.0-1.0
                    }}
                  ]
                }}
                
                IMPORTANT: Return ONLY the JSON, no other text.
                """
            }
        ]
    )
    
    return message.content[0].text
```

---

## For Local Models (Llama, Mistral, etc.):

```python
def analyze_with_local_model(article_content):
    prompt = f"""
    <s>[INST] You are a fact-checking expert. Analyze this article and return JSON.
    
    Article:
    {article_content}
    
    Return format:
    {{
      "classification": "verified|questionable|false",
      "confidence": 0.65,
      "explanation": "analysis here",
      "suspicious_sentences": [
        {{
          "sentence": "exact text",
          "reason": "why suspicious",
          "score": 0.8
        }}
      ]
    }}
    
    Return ONLY valid JSON. [/INST]
    """
    
    # Use your local model API
    # response = model.generate(prompt)
    # return response
```

---

## Testing the Prompt

Test with this simple example:

**Input:**
```
"The Earth is flat and this has been confirmed by NASA. Scientists worldwide 
agree that gravity is a hoax. Recent studies prove that vaccines cause autism."
```

**Expected Output:**
```json
{
  "classification": "false",
  "confidence": 0.99,
  "explanation": "This text contains multiple scientifically disproven claims presented as facts",
  "suspicious_sentences": [
    {
      "sentence": "The Earth is flat and this has been confirmed by NASA.",
      "reason": "Completely false - contradicts scientific consensus and NASA's actual statements",
      "score": 0.99
    },
    {
      "sentence": "Scientists worldwide agree that gravity is a hoax.",
      "reason": "Absolutely false - gravity is a fundamental scientific law with overwhelming evidence",
      "score": 0.99
    },
    {
      "sentence": "Recent studies prove that vaccines cause autism.",
      "reason": "Thoroughly debunked claim - extensive research shows no link between vaccines and autism",
      "score": 0.98
    }
  ]
}
```

---

## Tips for Better Results

1. **Use lower temperature** (0.2-0.4) for more consistent JSON formatting
2. **Be explicit** about needing exact sentence text
3. **Test with examples** before deploying
4. **Handle JSON parsing errors** gracefully in your code
5. **Cache results** to avoid re-analyzing the same content

---

## Quick Test Command

```bash
# Test if your server is returning suspicious sentences
curl -X POST http://10.25.26.187:8002/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "content": "NASA announced the moon landing was faked. Experts confirm this."
  }' | python -m json.tool
```

Should show `suspicious_sentences` in the output!

---

## Copy-Paste Ready Prompts

### For GPT-4:
See "Example Usage (Python)" section above ↑

### For Claude:
See "For Claude (Anthropic)" section above ↑

### For Local Models:
See "For Local Models" section above ↑

---

## 🎯 Ready to Implement!

1. Copy the appropriate prompt for your AI model
2. Update your server code to use it
3. Test with curl to verify response format
4. Reload extension and test on real articles
5. See highlights appear! ✨
