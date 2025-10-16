/**
 * Content Script - Main logic for page analysis and content extraction
 * Runs on every page load to detect and analyze content
 */

// Configuration
const CONFIG = {
  API_ENDPOINT: 'http://10.25.26.187:8002/api/v1/analyze', // Friend's laptop IP (PORT 8002!)
  MIN_TEXT_LENGTH: 100,
  MAX_CONCURRENT_REQUESTS: 2,
  REQUEST_TIMEOUT: 15000,
  CACHE_SIZE: 2,
  AUTO_ANALYZE: false  // Disabled until server is ready
};

// State management
let isAnalyzing = false;
let activeRequests = 0;
let currentPageHash = null;
let aiSearchPopup = null;

/**
 * Initialize extension on page load
 */
function init() {
  console.log('🚀 Misinformation Detector: Initialized');
  
  // Initialize AI Search Popup
  aiSearchPopup = new AISearchPopup();
  
  // Test server connection
  testServerConnection();
  
  // Check if auto-analyze is enabled
  chrome.storage.sync.get(['autoAnalyze'], (result) => {
    if (result.autoAnalyze !== false) { // Default to true
      detectAndAnalyzeContent();
    }
  });

  // Listen for manual trigger from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'analyzeContent') {
      analyzeCurrentPage().then(sendResponse);
      return true; // Keep message channel open for async response
    } else if (request.action === 'getPageInfo') {
      sendResponse({
        url: window.location.href,
        title: document.title,
        hasContent: detectContentType() !== null
      });
    }
  });
}

/**
 * Test server connection on startup
 */
