/**
 * Popup Script - Handles user interactions in the extension popup
 */

// DOM Elements
const statusSection = document.getElementById('status-section');
const statusIcon = document.getElementById('status-icon');
const statusTitleText = document.getElementById('status-title-text');
const statusMessage = document.getElementById('status-message');
const analyzeBtn = document.getElementById('analyze-btn');
const historyBtn = document.getElementById('history-btn');
const autoAnalyzeToggle = document.getElementById('auto-analyze-toggle');
const sensitivitySelect = document.getElementById('sensitivity-select');
const helpLink = document.getElementById('help-link');
const aboutLink = document.getElementById('about-link');

/**
 * Initialize popup
 */
async function init() {
  // Load settings
  await loadSettings();

  // Get current page info
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (tab) {
    updateStatusForPage(tab);
  }

  // Setup event listeners
  setupEventListeners();
}

/**
 * Load settings from storage
 */
async function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(
      ['autoAnalyze', 'sensitivity'],
      (result) => {
        autoAnalyzeToggle.checked = result.autoAnalyze !== false;
        sensitivitySelect.value = result.sensitivity || 'moderate';
        resolve();
      }
    );
  });
}

/**
 * Update status for current page
 */
async function updateStatusForPage(tab) {
  try {
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'getPageInfo'
    });

    if (response && response.hasContent) {
      setStatus('ready', 'Ready to Analyze', 
        'This page contains analyzable content. Click the button below to check for misinformation.');
      analyzeBtn.disabled = false;
    } else {
      setStatus('info', 'No Content Detected',
        'This page doesn\'t contain analyzable content (news article, blog post, etc.).');
      analyzeBtn.disabled = true;
    }
  } catch (error) {
    console.error('Failed to get page info:', error);
    setStatus('info', 'Page Not Ready',
      'Waiting for page to load or this page cannot be analyzed.');
    analyzeBtn.disabled = true;
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Analyze button - Now opens AI Search
  analyzeBtn.addEventListener('click', async () => {
    console.log('🔍 Open AI Fact Checker button clicked');
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      console.log('Current tab:', tab);
      
      // Open AI Search popup on the page
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'openAISearch'
      });
      
      console.log('Response from content script:', response);

      // Close the extension popup after a short delay
      setTimeout(() => {
        window.close();
      }, 100);
    } catch (error) {
      console.error('Failed to open AI Search:', error);
      alert('Please refresh the page and try again.\n\nError: ' + error.message);
    }
  });

  // History button
  historyBtn.addEventListener('click', async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'getHistory'
      });

      if (response.history && response.history.length > 0) {
        showHistory(response.history);
      } else {
        alert('No analysis history yet. Analyze some pages to build your history!');
      }
    } catch (error) {
      console.error('Failed to get history:', error);
    }
  });

  // Auto-analyze toggle
  autoAnalyzeToggle.addEventListener('change', async () => {
    try {
      await chrome.runtime.sendMessage({
        action: 'updateSettings',
        settings: { autoAnalyze: autoAnalyzeToggle.checked }
      });
      
      console.log('Auto-analyze:', autoAnalyzeToggle.checked);
    } catch (error) {
      console.error('Failed to update setting:', error);
    }
  });

  // Sensitivity select
  sensitivitySelect.addEventListener('change', async () => {
    try {
      await chrome.runtime.sendMessage({
        action: 'updateSettings',
        settings: { sensitivity: sensitivitySelect.value }
      });
      
      console.log('Sensitivity:', sensitivitySelect.value);
    } catch (error) {
      console.error('Failed to update setting:', error);
    }
  });

  // Help link
  helpLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({
      url: 'https://github.com/yourusername/misinformation-detector#usage'
    });
  });

  // About link
  aboutLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({
      url: 'https://github.com/yourusername/misinformation-detector'
    });
  });
}

/**
 * Set status message
 */
function setStatus(type, title, message) {
  const icons = {
    'ready': '✅',
    'success': '✅',
    'error': '❌',
    'warning': '⚠️',
    'info': 'ℹ️',
    'loading': '⏳'
  };

  const colors = {
    'ready': '#10b981',
    'success': '#10b981',
    'error': '#ef4444',
    'warning': '#f59e0b',
    'info': '#3b82f6',
    'loading': '#6b7280'
  };

  statusIcon.textContent = icons[type] || 'ℹ️';
  statusTitleText.textContent = title;
  statusMessage.textContent = message;
  statusSection.style.borderLeft = `4px solid ${colors[type] || '#6b7280'}`;
}

/**
 * Show analysis history
 */
function showHistory(history) {
  // Create a simple history view
  const historyHtml = history.map((item, index) => `
    <div style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
      <div style="font-weight: 600; font-size: 13px;">${item.title || 'Untitled'}</div>
      <div style="font-size: 11px; color: #6b7280;">
        ${item.result.classification} (${Math.round(item.result.confidence * 100)}%)
        - ${new Date(item.timestamp).toLocaleDateString()}
      </div>
    </div>
  `).join('');

  // For now, just show in alert
  // TODO: Create a dedicated history page
  console.log('History:', history);
  alert(`Analysis History:\n\n${history.map((item, i) => 
    `${i + 1}. ${item.title}\n   ${item.result.classification} (${Math.round(item.result.confidence * 100)}%)`
  ).join('\n\n')}`);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
