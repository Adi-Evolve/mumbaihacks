# 🚨 CRISIS MISINFORMATION DETECTION AI - COMPLETE ARCHITECTURE

## 📋 Problem Statement (Actual)

**Build an agentic AI system that:**
1. ✅ Continuously scans multiple sources of information
2. ✅ Detects emerging misinformation during crises (COVID, earthquakes, floods, wars)
3. ✅ Verifies facts against official sources (WHO, UN, UNESCO, govt statements)
4. ✅ Provides easy-to-understand, contextual updates to public
5. ✅ Works on factual data, avoids biased narratives (especially for conflicts like Palestine-Israel)

---

## 🎯 WHAT YOU'RE ACTUALLY BUILDING

### **System Name: Crisis Truth Monitor**

**A real-time AI system that:**
- Monitors news sources 24/7 for crisis-related articles
- Detects misinformation about disasters (COVID, floods, earthquakes, wars)
- Cross-references with official sources (WHO, government, UN, UNESCO)
- Flags fake news vs. verified information
- Provides public dashboard with verified crisis updates

---

## 🏗️ COMPLETE SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                    PUBLIC-FACING LAYER                       │
├─────────────────────────────────────────────────────────────┤
│  1. Chrome Extension (User analyzes specific articles)       │
│  2. Web Dashboard (Public views verified crisis updates)     │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                     AI ANALYSIS ENGINE                       │
├─────────────────────────────────────────────────────────────┤
│  • GPT-4 / Claude for text analysis                         │
│  • CLIP for image verification                               │
│  • Emotion detection (fear-mongering in crisis news)        │
│  • Entity extraction (people, orgs mentioned)                │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                 AUTONOMOUS MONITORING AGENT                  │
├─────────────────────────────────────────────────────────────┤
│  • Continuously scans NewsAPI for crisis keywords            │
│  • Monitors Twitter/X for trending crisis topics             │
│  • Checks Reddit (r/worldnews, r/news)                      │
│  • Runs every 30 minutes (or real-time)                     │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│              OFFICIAL SOURCE VERIFICATION                    │
├─────────────────────────────────────────────────────────────┤
│  TIER 1 - MOST AUTHORITATIVE:                               │
│    • WHO (World Health Organization) - Pandemics            │
│    • UN (United Nations) - Wars, conflicts                  │
│    • UNESCO - Cultural heritage, education crises           │
│    • USGS (US Geological Survey) - Earthquakes              │
│    • NOAA - Weather disasters, hurricanes                   │
│    • Government official statements (.gov domains)          │
│                                                              │
│  TIER 2 - CREDIBLE NEWS AGENCIES:                           │
│    • Reuters, AP, BBC (Neutral reporting)                   │
│    • AFP (Agence France-Presse)                             │
│    • Al Jazeera (Middle East coverage)                      │
│                                                              │
│  TIER 3 - CROSS-REFERENCE:                                  │
│    • Multiple sources confirming same facts                 │
│    • Scientific journals (for health crises)                │
│    • Satellite imagery (for natural disasters)              │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE & STORAGE                        │
├─────────────────────────────────────────────────────────────┤
│  • Store analyzed articles (real vs. fake)                  │
│  • Crisis timeline (track evolving situations)              │
│  • Official statements archive                              │
│  • Misinformation patterns (common fake claims)             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 HOW IT WORKS - STEP BY STEP

### **Phase 1: Autonomous Crisis Detection**

```python
# Agent runs every 30 minutes
while True:
    # 1. Scan NewsAPI for crisis keywords
    crisis_keywords = [
        "earthquake", "tsunami", "flood", "hurricane", "cyclone",
        "COVID", "pandemic", "outbreak", "epidemic",
        "war", "conflict", "airstrike", "ceasefire",
        "terrorist attack", "bombing", "shooting"
    ]
    
    articles = newsapi.get_everything(
        q=" OR ".join(crisis_keywords),
        language='en',
        sort_by='publishedAt',
        page_size=100
    )
    
    # 2. For each article, check if it's crisis-related
    for article in articles:
        crisis_type = detect_crisis_type(article['title'])
        
        # 3. Analyze for misinformation
        analysis = analyze_crisis_article(article)
        
        # 4. Verify with official sources
        verification = verify_with_official_sources(article, crisis_type)
        
        # 5. Store result
        save_to_database(article, analysis, verification)
    
    # Sleep 30 minutes
    time.sleep(1800)
```

---

### **Phase 2: Official Source Verification**