async function testServerConnection() {
  console.log('\n🔍 ========== TESTING SERVER CONNECTION ==========');
  console.log('🌐 Server URL:', CONFIG.API_ENDPOINT);
  
  try {
    // Try a simple health check or just test connectivity
    const healthUrl = CONFIG.API_ENDPOINT.replace('/analyze', '/health');
    console.log('📡 Attempting to connect to:', healthUrl);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout for health check
    
    const response = await fetch(healthUrl, {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      console.log('✅ SERVER CONNECTED!');
      console.log('   Status:', response.status);
      console.log('   Server is ready to analyze content');
    } else {
      console.log('⚠️ Server responded but with error status:', response.status);
    }
  } catch (error) {
    console.log('❌ SERVER NOT CONNECTED');
    
    // Check if it's actually a CORS error (means server IS running!)
    if (error.message && error.message.includes('CORS')) {
      console.log('   🎉 GOOD NEWS: Server IS running!');
      console.log('   ⚠️ But CORS is blocking the connection');
      console.log('\n💡 Fix: Friend needs to enable CORS on server:');
      console.log('   Add this to Flask app:');
      console.log('   from flask_cors import CORS');
      console.log('   CORS(app)');
      console.log('\n   Or for FastAPI:');
      console.log('   from fastapi.middleware.cors import CORSMiddleware');
      console.log('   app.add_middleware(CORSMiddleware, allow_origins=["*"])');
    } else {
      console.log('   This is normal if server isn\'t running yet');
      console.log('   Error:', error.message);
      console.log('\n💡 To enable analysis:');
      console.log('   1. Friend starts server on laptop (10.25.26.187:8000)');
      console.log('   2. Both laptops must be on same WiFi');
      console.log('   3. Reload this page after server starts');
    }
  }
  
  console.log('================================================\n');
}

/**
 * Detect content type and decide if page should be analyzed
 */
function detectContentType() {
  const url = window.location.href;
  
  // Skip certain URLs
  const skipPatterns = [
    /^chrome:/,
    /^about:/,
    /^file:/,
    /chrome\.google\.com/,
    /accounts\.google\.com/,
    /login/,
    /signin/
  ];
  
  if (skipPatterns.some(pattern => pattern.test(url))) {
    return null;
  }

  // Detect article-like content
  const articleSelectors = [
    'article',
    '[role="article"]',
    '.article',
    '.post',
    '.entry-content',
    'main article',
    '.story-body',
    '.article-body'
  ];

  for (let selector of articleSelectors) {
    const element = document.querySelector(selector);
    if (element && element.textContent.length > CONFIG.MIN_TEXT_LENGTH) {
      return 'article';
    }
  }

  // Check for blog post
  if (document.querySelector('.post-content, .blog-post, .entry')) {
    return 'blog';
  }

  return null;
}

/**
 * Detect and analyze content automatically
 */
async function detectAndAnalyzeContent() {
  const contentType = detectContentType();
  
  if (!contentType) {
    console.log('❌ No analyzable content detected');
    return;
  }

  console.log(`✓ Detected content type: ${contentType}`);
  
  // Extract content with enhanced features
  const extractedContent = ContentExtractor.extractMainContent();
  
  // Log extraction details
  console.log('📊 Extraction Summary:', {
    pageType: extractedContent.pageType,
    textLength: extractedContent.text.length,
    articles: extractedContent.articles.length,
    adsBlocked: extractedContent.adBlockedCount,
    confidence: extractedContent.confidence
  });
  
  // Skip social media pages (special handling needed)
  if (extractedContent.pageType.startsWith('social-')) {
    console.log('⚠️ Social media page detected - use manual analysis');
    showSocialMediaNotice(extractedContent.pageType);
    return;
  }
  
  // Check if we have enough content
  if (!extractedContent || extractedContent.text.length < 50) {
    console.log('⚠️ Insufficient content for analysis');
    console.log(`Found only ${extractedContent?.text.length || 0} characters`);
    
    // Show helpful message
    showInsufficientContentNotice(extractedContent);
    return;
  }

  console.log(`✅ Extracted ${extractedContent.text.length} characters of content`);


  // If multiple articles found, analyze them separately
  if (extractedContent.articles.length > 1) {
    console.log(`📰 Multiple articles detected (${extractedContent.articles.length})`);
    await analyzeMultipleArticles(extractedContent);
    return;
  }

  // Generate content hash
  const contentHash = await generateHash(extractedContent.text);
  
  // Check cache
  const cachedResult = Cache.get(contentHash);
  if (cachedResult) {
    console.log('✓ Using cached result');
    displayResult(cachedResult, extractedContent);
    return;
  }

  // Check if we're already analyzing this content
  if (currentPageHash === contentHash) {
    console.log('⏳ Already analyzing this content');
    return;
  }

  currentPageHash = contentHash;

  // Analyze content
  await analyzeContent(extractedContent, contentHash);
}

/**
 * Analyze current page (triggered manually)
 */
async function analyzeCurrentPage() {
  const extractedContent = ContentExtractor.extractMainContent();
  
  if (!extractedContent || extractedContent.text.length < CONFIG.MIN_TEXT_LENGTH) {
    return {
      success: false,
      error: 'Insufficient content for analysis',
      pageType: extractedContent?.pageType || 'unknown'
    };
  }

  // Handle multiple articles
  if (extractedContent.articles.length > 1) {
    return await analyzeMultipleArticles(extractedContent);
  }

  const contentHash = await generateHash(extractedContent.text);
  const cachedResult = Cache.get(contentHash);
  
  if (cachedResult) {
    displayResult(cachedResult, extractedContent);
    return { success: true, cached: true };
  }

  return await analyzeContent(extractedContent, contentHash);
}

/**
 * Analyze multiple articles separately
 */
async function analyzeMultipleArticles(extractedContent) {
  showMultiArticleOverlay(extractedContent.articles.length);
  
  const results = [];
  
  // Analyze each article
  for (let i = 0; i < Math.min(extractedContent.articles.length, 5); i++) {
    const article = extractedContent.articles[i];
    const articleHash = await generateHash(article.text);
    
    // Check cache
    let result = Cache.get(articleHash);
    
    if (!result) {
      try {
        result = await analyzeContent({
          text: article.text,
          title: article.title,
          author: article.author,
          publishDate: article.publishDate,
          source: extractedContent.source
        }, articleHash, true); // skipDisplay = true
        
        if (result.success) {
          result = result.result;
        }
      } catch (error) {
        console.error(`Failed to analyze article ${i}:`, error);
        continue;
      }
    }
    
    results.push({
      articleIndex: i,
      title: article.title,
      url: article.url,
      result: result
    });
  }
  
  displayMultipleResults(results, extractedContent);
  return { success: true, multiArticle: true, results };
}

/**
 * Send content to backend for analysis
 */
async function analyzeContent(content, contentHash, skipDisplay = false) {
  if (isAnalyzing || activeRequests >= CONFIG.MAX_CONCURRENT_REQUESTS) {
    console.log('⏳ Analysis already in progress or max requests reached');
    return { success: false, error: 'Analysis in progress' };
  }

  isAnalyzing = true;
  activeRequests++;

  // Show loading state
  if (!skipDisplay) {
    showLoadingOverlay(content.pageType || 'article');
  }

  console.log('\n🔄 ========== STARTING ANALYSIS ==========');
  console.log('📡 Step 1: Preparing to send data to server...');
  console.log('🌐 Server URL:', CONFIG.API_ENDPOINT);
  console.log('📊 Content length:', content.text.length, 'characters');
  console.log('📰 Page type:', content.pageType || 'unknown');

  try {
    console.log('\n📤 Step 2: Sending POST request to server...');
    console.log('⏱️ Timeout:', CONFIG.REQUEST_TIMEOUT / 1000, 'seconds');
    
    const requestData = {
      text: content.text,
      url: window.location.href,
      title: content.title,
      author: content.author,
      publishDate: content.publishDate,
      pageType: content.pageType,
      source: content.source,
      language: detectLanguage(content.text)
    };
    
    console.log('📋 Request payload:', {
      textLength: requestData.text.length,
      url: requestData.url,
      title: requestData.title,
      pageType: requestData.pageType,
      language: requestData.language
    });

    const startTime = Date.now();
    
    const response = await fetchWithTimeout(CONFIG.API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    }, CONFIG.REQUEST_TIMEOUT);

    const responseTime = Date.now() - startTime;
    
    console.log('\n✅ Step 3: Server response received!');
    console.log('⏱️ Response time:', responseTime, 'ms');
    console.log('📊 Status:', response.status, response.statusText);
    console.log('📋 Headers:', {
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length')
    });

    if (!response.ok) {
      console.error('❌ Server returned error status:', response.status);
      console.error('📄 Status text:', response.statusText);
      
      let errorBody = '';
      try {
        errorBody = await response.text();
        console.error('📄 Error response body:', errorBody);
      } catch (e) {
        console.error('❌ Could not read error response body');
      }
      
      throw new Error(`Server error: ${response.status} ${response.statusText}${errorBody ? ' - ' + errorBody : ''}`);
    }

    console.log('\n📥 Step 4: Parsing server response...');
    const result = await response.json();
    
    console.log('✅ Step 5: Analysis complete!');
    console.log('📊 Analysis Result:', {
      classification: result.classification,
      confidence: result.confidence,
      misinformationScore: result.misinformation_score || result.score,
      hasExplanation: !!result.explanation,
      highlightedPhrasesCount: result.highlighted_phrases?.length || 0,
      factCheckSourcesCount: result.fact_check_sources?.length || 0
    });
    
    console.log('\n💾 Step 6: Caching result...');
    Cache.set(contentHash, result);
    console.log('✅ Result cached with hash:', contentHash.substring(0, 16) + '...');
    
    // Display result
    if (!skipDisplay) {
      console.log('\n🎨 Step 7: Displaying result to user...');
      displayResult(result, content);
    }
    
    isAnalyzing = false;
    activeRequests--;
    
    console.log('\n✅ ========== ANALYSIS COMPLETED SUCCESSFULLY ==========\n');
    
    return { success: true, result };

  } catch (error) {
    isAnalyzing = false;
    activeRequests--;
    
    console.error('\n❌ ========== ANALYSIS FAILED ==========');
    console.error('🔍 Error Details:');
    console.error('   Type:', error.name);
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
    
    // Detailed error analysis
    const isConnectionError = error && error.message && 
      (error.message.includes('Failed to fetch') || 
       error.message.includes('ERR_CONNECTION_REFUSED') ||
       error.message.includes('NetworkError') ||
       error.message.includes('Network request failed'));
    
    const isTimeoutError = error && error.message && 
      error.message.includes('timeout');
    
    const isCORSError = error && error.message && 
      error.message.includes('CORS');
    
    const isServerError = error && error.message && 
      (error.message.includes('Server error') || 
       error.message.includes('500') || 
       error.message.includes('502') || 
       error.message.includes('503'));
    
    if (isConnectionError) {
      console.error('\n� CONNECTION ERROR');
      console.error('   Reason: Cannot reach server');
      console.error('   Server URL:', CONFIG.API_ENDPOINT);
      console.error('\n💡 Troubleshooting Steps:');
      console.error('   1. ✅ Check if server is running on friend\'s laptop');
      console.error('   2. ✅ Verify server IP: 10.25.26.187');
      console.error('   3. ✅ Confirm server is listening on port 8000');
      console.error('   4. ✅ Ensure both laptops on same WiFi network');
      console.error('   5. ✅ Check firewall settings on friend\'s laptop');
      console.error('   6. ✅ Try ping: ping 10.25.26.187');
      console.error('   7. ✅ Test in browser: http://10.25.26.187:8002/api/v1/health');
    } else if (isTimeoutError) {
      console.error('\n⏱️ TIMEOUT ERROR');
      console.error('   Reason: Server took too long to respond');
      console.error('   Timeout limit:', CONFIG.REQUEST_TIMEOUT / 1000, 'seconds');
      console.error('\n💡 Possible causes:');
      console.error('   - Server is processing too slowly');
      console.error('   - Network latency is high');
      console.error('   - Server is overloaded');
    } else if (isCORSError) {
      console.error('\n🚫 CORS ERROR');
      console.error('   Reason: Server blocked cross-origin request');
      console.error('\n💡 Solution:');
      console.error('   - Friend needs to enable CORS on server');
      console.error('   - Add CORS headers to API responses');
    } else if (isServerError) {
      console.error('\n⚠️ SERVER ERROR');
      console.error('   Reason: Server encountered an internal error');
      console.error('\n💡 Action needed:');
      console.error('   - Check server logs on friend\'s laptop');
      console.error('   - Verify API endpoint is correct');
      console.error('   - Ensure server dependencies are installed');
    } else {
      console.error('\n❓ UNKNOWN ERROR');
      console.error('   This is an unexpected error type');
      console.error('\n💡 Debug information:');
      console.error('   - Error name:', error.name);
      console.error('   - Error message:', error.message);
      console.error('   - Check browser console for more details');
    }
    
    console.error('\n========================================\n');
    
    // Only show error overlay for non-connection errors
    if (!skipDisplay && !isConnectionError) {
      showErrorOverlay(error.message || 'Unknown error');
    }
    
    return { 
      success: false, 
      error: error.message || 'Unknown error',
      errorType: isConnectionError ? 'connection' : 
                 isTimeoutError ? 'timeout' : 
                 isCORSError ? 'cors' : 
                 isServerError ? 'server' : 'unknown'
    };
  }
}

