/**
 * Background Service Worker - Handles API communication and state management
 * Runs persistently in the background
 */

// ========================================
// 🔧 SERVER CONFIGURATION
// ========================================
// IMPORTANT: Update this URL to match your server's IP address and port
// Examples:
//   - Local testing: 'http://localhost:8000/api/v1'
//   - Same network: 'http://192.168.1.100:8000/api/v1' (replace with actual server IP)
//   - Production: 'https://your-domain.com/api/v1'
// 
// To find your server's IP:
//   - Windows: Open CMD and type 'ipconfig'
//   - Mac/Linux: Open Terminal and type 'ifconfig' or 'ip addr'
//   - Look for 'IPv4 Address' under your network adapter
// ========================================

const CONFIG = {
  API_BASE_URL: 'http://10.25.26.187:8002/api/v1', // 👈 Friend's laptop IP (PORT 8002!)
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};

// State
let analysisHistory = [];
let settings = {
  autoAnalyze: true,
  sensitivity: 'moderate',
  whitelistedDomains: [],
  blacklistedDomains: []
};

/**
 * Initialize extension
 */
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Misinformation Detector installed');
    
    // Set default settings
    chrome.storage.sync.set({
      autoAnalyze: true,
      sensitivity: 'moderate',
      whitelistedDomains: [],
      blacklistedDomains: []
    });

    // Welcome message in console instead of opening tab
    console.log('🎉 Welcome to Misinformation Detector!');
    console.log('Click the extension icon to get started.');
  } else if (details.reason === 'update') {
    console.log('Misinformation Detector updated');
  }
});

/**
 * Load settings from storage
 */
async function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(
      ['autoAnalyze', 'sensitivity', 'whitelistedDomains', 'blacklistedDomains'],
      (result) => {
        settings = {
          autoAnalyze: result.autoAnalyze !== false,
          sensitivity: result.sensitivity || 'moderate',
          whitelistedDomains: result.whitelistedDomains || [],
          blacklistedDomains: result.blacklistedDomains || []
        };
        resolve(settings);
      }
    );
  });
}

/**
 * Handle messages from content script and popup
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request.action);

  switch (request.action) {
    case 'analyzeContent':
      handleAnalyzeRequest(request.data, sender.tab.id)
        .then(sendResponse)
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true; // Keep channel open for async response

    case 'getSettings':
      loadSettings().then(sendResponse);
      return true;

    case 'updateSettings':
      updateSettings(request.settings)
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'getHistory':
      sendResponse({ history: analysisHistory });
      return false;

    case 'clearHistory':
      analysisHistory = [];
      sendResponse({ success: true });
      return false;

    case 'submitFeedback':
      handleFeedback(request.feedback)
        .then(sendResponse)
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'openDetailsView':
      openDetailsView(request.data);
      sendResponse({ success: true });
      return false;

    default:
      console.warn('Unknown action:', request.action);
      sendResponse({ success: false, error: 'Unknown action' });
      return false;
  }
});

/**
 * Handle content analysis request
 */
async function handleAnalyzeRequest(data, tabId) {
  try {
    // Check if domain is blacklisted
    const url = new URL(data.url);
    if (settings.blacklistedDomains.includes(url.hostname)) {
      return {
        success: false,
        error: 'Domain is blacklisted'
      };
    }

    // Make API request
    const result = await makeAnalysisRequest(data);

    // Add to history
    analysisHistory.unshift({
      url: data.url,
      title: data.title,
      result: result,
      timestamp: new Date().toISOString()
    });

    // Keep only last 50 items
    if (analysisHistory.length > 50) {
      analysisHistory = analysisHistory.slice(0, 50);
    }

    // Show badge
    updateBadge(tabId, result.classification);

    return {
      success: true,
      result: result
    };

  } catch (error) {
    console.error('Analysis request failed:', error);
    throw error;
  }
}

/**
 * Make API request with retry logic
 */
async function makeAnalysisRequest(data, attempt = 1) {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: data.text,
        url: data.url,
        title: data.title,
        language: data.language
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();

  } catch (error) {
    if (attempt < CONFIG.RETRY_ATTEMPTS) {
      console.log(`Retry attempt ${attempt + 1}...`);
      await sleep(CONFIG.RETRY_DELAY * attempt);
      return makeAnalysisRequest(data, attempt + 1);
    }
    throw error;
  }
}

/**
 * Handle user feedback submission
 */
async function handleFeedback(feedback) {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(feedback)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();

  } catch (error) {
    console.error('Feedback submission failed:', error);
    throw error;
  }
}

/**
 * Update extension settings
 */
async function updateSettings(newSettings) {
  settings = { ...settings, ...newSettings };
  
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set(settings, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        console.log('Settings updated:', settings);
        resolve();
      }
    });
  });
}

/**
 * Update extension badge
 */
function updateBadge(tabId, classification) {
  const badgeConfig = {
    'verified': { text: '✓', color: '#10b981' },
    'true': { text: '✓', color: '#10b981' },
    'misleading': { text: '!', color: '#f59e0b' },
    'questionable': { text: '?', color: '#f59e0b' },
    'false': { text: '✗', color: '#ef4444' },
    'misinformation': { text: '✗', color: '#ef4444' },
    'satire': { text: '😄', color: '#8b5cf6' }
  };

  const config = badgeConfig[classification.toLowerCase()] || { text: '?', color: '#6b7280' };

  chrome.action.setBadgeText({
    text: config.text,
    tabId: tabId
  });

  chrome.action.setBadgeBackgroundColor({
    color: config.color,
    tabId: tabId
  });
}

/**
 * Open details view in new tab
 */
function openDetailsView(data) {
  // TODO: Create a detailed analysis page
  console.log('Opening details view:', data);
  
  // For now, just log the data
  // In future, open a dedicated page with full analysis
}

/**
 * Utility: Sleep function
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Initialize
loadSettings();
console.log('Background service worker initialized');
