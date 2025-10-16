# 🚀 URGENT SERVER UPDATE - NEWSAPI KEY + INDIAN SOURCES

## ✅ UPDATES MADE TO COMPLETE_SERVER_IMPLEMENTATION_PROMPT.md

### 1. **Your NewsAPI Key Added** ✅
```python
newsapi = NewsApiClient(api_key='f7737e24c97c46c9ac85618469bdb25b')
```
**Location:** Line 216 in the server prompt

### 2. **Indian Authentic News Sources Added** ✅
Now checking these credible Indian sources:
- ✅ **Lallantop** (lallantop.com)
- ✅ **The Wire** (thewire.in)  
- ✅ **TNT World** (tntworld.in)
- ✅ **Scroll.in**
- ✅ **The Quint**
- ✅ **Times of India**
- ✅ **The Hindu**
- ✅ **NDTV**
- ✅ **Hindustan Times**

---

## 🔧 WHAT YOUR FRIEND NEEDS TO UPDATE

Since your friend already ran the server code, they need to make these 2 quick changes:

### **Change 1: Update NewsAPI Key**

**Find this line (around line 216):**
```python
newsapi = NewsApiClient(api_key='YOUR_NEWSAPI_KEY')
```

**Replace with:**
```python
newsapi = NewsApiClient(api_key='f7737e24c97c46c9ac85618469bdb25b')  # ✅ YOUR KEY!
```

---

### **Change 2: Update Credible Sources List**

**Find this section (around line 381-395):**
```python
credible = ['reuters', 'bbc-news', 'associated-press', 'the-guardian', 'cnn', 'npr']

credible_matches = []
for article in articles.get('articles', []):
    source_id = article['source'].get('id', '')
    if source_id in credible:
        credible_matches.append({
            "name": article['source']['name'],
            "url": article['url'],
            "published": article['publishedAt']
        })
```

**Replace ENTIRE section with:**
```python
# Credible sources - International + Indian Authentic Sources
credible = [
    # International credible sources
    'reuters', 'bbc-news', 'associated-press', 'the-guardian', 'cnn', 'npr',
    
    # Indian authentic news sources (ADDED FOR INDIAN NEWS COVERAGE)
    'the-times-of-india', 'the-hindu', 'hindustan-times', 'ndtv'
]

# Also check domain names for sources not in NewsAPI's database
credible_domains = [
    'lallantop.com',      # Lallantop - Authentic Indian news
    'thewire.in',         # The Wire - Independent Indian journalism  
    'tntworld.in',        # TNT World - Trusted news source
    'scroll.in',          # Scroll.in - Quality journalism
    'thequint.com',       # The Quint - Video news platform
    'reuters.com',
    'bbc.com',
    'apnews.com'
]

credible_matches = []
for article in articles.get('articles', []):
    source_id = article['source'].get('id', '')
    source_name = article['source'].get('name', '')
    article_url = article.get('url', '')
    
    # Check if source ID matches credible list
    is_credible_source = source_id in credible
    
    # Also check if domain matches credible domains (for Lallantop, Wire, TNT)
    is_credible_domain = any(domain in article_url for domain in credible_domains)
    
    if is_credible_source or is_credible_domain:
        credible_matches.append({
            "name": article['source']['name'],
            "url": article['url'],
            "published": article['publishedAt']
        })
```

---

## 🎯 WHY THESE CHANGES?

### **Lallantop, The Wire, TNT World**
- Authentic Indian news sources
- Strong investigative journalism
- Trusted for fact-based reporting
- Better coverage of Indian regional/political news

### **How It Works:**
1. NewsAPI searches all sources
2. Server checks if article is from:
   - NewsAPI source IDs (like 'reuters', 'bbc-news')
   - OR domain names (like 'lallantop.com', 'thewire.in')
3. If found → Marks as "VERIFIED"
4. If not found → "UNVERIFIED"

---

## ✅ AFTER UPDATE - RESTART SERVER

```bash
# Stop server (Ctrl+C in terminal)
# Then restart
python server.py
```

---

## 📊 EXAMPLE OUTPUT AFTER UPDATE

### **Indian News Article:**
```json
{
  "news_crossref": {
    "found_in_credible_sources": true,
    "credible_sources": [
      {
        "name": "The Wire",
        "url": "https://thewire.in/article",
        "published": "2025-10-15"
      },
      {
        "name": "Lallantop",
        "url": "https://lallantop.com/article",
        "published": "2025-10-15"
      },
      {
        "name": "NDTV",
        "url": "https://ndtv.com/article",
        "published": "2025-10-14"
      }
    ],
    "verdict": "VERIFIED"
  }
}
```

### **Fake News:**
```json
{
  "news_crossref": {
    "found_in_credible_sources": false,
    "credible_sources": [],
    "verdict": "UNVERIFIED - No credible sources found"
  }
}
```

---

## 🚨 QUICK CHECKLIST FOR FRIEND

- [ ] Open `server.py`
- [ ] **Line 216:** Change NewsAPI key to `f7737e24c97c46c9ac85618469bdb25b`
- [ ] **Line 381:** Replace credible sources list with new code above
- [ ] Save file
- [ ] Restart server: `python server.py`
- [ ] Test with an Indian news article
- [ ] Verify extension shows credible sources

---

## 💬 WHAT TO TELL YOUR FRIEND

> "Hey! I updated the server prompt with my NewsAPI key and added Indian news sources (Lallantop, The Wire, TNT World). 
> 
> Can you make 2 quick changes in server.py:
> 
> 1. Line 216: Update NewsAPI key to `f7737e24c97c46c9ac85618469bdb25b`
> 2. Line 381: Replace the credible sources list with the new code (check FOR_FRIEND_NEWSAPI_UPDATE.md)
> 
> Then restart the server. This will let us verify Indian news sources too!"

---

## ✨ RESULT

**Before:** Only checks Reuters, BBC, AP, CNN, NPR, Guardian (6 sources)

**After:** Checks 15+ sources including:
- Reuters, BBC, AP, CNN, NPR, Guardian (International)
- Lallantop, The Wire, TNT World (Indian authentic)
- Times of India, The Hindu, NDTV, Hindustan Times (Indian mainstream)
- Scroll.in, The Quint (Indian digital)

**Better news verification for Indian stories!** 🇮🇳 🎯

---

## 🎉 READY TO TEST!

After your friend updates and restarts the server, analyze any Indian news article and you'll see verification from these authentic sources!