```python
def verify_with_official_sources(article, crisis_type):
    """
    Cross-check article claims with official sources
    """
    
    official_sources = {
        'pandemic': [
            'https://www.who.int/news',  # WHO
            'https://www.cdc.gov/media',  # CDC
            'https://www.nih.gov/news'    # NIH
        ],
        'earthquake': [
            'https://earthquake.usgs.gov/earthquakes/feed',  # USGS
            'https://www.emsc-csem.org'  # European seismology
        ],
        'war': [
            'https://news.un.org/en/news',  # UN News
            'https://www.icrc.org/en/latest',  # Red Cross
            'https://www.amnesty.org/en/latest/news'  # Amnesty
        ],
        'flood': [
            'https://www.weather.gov/alerts',  # NOAA
            'https://www.fema.gov/news'  # FEMA
        ]
    }
    
    # Get official statements about this crisis
    official_data = fetch_official_statements(official_sources[crisis_type])
    
    # Compare article claims with official data
    verification_result = {
        'matches_official_sources': False,
        'official_statements': [],
        'contradictions': [],
        'verdict': 'UNVERIFIED'
    }
    
    # Check if article facts match official data
    for statement in official_data:
        if matches_article_claims(article, statement):
            verification_result['matches_official_sources'] = True
            verification_result['official_statements'].append(statement)
    
    # Detect contradictions
    contradictions = find_contradictions(article, official_data)
    if contradictions:
        verification_result['contradictions'] = contradictions
        verification_result['verdict'] = 'LIKELY FALSE'
    elif verification_result['matches_official_sources']:
        verification_result['verdict'] = 'VERIFIED'
    
    return verification_result
```

---

### **Phase 3: Unbiased Fact Checking (War/Conflict)**

```python
def verify_war_news(article):
    """
    Special handling for war/conflict news to avoid bias
    Uses ONLY factual, verifiable data
    """
    
    # 1. Extract factual claims (numbers, dates, locations)
    factual_claims = extract_factual_claims(article)
    # Example: "Israel struck Gaza killing 50 people"
    # Factual parts: Location (Gaza), Number (50), Action (strike)
    
    # 2. Cross-check with multiple neutral sources
    neutral_sources = [
        'https://news.un.org',           # UN (most neutral)
        'https://www.icrc.org',          # Red Cross (humanitarian)
        'https://www.amnesty.org',       # Amnesty International
        'https://www.hrw.org',           # Human Rights Watch
        'https://reliefweb.int'          # UN humanitarian info
    ]
    
    verified_facts = []
    unverified_claims = []
    
    for claim in factual_claims:
        # Check if UN, Red Cross, or Amnesty confirms this fact
        confirmations = []
        for source in neutral_sources:
            if confirms_claim(source, claim):
                confirmations.append(source)
        
        if len(confirmations) >= 2:
            # At least 2 neutral sources confirm = VERIFIED FACT
            verified_facts.append({
                'claim': claim,
                'confirmed_by': confirmations,
                'status': 'VERIFIED'
            })
        else:
            # Cannot verify = Mark as unconfirmed
            unverified_claims.append({
                'claim': claim,
                'status': 'UNVERIFIED - Cannot confirm with neutral sources'
            })
    
    # 3. Detect emotional/biased language
    bias_detected = detect_bias_in_language(article)
    
    # 4. Return analysis
    return {
        'verified_facts': verified_facts,
        'unverified_claims': unverified_claims,
        'bias_detected': bias_detected,
        'recommendation': 'Use caution - verify with UN/Red Cross sources'
    }
```

---

## 🎯 OFFICIAL SOURCES BY CRISIS TYPE

### **1. PANDEMIC / DISEASE OUTBREAK**

**Primary Sources (TIER 1):**
- WHO (World Health Organization): https://www.who.int
- CDC (Centers for Disease Control): https://www.cdc.gov
- NIH (National Institutes of Health): https://www.nih.gov
- ECDC (European CDC): https://www.ecdc.europa.eu

**What to Verify:**
- ✅ Infection numbers (official counts)
- ✅ Mortality rates (confirmed deaths)
- ✅ Vaccine efficacy (peer-reviewed studies)
- ✅ Treatment guidelines (official protocols)

**Red Flags (Fake News):**
- ❌ Miracle cures without clinical trials
- ❌ Conspiracy theories about origin
- ❌ Inflated/deflated numbers without source
- ❌ "Secret government documents" claims

---

### **2. EARTHQUAKES / TSUNAMIS**