/**
 * Display analysis result overlay
 */
function displayResult(result) {
  // Remove existing overlay
  removeOverlay();

  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'misinfo-detector-overlay';
  overlay.className = 'misinfo-overlay';

  // Determine color based on classification
  const colorMap = {
    'verified': '#10b981',      // Green
    'true': '#10b981',
    'misleading': '#f59e0b',    // Yellow
    'questionable': '#f59e0b',
    'false': '#ef4444',         // Red
    'misinformation': '#ef4444',
    'satire': '#8b5cf6'         // Purple
  };

  const classification = result.classification.toLowerCase();
  const color = colorMap[classification] || '#6b7280';
  const confidence = Math.round(result.confidence * 100);
  
  // Check if we have suspicious sentences
  const hasSuspiciousLines = result.suspicious_sentences && result.suspicious_sentences.length > 0;

  overlay.innerHTML = `
    <div class="misinfo-header" style="background-color: ${color};">
      <div class="misinfo-title">
        <span class="misinfo-icon">${getClassificationIcon(classification)}</span>
        <span class="misinfo-label">${capitalize(classification)}</span>
      </div>
      <div class="misinfo-confidence">${confidence}% confident</div>
      <button class="misinfo-close" id="misinfo-close-btn">×</button>
    </div>
    <div class="misinfo-body">
      <p class="misinfo-explanation">${result.explanation || 'Analysis complete.'}</p>
      ${result.highlighted_phrases && result.highlighted_phrases.length > 0 ? `
        <div class="misinfo-highlights">
          <strong>Key phrases:</strong>
          ${result.highlighted_phrases.map(phrase => `<span class="highlight-phrase">${phrase}</span>`).join('')}
        </div>
      ` : ''}
      ${result.fact_check_sources && result.fact_check_sources.length > 0 ? `
        <div class="misinfo-sources">
          <strong>Fact-check sources:</strong>
          <ul>
            ${result.fact_check_sources.map(source => `
              <li><a href="${source.url}" target="_blank">${source.name}</a> - ${source.verdict}</li>
            `).join('')}
          </ul>
        </div>
      ` : ''}
      ${hasSuspiciousLines ? `
        <div class="misinfo-suspicious-info">
          <span class="suspicious-count">⚠️ Found ${result.suspicious_sentences.length} suspicious sentence${result.suspicious_sentences.length > 1 ? 's' : ''}</span>
        </div>
      ` : ''}
      <div class="misinfo-actions">
        ${hasSuspiciousLines ? `
          <button class="misinfo-btn misinfo-btn-primary" id="misinfo-highlight-btn">
            🔍 Show Suspicious Lines
          </button>
        ` : ''}
        <button class="misinfo-btn misinfo-btn-secondary" id="misinfo-details-btn">View Details</button>
        <button class="misinfo-btn misinfo-btn-secondary" id="misinfo-feedback-btn">Report Issue</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Add event listeners
  document.getElementById('misinfo-close-btn').addEventListener('click', removeOverlay);
  document.getElementById('misinfo-details-btn').addEventListener('click', () => showDetails(result));
  document.getElementById('misinfo-feedback-btn').addEventListener('click', () => showFeedbackForm(result));
  
  // Add highlight button listener if suspicious sentences exist
  if (hasSuspiciousLines) {
    document.getElementById('misinfo-highlight-btn').addEventListener('click', () => {
      highlightSuspiciousLines(result.suspicious_sentences);
      // Update button to show it's active
      const btn = document.getElementById('misinfo-highlight-btn');
      btn.textContent = '✓ Highlighted on Page';
      btn.style.background = '#10b981';
      btn.disabled = true;
    });
  }

  // Auto-hide after 30 seconds
  setTimeout(() => {
    if (document.getElementById('misinfo-detector-overlay')) {
      overlay.classList.add('misinfo-fade-out');
      setTimeout(removeOverlay, 300);
    }
  }, 30000);
}

/**
 * Show loading overlay
 */
function showLoadingOverlay(pageType = 'content') {
  removeOverlay();
  
  const pageTypeLabel = {
    'news-portal': 'news article',
    'blog': 'blog post',
    'article-page': 'article',
    'social-facebook': 'Facebook post',
    'social-twitter': 'tweet',
    'social-reddit': 'Reddit post'
  };
  
  const label = pageTypeLabel[pageType] || 'content';
  
  const overlay = document.createElement('div');
  overlay.id = 'misinfo-detector-overlay';
  overlay.className = 'misinfo-overlay';
  overlay.innerHTML = `
    <div class="misinfo-loading">
      <div class="misinfo-spinner"></div>
      <p>Analyzing ${label}...</p>
      <p class="misinfo-loading-sub">Checking for misinformation</p>
    </div>
  `;
  
  document.body.appendChild(overlay);
}

/**
 * Show notice for insufficient content
 */
function showInsufficientContentNotice(extractedContent) {
  console.log('📝 Showing insufficient content notice');
  console.log('Page type:', extractedContent?.pageType || 'unknown');
  console.log('Text found:', extractedContent?.text?.substring(0, 200) || 'none');
  
  // Don't show overlay for now, just log
  // This prevents annoying popups on every page
}

/**
 * Show notice for social media pages
 */
function showSocialMediaNotice(pageType) {
  removeOverlay();
  
  const platformNames = {
    'social-facebook': 'Facebook',
    'social-twitter': 'Twitter/X',
    'social-reddit': 'Reddit',
    'social-instagram': 'Instagram',
    'social-linkedin': 'LinkedIn',
    'social-tiktok': 'TikTok',
    'social-youtube': 'YouTube'
  };
  
  const platform = platformNames[pageType] || 'this social media platform';
  
  const overlay = document.createElement('div');
  overlay.id = 'misinfo-detector-overlay';
  overlay.className = 'misinfo-overlay';
  overlay.innerHTML = `
    <div class="misinfo-header" style="background-color: #3b82f6;">
      <div class="misinfo-title">
        <span class="misinfo-icon">ℹ️</span>
        <span class="misinfo-label">${platform} Detected</span>
      </div>
      <button class="misinfo-close" id="misinfo-close-btn">×</button>
    </div>
    <div class="misinfo-body">
      <p>This appears to be a ${platform} page.</p>
      <p class="misinfo-note">Social media content requires special handling. Use the extension popup to manually select and analyze specific posts.</p>
      <div class="misinfo-actions">
        <button class="misinfo-btn misinfo-btn-primary" id="misinfo-manual-btn">Manual Analysis</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  document.getElementById('misinfo-close-btn').addEventListener('click', removeOverlay);
  document.getElementById('misinfo-manual-btn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'openPopup' });
    removeOverlay();
  });
  
  // Auto-hide after 10 seconds
  setTimeout(removeOverlay, 10000);
}

