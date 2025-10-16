# 🚨 FOR YOUR FRIEND - SIMPLE INSTRUCTIONS

## 📋 WHAT TO DO

1. **Open this file:** `COMPLETE_CRISIS_SERVER_PROMPT_FOR_FRIEND.md`

2. **Copy the ENTIRE file**

3. **Open Claude or GPT-4**

4. **Paste it and say:**
   ```
   Implement this complete crisis misinformation detection server. 
   Create a single server.py file with all features.
   ```

5. **Claude will generate the complete `server.py` file**

6. **Save it and run:**
   ```bash
   pip install fastapi uvicorn python-multipart pillow transformers torch newsapi-python requests wikipedia
   python server.py
   ```

7. **Server will start on `10.25.26.187:8002`**

8. **Test with:**
   ```bash
   curl -X POST http://10.25.26.187:8002/api/v1/analyze -H "Content-Type: application/json" -d "{\"content\": \"A magnitude 7.2 earthquake struck Turkey\", \"title\": \"Earthquake\", \"url\": \"https://news.com\"}"
   ```

9. **Let me know when it's running!**

---

## ✅ WHAT THE SERVER DOES

- ✅ Detects crisis types (pandemic, earthquake, flood, hurricane, war, attack)
- ✅ Verifies with official sources (WHO, USGS, UN, Red Cross)
- ✅ **USGS earthquake API** - Uses REAL earthquake data!
- ✅ Detects bias in war news
- ✅ Generates public-friendly summaries
- ✅ All existing features (CLIP, emotion, news cross-ref, etc.)

---

## 📂 FILE TO SEND

**ONLY THIS FILE:** `COMPLETE_CRISIS_SERVER_PROMPT_FOR_FRIEND.md`

This is a complete, self-contained prompt that Claude/GPT-4 can implement in one go!

---

## ⏱️ TIME: ~30 minutes

- 5 min: Copy-paste prompt to Claude
- 10 min: Claude generates code
- 10 min: Install dependencies
- 5 min: Test

---

## 🎯 THE EXTENSION IS READY!

Your extension (on your device) is already updated to display:
- Crisis alerts with emojis
- Official source verification
- Bias warnings
- Public summaries

It just needs the server to return the data!