**Primary Sources (TIER 1):**
- USGS (US Geological Survey): https://earthquake.usgs.gov
- EMSC (European Seismology): https://www.emsc-csem.org
- National seismological agencies
- Pacific Tsunami Warning Center

**What to Verify:**
- ✅ Magnitude (official measurement)
- ✅ Epicenter location (GPS coordinates)
- ✅ Casualty numbers (government reports)
- ✅ Tsunami warnings (official alerts)

**Red Flags:**
- ❌ Exaggerated magnitude claims
- ❌ Fake tsunami warnings
- ❌ Inflated casualty numbers
- ❌ "Earthquake predicted by mystic" claims

---

### **3. FLOODS / HURRICANES / CYCLONES**

**Primary Sources (TIER 1):**
- NOAA (National Oceanic & Atmospheric): https://www.noaa.gov
- National Weather Service: https://www.weather.gov
- FEMA (Federal Emergency Management): https://www.fema.gov
- WMO (World Meteorological Org): https://public.wmo.int

**What to Verify:**
- ✅ Storm category/intensity
- ✅ Affected areas (official maps)
- ✅ Evacuation orders (government alerts)
- ✅ Casualty/damage reports

**Red Flags:**
- ❌ Exaggerated storm predictions
- ❌ Fake evacuation orders
- ❌ Manipulated weather maps
- ❌ Climate denial claims

---

### **4. WAR / ARMED CONFLICT**

**Primary Sources (TIER 1 - NEUTRAL ONLY):**
- UN News: https://news.un.org
- UN Security Council: https://www.un.org/securitycouncil
- ICRC (Red Cross): https://www.icrc.org
- Amnesty International: https://www.amnesty.org
- Human Rights Watch: https://www.hrw.org
- ICC (International Criminal Court): https://www.icc-cpi.int

**What to Verify:**
- ✅ Documented incidents (with evidence)
- ✅ Casualty numbers (from neutral orgs)
- ✅ Humanitarian situation (UN reports)
- ✅ War crimes allegations (ICC investigations)

**CRITICAL - Avoid Biased Sources:**
- ❌ Government-controlled media from conflict parties
- ❌ Partisan news outlets
- ❌ Social media claims without evidence
- ❌ Propaganda from either side

**Use ONLY:**
- ✅ UN-verified reports
- ✅ Red Cross statements
- ✅ Human rights org investigations
- ✅ Satellite imagery (neutral verification)
- ✅ Multiple neutral sources confirming same fact

---

### **5. TERRORIST ATTACKS / MASS VIOLENCE**

**Primary Sources:**
- Government official statements (.gov domains)
- Local law enforcement
- UN reports
- Verified news agencies (Reuters, AP, AFP)

**What to Verify:**
- ✅ Casualty numbers (official count)
- ✅ Location and time (verified)
- ✅ Perpetrator identification (official)
- ✅ Motive (official investigation)

**Red Flags:**
- ❌ Fake casualty numbers
- ❌ False flag conspiracy theories
- ❌ Misidentified perpetrators
- ❌ Unverified social media videos

---

## 🤖 AGENTIC AI COMPONENTS

### **Agent 1: News Monitor**
- **Job:** Scan NewsAPI every 30 mins for crisis keywords
- **Output:** List of potential crisis articles

### **Agent 2: Social Media Scout**
- **Job:** Monitor Twitter/X trending topics for crisis mentions
- **Output:** Trending misinformation claims

### **Agent 3: Official Source Checker**
- **Job:** Fetch latest statements from WHO, UN, USGS, etc.
- **Output:** Ground truth data

### **Agent 4: Fact Verifier**
- **Job:** Compare news articles with official sources
- **Output:** VERIFIED / LIKELY FALSE / UNVERIFIED

### **Agent 5: Public Dashboard Updater**
- **Job:** Push verified crisis updates to public dashboard
- **Output:** Easy-to-understand timeline of verified info

---

## 💻 UPDATED SERVER ARCHITECTURE