/**
 * Show overlay for multiple articles
 */
function showMultiArticleOverlay(articleCount) {
  removeOverlay();
  
  const overlay = document.createElement('div');
  overlay.id = 'misinfo-detector-overlay';
  overlay.className = 'misinfo-overlay';
  overlay.innerHTML = `
    <div class="misinfo-loading">
      <div class="misinfo-spinner"></div>
      <p>Analyzing ${articleCount} articles...</p>
      <p class="misinfo-loading-sub">Checking each article separately</p>
    </div>
  `;
  
  document.body.appendChild(overlay);
}

/**
 * Display multiple article results
 */
function displayMultipleResults(results, extractedContent) {
  removeOverlay();
  
  const overlay = document.createElement('div');
  overlay.id = 'misinfo-detector-overlay';
  overlay.className = 'misinfo-overlay misinfo-overlay-large';
  
  const resultsHTML = results.map((item, index) => {
    const classification = item.result.classification.toLowerCase();
    const colorMap = {
      'verified': '#10b981',
      'true': '#10b981',
      'misleading': '#f59e0b',
      'questionable': '#f59e0b',
      'false': '#ef4444',
      'misinformation': '#ef4444',
      'satire': '#8b5cf6'
    };
    const color = colorMap[classification] || '#6b7280';
    const confidence = Math.round(item.result.confidence * 100);
    
    return `
      <div class="misinfo-article-result" style="border-left: 4px solid ${color};">
        <div class="misinfo-article-header">
          <span class="misinfo-article-icon">${getClassificationIcon(classification)}</span>
          <span class="misinfo-article-title">${item.title || `Article ${index + 1}`}</span>
        </div>
        <div class="misinfo-article-verdict">
          <span class="misinfo-verdict-label" style="color: ${color};">${capitalize(classification)}</span>
          <span class="misinfo-verdict-confidence">${confidence}%</span>
        </div>
      </div>
    `;
  }).join('');
  
  overlay.innerHTML = `
    <div class="misinfo-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
      <div class="misinfo-title">
        <span class="misinfo-icon">📰</span>
        <span class="misinfo-label">Multiple Articles Analyzed</span>
      </div>
      <button class="misinfo-close" id="misinfo-close-btn">×</button>
    </div>
    <div class="misinfo-body">
      <p class="misinfo-multi-summary">Found and analyzed ${results.length} articles on this page:</p>
      <div class="misinfo-articles-container">
        ${resultsHTML}
      </div>
      <div class="misinfo-actions">
        <button class="misinfo-btn misinfo-btn-secondary" id="misinfo-details-btn">View All Details</button>
        <button class="misinfo-btn misinfo-btn-secondary" id="misinfo-close-btn-2">Close</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  document.getElementById('misinfo-close-btn').addEventListener('click', removeOverlay);
  document.getElementById('misinfo-close-btn-2').addEventListener('click', removeOverlay);
  document.getElementById('misinfo-details-btn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'openDetailsView', data: { multiArticle: true, results } });
  });
}

/**
 * Show error overlay
 */
function showErrorOverlay(errorMessage) {
  removeOverlay();
  
  const overlay = document.createElement('div');
  overlay.id = 'misinfo-detector-overlay';
  overlay.className = 'misinfo-overlay';
  overlay.innerHTML = `
    <div class="misinfo-header" style="background-color: #ef4444;">
      <div class="misinfo-title">
        <span class="misinfo-icon">⚠️</span>
        <span class="misinfo-label">Analysis Failed</span>
      </div>
      <button class="misinfo-close" id="misinfo-close-btn">×</button>
    </div>
    <div class="misinfo-body">
      <p>Unable to analyze this content. Please try again later.</p>
      <p class="misinfo-error-details">${errorMessage}</p>
      <button class="misinfo-btn misinfo-btn-primary" id="misinfo-retry-btn">Retry</button>
    </div>
  `;
  
  document.body.appendChild(overlay);
  document.getElementById('misinfo-close-btn').addEventListener('click', removeOverlay);
  document.getElementById('misinfo-retry-btn').addEventListener('click', () => {
    removeOverlay();
    analyzeCurrentPage();
  });
}

/**
 * Remove overlay from page
 */
function removeOverlay() {
  const existing = document.getElementById('misinfo-detector-overlay');
  if (existing) {
    existing.remove();
  }
}

/**
 * Highlight suspicious lines on the page
 */
function highlightSuspiciousLines(suspiciousSentences) {
  console.log('🔍 Highlighting suspicious lines:', suspiciousSentences);
  
  // Remove any existing highlights first
  removeHighlights();
  
  if (!suspiciousSentences || suspiciousSentences.length === 0) {
    console.log('⚠️ No suspicious sentences to highlight');
    return;
  }
  
  let highlightCount = 0;
  
  // Find all paragraph elements on the page
  const paragraphs = document.querySelectorAll('p, .sp-cn p, article p, .article-content p');
  
  paragraphs.forEach((paragraph) => {
    const originalText = paragraph.textContent;
    let modifiedHTML = paragraph.innerHTML;
    let wasModified = false;
    
    // Check each suspicious sentence
    suspiciousSentences.forEach((suspiciousData) => {
      // Handle both string and object formats
      const suspiciousText = typeof suspiciousData === 'string' 
        ? suspiciousData 
        : suspiciousData.sentence || suspiciousData.text;
      
      const reason = typeof suspiciousData === 'object' 
        ? suspiciousData.reason || 'Potentially misleading'
        : 'Potentially misleading';
      
      const suspicionScore = typeof suspiciousData === 'object' 
        ? suspiciousData.score || 0.5
        : 0.5;
      
      // Normalize the text for comparison (remove extra spaces, normalize quotes)
      const normalizedOriginal = originalText.replace(/\s+/g, ' ').trim();
      const normalizedSuspicious = suspiciousText.replace(/\s+/g, ' ').trim();
      
      // Check if the suspicious text is in this paragraph
      if (normalizedOriginal.includes(normalizedSuspicious)) {
        console.log('✓ Found match in paragraph:', suspiciousText.substring(0, 50) + '...');
        
        // Determine highlight color based on suspicion score
        let highlightColor = '#fef3c7'; // Default yellow
        let borderColor = '#f59e0b';
        
        if (suspicionScore >= 0.8) {
          highlightColor = '#fee2e2'; // Red for high suspicion
          borderColor = '#ef4444';
        } else if (suspicionScore >= 0.6) {
          highlightColor = '#fed7aa'; // Orange for medium-high
          borderColor = '#f97316';
        }
        
        // Create a regex to find the exact text (case-insensitive, flexible whitespace)
        const escapedText = suspiciousText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const flexiblePattern = escapedText.replace(/\s+/g, '\\s+');
        const regex = new RegExp(`(${flexiblePattern})`, 'gi');
        
        // Wrap the suspicious text in a highlight span
        modifiedHTML = modifiedHTML.replace(regex, (match) => {
          highlightCount++;
          return `<mark class="misinfo-highlight" 
                       style="background-color: ${highlightColor}; 
                              border-left: 3px solid ${borderColor}; 
                              padding: 2px 4px; 
                              margin: 0 2px;
                              border-radius: 3px;
                              cursor: help;"
                       title="${reason} (Confidence: ${Math.round(suspicionScore * 100)}%)"
                       data-suspicious="true">${match}</mark>`;
        });
        
        wasModified = true;
      }
    });
    
    // Update the paragraph HTML if we made changes
    if (wasModified) {
      paragraph.innerHTML = modifiedHTML;
      
      // Scroll to the first highlight if this is the first one
      if (highlightCount === 1) {
        paragraph.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  });
  
  console.log(`✅ Highlighted ${highlightCount} suspicious sentence(s) on the page`);
  
  // Show a notification
  if (highlightCount > 0) {
    showHighlightNotification(highlightCount);
  } else {
    console.warn('⚠️ Could not find suspicious sentences on page. Text may have changed.');
  }
}

/**
 * Remove all highlights from the page
 */
function removeHighlights() {
  const highlights = document.querySelectorAll('.misinfo-highlight');
  highlights.forEach(highlight => {
    // Replace the highlight with just its text content
    const text = highlight.textContent;
    highlight.replaceWith(text);
  });
  
  // Remove notification if it exists
  const notification = document.getElementById('misinfo-highlight-notification');
  if (notification) {
    notification.remove();
  }
}

/**
 * Show notification when highlights are added
 */
function showHighlightNotification(count) {
  // Remove existing notification
  const existing = document.getElementById('misinfo-highlight-notification');
  if (existing) {
    existing.remove();
  }
  
  const notification = document.createElement('div');
  notification.id = 'misinfo-highlight-notification';
  notification.className = 'misinfo-highlight-notification';
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">✓</span>
      <span class="notification-text">Highlighted ${count} suspicious sentence${count > 1 ? 's' : ''} on page</span>
      <button class="notification-close" id="remove-highlights-btn">✕ Remove</button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Add remove button listener
  document.getElementById('remove-highlights-btn').addEventListener('click', () => {
    removeHighlights();
  });
  
  // Auto-hide after 10 seconds
  setTimeout(() => {
    if (notification && notification.parentElement) {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }
  }, 10000);
}

/**
 * Show detailed analysis view
 */
function showDetails(result) {
  chrome.runtime.sendMessage({
    action: 'openDetailsView',
    data: result
  });
}

/**
 * Show feedback form
 */
function showFeedbackForm(result) {
  // TODO: Implement feedback form
  alert('Feedback form coming soon!');
}

/**
 * Utility Functions
 */

function getClassificationIcon(classification) {
  const icons = {
    'verified': '✓',
    'true': '✓',
    'misleading': '⚠',
    'questionable': '⚠',
    'false': '✗',
    'misinformation': '✗',
    'satire': '😄'
  };
  return icons[classification] || '?';
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function generateHash(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text.substring(0, 1000)); // Use first 1000 chars
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function detectLanguage(text) {
  // Simple language detection based on character sets
  // TODO: Implement more sophisticated language detection
  const sample = text.substring(0, 100);
  
  // Check for non-Latin scripts
  if (/[\u0900-\u097F]/.test(sample)) return 'hi'; // Hindi
  if (/[\u4E00-\u9FFF]/.test(sample)) return 'zh'; // Chinese
  if (/[\u0600-\u06FF]/.test(sample)) return 'ar'; // Arabic
  
  return 'en'; // Default to English
}

async function fetchWithTimeout(url, options, timeout) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Message received:', request);
  
  if (request.action === 'openAISearch') {
    console.log('🔍 Opening AI Search popup...');
    
    // Initialize if not already done
    if (!aiSearchPopup) {
      console.log('Initializing AI Search popup for the first time...');
      aiSearchPopup = new AISearchPopup();
    }
    
    // Show the popup
    aiSearchPopup.show();
    console.log('✅ AI Search popup shown');
    
    sendResponse({ success: true });
  } else if (request.action === 'analyzeCurrentPage') {
    detectAndAnalyzeContent().then(sendResponse);
    return true; // Keep channel open for async response
  } else if (request.action === 'analyzeNow') {
    detectAndAnalyzeContent().then(sendResponse);
    return true;
  }
  
  return false;
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