```python
from fastapi import FastAPI, BackgroundTasks
import asyncio
from datetime import datetime
from typing import List, Dict
import requests
from bs4 import BeautifulSoup

app = FastAPI()

# ============= CRISIS MONITORING AGENT =============

class CrisisMonitorAgent:
    def __init__(self):
        self.crisis_keywords = {
            'pandemic': ['COVID', 'pandemic', 'outbreak', 'epidemic', 'virus'],
            'earthquake': ['earthquake', 'seismic', 'tremor', 'quake'],
            'flood': ['flood', 'flooding', 'inundation', 'deluge'],
            'hurricane': ['hurricane', 'cyclone', 'typhoon', 'storm'],
            'war': ['war', 'conflict', 'airstrike', 'bombing', 'ceasefire'],
            'attack': ['attack', 'shooting', 'explosion', 'terrorism']
        }
        
        self.official_sources = {
            'pandemic': {
                'WHO': 'https://www.who.int/news',
                'CDC': 'https://www.cdc.gov/media/releases',
            },
            'earthquake': {
                'USGS': 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson'
            },
            'war': {
                'UN': 'https://news.un.org/en/news',
                'ICRC': 'https://www.icrc.org/en/latest'
            }
        }
    
    async def scan_news_sources(self):
        """Scan news for crisis-related articles"""
        crisis_articles = []
        
        for crisis_type, keywords in self.crisis_keywords.items():
            # Search NewsAPI
            articles = newsapi.get_everything(
                q=" OR ".join(keywords),
                language='en',
                sort_by='publishedAt',
                page_size=20
            )
            
            for article in articles.get('articles', []):
                crisis_articles.append({
                    'crisis_type': crisis_type,
                    'article': article,
                    'detected_at': datetime.now().isoformat()
                })
        
        return crisis_articles
    
    async def verify_with_official_sources(self, article, crisis_type):
        """Cross-check with official sources"""
        sources = self.official_sources.get(crisis_type, {})
        
        verified_data = []
        for source_name, source_url in sources.items():
            try:
                # Fetch official data
                official_content = await self.fetch_official_data(source_url)
                
                # Check if article claims match official data
                matches = self.compare_article_with_official(article, official_content)
                
                if matches:
                    verified_data.append({
                        'source': source_name,
                        'url': source_url,
                        'confirmed': True,
                        'timestamp': datetime.now().isoformat()
                    })
            except Exception as e:
                print(f"Error checking {source_name}: {e}")
        
        return {
            'verified_by_official_sources': len(verified_data) > 0,
            'official_confirmations': verified_data,
            'verdict': 'VERIFIED' if len(verified_data) >= 2 else 'UNVERIFIED'
        }
    
    async def fetch_official_data(self, url):
        """Fetch data from official source"""
        response = requests.get(url, timeout=10)
        return response.text
    
    def compare_article_with_official(self, article, official_content):
        """Check if article claims match official data"""
        # Extract key claims from article
        article_claims = extract_key_claims(article['content'])
        
        # Check if official content mentions same claims
        for claim in article_claims:
            if claim.lower() in official_content.lower():
                return True
        
        return False

# ============= BACKGROUND MONITORING =============

monitor_agent = CrisisMonitorAgent()

@app.on_event("startup")
async def start_monitoring():
    """Start autonomous monitoring on server startup"""
    asyncio.create_task(continuous_monitoring())

async def continuous_monitoring():
    """Run monitoring loop continuously"""
    while True:
        try:
            print(f"\n🔍 [{datetime.now()}] Starting crisis scan...")
            
            # Scan news sources
            crisis_articles = await monitor_agent.scan_news_sources()
            
            print(f"✅ Found {len(crisis_articles)} crisis-related articles")
            
            # Analyze each article
            for item in crisis_articles:
                article = item['article']
                crisis_type = item['crisis_type']
                
                # Verify with official sources
                verification = await monitor_agent.verify_with_official_sources(
                    article, 
                    crisis_type
                )
                
                # Store result
                save_analysis_to_db(article, verification, crisis_type)
            
            print(f"✅ Scan complete. Sleeping 30 minutes...\n")
            
        except Exception as e:
            print(f"❌ Error in monitoring: {e}")
        
        # Sleep 30 minutes
        await asyncio.sleep(1800)

# ============= API ENDPOINTS =============

@app.get("/api/v1/crisis/live")
async def get_live_crisis_updates():
    """Get real-time verified crisis updates"""
    # Return verified crisis info from database
    return get_verified_crisis_updates_from_db()

@app.get("/api/v1/crisis/{crisis_type}")
async def get_crisis_by_type(crisis_type: str):
    """Get updates for specific crisis type"""
    return get_crisis_updates_by_type(crisis_type)

@app.post("/api/v1/analyze")
async def analyze_article(request: AnalysisRequest):
    """Original endpoint - analyze specific article"""
    # Your existing analysis code here
    pass
```

---

## 🌐 PUBLIC DASHBOARD (Web Interface)

Create a simple web dashboard that shows:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Crisis Truth Monitor - Live Updates</title>
    <style>
        body { font-family: Arial; max-width: 1200px; margin: 0 auto; }
        .crisis-card { 
            border: 2px solid #ddd; 
            padding: 20px; 
            margin: 20px 0; 
            border-radius: 8px;
        }
        .verified { border-color: #10b981; background: #ecfdf5; }
        .false { border-color: #ef4444; background: #fef2f2; }
        .unverified { border-color: #f59e0b; background: #fffbeb; }
    </style>
</head>
<body>
    <h1>🚨 Crisis Truth Monitor</h1>
    <p>Real-time verified crisis information from official sources</p>
    
    <div id="crisis-updates"></div>
    
    <script>
        // Fetch live crisis updates every 5 minutes
        async function fetchCrisisUpdates() {
            const response = await fetch('http://10.25.26.187:8002/api/v1/crisis/live');
            const updates = await response.json();
            
            const container = document.getElementById('crisis-updates');
            container.innerHTML = '';
            
            updates.forEach(update => {
                const card = document.createElement('div');
                card.className = `crisis-card ${update.verdict.toLowerCase()}`;
                card.innerHTML = `
                    <h2>${update.crisis_type.toUpperCase()}: ${update.title}</h2>
                    <p><strong>Verdict:</strong> ${update.verdict}</p>
                    <p>${update.summary}</p>
                    ${update.official_confirmations.length > 0 ? `
                        <div>
                            <strong>✅ Verified by:</strong>
                            <ul>
                                ${update.official_confirmations.map(c => `
                                    <li>${c.source} - ${c.timestamp}</li>
                                `).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    <small>Last checked: ${update.last_updated}</small>
                `;
                container.appendChild(card);
            });
        }
        
        // Refresh every 5 minutes
        fetchCrisisUpdates();
        setInterval(fetchCrisisUpdates, 300000);
    </script>
</body>
</html>
```

---

## 🎯 HACKATHON DEMO FLOW

### **Demo Scenario: COVID Misinformation**

**Setup:**
1. Agent monitors news for "COVID" keywords
2. Finds article: "New COVID variant 100% deadly"
3. Verifies with WHO website
4. WHO says: "New variant detected, mortality rate 2%"
5. Article contradicts WHO = FLAGGED AS FALSE

**Show Judge:**
```
[Open dashboard]

"Here's our Crisis Truth Monitor. It's been running for the last hour scanning news sources.

[Point to article]
This article claims the new COVID variant is '100% deadly' - sounds scary, right?

But our AI automatically cross-checked with WHO's official website, and WHO reports the mortality rate is actually 2%, not 100%.

[Show verification details]
The system flagged this as LIKELY FALSE because it contradicts official WHO data.

[Show public dashboard]
Our public dashboard shows only verified information, so citizens get accurate crisis updates during emergencies."
```

---

## 📊 WHAT MAKES THIS HACKATHON-WINNING

### **1. Addresses Real Problem**
- Misinformation during crises kills people (COVID fake cures, fake evacuation orders)
- Your AI prevents panic and saves lives

### **2. Autonomous System**
- Runs 24/7 without human intervention
- "Agentic AI" (meets problem statement requirement)

### **3. Multi-Source Verification**
- Doesn't trust single source
- Cross-checks with WHO, UN, government, Red Cross

### **4. Unbiased for Conflicts**
- Uses only neutral sources (UN, Red Cross)
- Avoids partisan narratives
- Focus on verifiable facts only

### **5. Public Benefit**
- Free dashboard for citizens
- Easy-to-understand updates
- Contextual information

---

## ✅ IMPLEMENTATION PRIORITY

### **Phase 1: MVP (Hackathon Demo)** ⭐
1. ✅ Chrome extension (you already have this!)
2. ✅ Basic monitoring agent (scan NewsAPI for crisis keywords)
3. ✅ WHO/UN verification (fetch official pages, compare)
4. ✅ Simple web dashboard (show verified updates)

### **Phase 2: After Hackathon**
- Add more official sources
- Real-time Twitter monitoring
- SMS alerts for citizens
- Multi-language support

---

## 🚀 NEXT STEPS FOR YOU

1. **Update server.py** to add autonomous monitoring
2. **Add official source checking** (WHO, UN, USGS APIs)
3. **Create simple web dashboard** (HTML + JavaScript)
4. **Demo with real crisis** (search for recent earthquake/COVID news)

---

**Want me to create the updated server code with autonomous monitoring and official source verification?** 🚀

This will make your hackathon project 100x more impressive!
