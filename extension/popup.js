// Popup script for AI Fact Checker
console.log('🚀 AI Fact Checker popup loaded');

// DOM elements
const searchInput = document.getElementById('searchInput');
const clearBtn = document.getElementById('clearBtn');
const analyzeBtn = document.getElementById('analyzeBtn');
const statusMessage = document.getElementById('statusMessage');
const resultsSection = document.getElementById('resultsSection');
const resultsContent = document.getElementById('resultsContent');
const quickActionChips = document.querySelectorAll('.quick-action-chip');

// State
let isAnalyzing = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  checkServerConnection();
});

function setupEventListeners() {
  // Search input
  searchInput.addEventListener('input', (e) => {
    const hasValue = e.target.value.trim().length > 0;
    clearBtn.style.display = hasValue ? 'block' : 'none';
    analyzeBtn.disabled = !hasValue;
  });

  // Enter key to analyze
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && searchInput.value.trim()) {
      handleAnalyze();
    }
  });

  // Clear button
  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.style.display = 'none';
    analyzeBtn.disabled = true;
    searchInput.focus();
    hideResults();
  });

  // Analyze button
  analyzeBtn.addEventListener('click', handleAnalyze);

  // Quick action chips
  quickActionChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const action = chip.dataset.action;
      handleQuickAction(action);
    });
  });
}

async function handleAnalyze() {
  const input = searchInput.value.trim();
  if (!input || isAnalyzing) return;

  console.log('🔍 Analyzing:', input);

  // Determine if URL or text
  const isURL = isValidURL(input);
  
  if (isURL) {
    await analyzeURL(input);
  } else {
    await analyzeText(input);
  }
}

async function handleQuickAction(action) {
  if (action === 'current-page') {
    await analyzeCurrentPage();
  } else if (action === 'example') {
    const exampleText = "NASA announced that the moon landing was faked in 1969.";
    searchInput.value = exampleText;
    clearBtn.style.display = 'block';
    analyzeBtn.disabled = false;
    searchInput.focus();
  }
}

async function analyzeCurrentPage() {
  try {
    isAnalyzing = true;
    showStatus('Analyzing current page...', 'info');
    showLoading('Extracting and analyzing page content...');

    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Send message to content script
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'analyzeCurrentPage'
    });

    if (response && response.success) {
      showStatus('Analysis complete!', 'success');
      displayResults(response.result);
    } else {
      throw new Error('Failed to analyze page');
    }
  } catch (error) {
    console.error('❌ Error analyzing page:', error);
    showError('Could not analyze page', error.message);
  } finally {
    isAnalyzing = false;
  }
}

async function analyzeText(text) {
  try {
    isAnalyzing = true;
    showStatus('Analyzing text...', 'info');
    showLoading('Checking for misinformation...');

    // Send to server
    const response = await fetch('http://10.25.26.187:8002/api/v1/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: text,
        url: null,
        source: 'popup'
      })
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const result = await response.json();
    showStatus('Analysis complete!', 'success');
    displayResults(result);

  } catch (error) {
    console.error('❌ Error analyzing text:', error);
    showError('Analysis failed', error.message);
  } finally {
    isAnalyzing = false;
  }
}

async function analyzeURL(url) {
  try {
    isAnalyzing = true;
    showStatus('Fetching URL content...', 'info');
    showLoading('Downloading and analyzing page...');

    // Get current tab to send message from
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Send to background script to fetch
    const response = await chrome.runtime.sendMessage({
      action: 'fetchAndAnalyze',
      url: url
    });

    if (response && response.success) {
      showStatus('Analysis complete!', 'success');
      displayResults(response.result);
    } else {
      throw new Error(response.error || 'Failed to analyze URL');
    }
  } catch (error) {
    console.error('❌ Error analyzing URL:', error);
    showError('Could not analyze URL', error.message);
  } finally {
    isAnalyzing = false;
  }
}

function displayResults(result) {
  console.log('📊 Displaying results:', result);

  resultsSection.classList.remove('hidden');

  // Determine status
  let statusClass = 'verified';
  let statusText = '✓ Verified';
  let statusIcon = '✓';

  if (result.confidence < 0.4) {
    statusClass = 'false';
    statusText = '✗ Likely False';
    statusIcon = '✗';
  } else if (result.confidence < 0.7) {
    statusClass = 'questionable';
    statusText = '⚠ Questionable';
    statusIcon = '⚠';
  }

  const confidencePercent = Math.round(result.confidence * 100);

  let html = `
    <div class="result-card">
      <div class="result-status ${statusClass}">
        <span>${statusIcon}</span>
        <span>${statusText}</span>
      </div>
      
      <div class="result-confidence">
        Confidence: ${confidencePercent}%
        <div class="confidence-bar">
          <div class="confidence-fill" style="width: ${confidencePercent}%"></div>
        </div>
      </div>

      ${result.explanation ? `
        <div class="result-details">
          <strong>Analysis:</strong><br>
          ${result.explanation}
        </div>
      ` : ''}
  `;

  // 🚨 NEW: CRISIS DETECTION DISPLAY
  if (result.crisis_type && result.crisis_type !== 'none') {
    // Crisis type badge with emoji
    const crisisEmoji = {
      'pandemic': '🦠',
      'earthquake': '🌍',
      'flood': '🌊',
      'hurricane': '🌪️',
      'war': '⚔️',
      'attack': '💥'
    };
    
    // Severity color
    const severityColors = {
      'critical': '#dc2626',
      'high': '#f59e0b',
      'medium': '#3b82f6',
      'low': '#10b981'
    };
    
    const emoji = crisisEmoji[result.crisis_type] || '⚠️';
    const severityColor = severityColors[result.crisis_severity] || '#6b7280';
    
    html += `
      <div style="background: linear-gradient(135deg, #fef2f2 0%, #fff7ed 100%); 
                  border-left: 4px solid ${severityColor}; 
                  padding: 14px; border-radius: 8px; margin-top: 16px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span style="font-size: 24px;">${emoji}</span>
          <div>
            <div style="font-weight: 600; color: #1f2937; font-size: 14px;">
              CRISIS DETECTED: ${result.crisis_type.toUpperCase()}
            </div>
            <div style="font-size: 12px; color: ${severityColor}; font-weight: 600; margin-top: 2px;">
              Severity: ${result.crisis_severity.toUpperCase()}
            </div>
          </div>
        </div>
        
        ${result.public_summary ? `
          <div style="background: white; padding: 10px; border-radius: 6px; 
                      font-size: 13px; color: #374151; line-height: 1.5; margin-top: 10px;">
            ${result.public_summary}
          </div>
        ` : ''}
      </div>
    `;
  }

  // 🏛️ NEW: OFFICIAL SOURCE VERIFICATION
  if (result.official_source_verification) {
    const official = result.official_source_verification;
    
    // Verdict colors
    const verdictColors = {
      'VERIFIED': '#10b981',
      'PARTIALLY VERIFIED': '#3b82f6',
      'UNVERIFIED': '#f59e0b',
      'CONTRADICTS OFFICIAL SOURCES': '#dc2626',
      'NOT CRISIS-RELATED': '#6b7280'
    };
    
    const verdictColor = verdictColors[official.verdict] || '#6b7280';
    const verdictIcon = official.verdict === 'VERIFIED' ? '✅' : 
                       official.verdict === 'UNVERIFIED' ? '⚠️' : 
                       official.verdict?.includes('CONTRADICT') ? '❌' : 'ℹ️';
    
    html += `
      <div class="result-details" style="margin-top: 16px; 
                  background: #f0fdf4; border-left: 3px solid ${verdictColor}; 
                  padding: 12px; border-radius: 6px;">
        <strong style="display: flex; align-items: center; gap: 6px;">
          <span>${verdictIcon}</span>
          <span>Official Source Verification: ${official.verdict}</span>
        </strong>
        
        ${official.summary ? `
          <div style="font-size: 12px; color: #065f46; margin-top: 8px;">
            ${official.summary}
          </div>
        ` : ''}
        
        ${official.official_sources && official.official_sources.length > 0 ? `
          <div style="margin-top: 10px; background: white; padding: 10px; border-radius: 6px;">
            <div style="font-size: 11px; font-weight: 600; color: #047857; margin-bottom: 6px;">
              VERIFIED BY:
            </div>
        ` : ''}
    `;
    
    if (official.official_sources && official.official_sources.length > 0) {
      official.official_sources.forEach(source => {
        const orgEmoji = {
          'WHO': '🏥',
          'UN': '🌐',
          'USGS': '🌍',
          'CDC': '🏥',
          'ICRC': '🏥',
          'Red Cross': '🏥',
          'Amnesty': '⚖️',
          'NOAA': '🌊'
        };
        
        const emoji = orgEmoji[source.organization] || '🏛️';
        const matchIcon = source.matches_article === true ? '✓' : 
                         source.matches_article === false ? '✗' : 'ℹ️';
        
        html += `
          <div style="background: #f9fafb; padding: 8px; border-radius: 4px; 
                      margin-bottom: 6px; font-size: 12px;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
              <span>${emoji}</span>
              <strong style="color: #1f2937;">${source.organization}</strong>
              ${source.matches_article !== null ? `<span style="color: ${source.matches_article ? '#10b981' : '#ef4444'};">${matchIcon}</span>` : ''}
            </div>
            
            ${source.statement ? `
              <div style="color: #6b7280; font-size: 11px; margin-bottom: 4px;">
                ${source.statement}
              </div>
            ` : ''}
            
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10px;">
              ${source.published ? `<span style="color: #9ca3af;">📅 ${source.published}</span>` : '<span></span>'}
              ${source.url ? `
                <a href="${source.url}" target="_blank" 
                   style="color: #3b82f6; text-decoration: none; font-weight: 500;">
                  View Source →
                </a>
              ` : ''}
            </div>
          </div>
        `;
      });
      
      html += `</div>`;
    }
    
    html += `</div>`;
  }

  // ⚖️ NEW: BIAS DETECTION (for war news)
  if (result.bias_detection && result.bias_detection.bias_detected) {
    const bias = result.bias_detection;
    
    html += `
      <div class="result-details" style="margin-top: 16px; 
                  background: #fef2f2; border-left: 3px solid #dc2626; 
                  padding: 12px; border-radius: 6px;">
        <strong style="color: #991b1b;">⚖️ Potential Bias Detected</strong>
        
        ${bias.bias_indicators && bias.bias_indicators.length > 0 ? `
          <div style="margin-top: 8px; font-size: 12px; color: #7f1d1d;">
            ${bias.bias_indicators.map(indicator => `
              <div style="margin-top: 4px;">• ${indicator}</div>
            `).join('')}
          </div>
        ` : ''}
        
        ${bias.recommendation ? `
          <div style="background: white; padding: 10px; border-radius: 6px; 
                      margin-top: 10px; font-size: 12px; color: #991b1b; font-weight: 500;">
            ${bias.recommendation}
          </div>
        ` : ''}
      </div>
    `;
  }

  html += `</div>`;

  // Suspicious sentences
  if (result.suspicious_sentences && result.suspicious_sentences.length > 0) {
    html += `
      <div class="result-details" style="margin-top: 16px;">
        <strong>⚠️ Suspicious Sentences (${result.suspicious_sentences.length}):</strong>
        <div style="margin-top: 8px;">
    `;
    
    result.suspicious_sentences.slice(0, 3).forEach((item, index) => {
      const scorePercent = Math.round((item.score || 0.5) * 100);
      html += `
        <div style="background: #fef2f2; padding: 10px; border-radius: 6px; margin-bottom: 8px; border-left: 3px solid #ef4444;">
          <div style="font-size: 13px; color: #991b1b; margin-bottom: 4px;">
            "${item.sentence.substring(0, 100)}${item.sentence.length > 100 ? '...' : ''}"
          </div>
          <div style="font-size: 11px; color: #dc2626;">
            ${item.reason} (${scorePercent}% confidence)
          </div>
        </div>
      `;
    });
    
    html += `</div></div>`;
  }

  // Emotional manipulation detection
  if (result.emotional_analysis) {
    const emo = result.emotional_analysis;
    if (emo.manipulation_detected) {
      const manipScore = Math.round(emo.manipulation_score * 100);
      html += `
        <div class="result-details" style="margin-top: 16px; background: #fff7ed; border-left: 3px solid #f59e0b; padding: 12px; border-radius: 6px;">
          <strong>😡 Emotional Manipulation Detected</strong><br>
          <div style="font-size: 12px; color: #92400e; margin-top: 6px;">
            ${emo.warning || `Article uses excessive emotional language (${manipScore}% score)`}
          </div>
        </div>
      `;
    }
  }

  // Image verification results
  if (result.image_verification && result.image_verification.length > 0) {
    html += `
      <div class="result-details" style="margin-top: 16px;">
        <strong>🖼️ Image Verification:</strong>
        <div style="margin-top: 8px;">
    `;
    
    result.image_verification.forEach((img, index) => {
      const match = img.caption_match;
      const matchPercent = Math.round((match?.confidence || 0) * 100);
      const matchColor = match?.matches_caption ? '#10b981' : '#ef4444';
      const matchIcon = match?.matches_caption ? '✓' : '✗';
      
      html += `
        <div style="background: #f9fafb; padding: 10px; border-radius: 6px; margin-bottom: 8px;">
          <div style="font-size: 12px; color: #374151; margin-bottom: 4px;">
            ${matchIcon} Image ${index + 1}: ${match?.matches_caption ? 'Matches caption' : 'Does NOT match caption'} (${matchPercent}%)
          </div>
          ${match?.warning ? `
            <div style="font-size: 11px; color: #dc2626;">
              ⚠️ ${match.warning}
            </div>
          ` : ''}
          ${img.ai_generated?.is_ai ? `
            <div style="font-size: 11px; color: #dc2626; margin-top: 4px;">
              ⚠️ Image may be AI-generated (${Math.round(img.ai_generated.confidence * 100)}% confidence)
            </div>
          ` : ''}
        </div>
      `;
    });
    
    html += `</div></div>`;
  }

  // News cross-reference
  if (result.news_crossref) {
    const news = result.news_crossref;
    const verdictColor = news.verdict?.includes('VERIFIED') ? '#10b981' : 
                        news.verdict?.includes('LIKELY') ? '#f59e0b' : '#ef4444';
    
    html += `
      <div class="result-details" style="margin-top: 16px; background: #f0fdf4; border-left: 3px solid ${verdictColor}; padding: 12px; border-radius: 6px;">
        <strong>📰 News Verification: ${news.verdict || 'Unknown'}</strong><br>
    `;
    
    if (news.credible_sources && news.credible_sources.length > 0) {
      html += `
        <div style="font-size: 12px; color: #065f46; margin-top: 8px;">
          ✓ Found in ${news.credible_sources.length} credible source(s):
        </div>
        <div style="margin-top: 6px;">
      `;
      
      news.credible_sources.forEach(source => {
        html += `
          <div style="font-size: 11px; color: #047857; margin-top: 4px;">
            • ${source.name} ${source.published ? `(${source.published})` : ''}
          </div>
        `;
      });
      
      html += `</div>`;
    } else {
      html += `
        <div style="font-size: 12px; color: #dc2626; margin-top: 6px;">
          ⚠️ Story NOT found in major credible news sources
        </div>
      `;
    }
    
    html += `</div>`;
  }

  // Entity verification
  if (result.entity_verification) {
    const entities = result.entity_verification;
    if (entities.verified && Object.keys(entities.verified).length > 0) {
      html += `
        <div class="result-details" style="margin-top: 16px;">
          <strong>🔍 Entity Verification:</strong>
          <div style="margin-top: 8px; font-size: 12px;">
      `;
      
      Object.entries(entities.verified).slice(0, 3).forEach(([entity, data]) => {
        const icon = data.exists ? '✓' : '✗';
        const color = data.exists ? '#059669' : '#dc2626';
        
        html += `
          <div style="color: ${color}; margin-bottom: 6px;">
            ${icon} <strong>${entity}</strong>: ${data.exists ? 'Verified' : 'Not found in Wikipedia'}
          </div>
        `;
      });
      
      html += `</div></div>`;
    }
  }

  // Key phrases (legacy support)
  if (result.key_phrases && result.key_phrases.length > 0 && !result.suspicious_sentences) {
    html += `
      <div class="result-details" style="margin-top: 12px;">
        <strong>Key Phrases:</strong><br>
        ${result.key_phrases.slice(0, 3).join(', ')}
      </div>
    `;
  }

  html += `</div>`;
  
  resultsContent.innerHTML = html;
}

function showLoading(message = 'Analyzing...') {
  resultsSection.classList.remove('hidden');
  resultsContent.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <div class="loading-text">${message}</div>
    </div>
  `;
}

function showError(title, message) {
  resultsSection.classList.remove('hidden');
  resultsContent.innerHTML = `
    <div class="error-state">
      <div class="error-title">
        <span>⚠️</span>
        <span>${title}</span>
      </div>
      <div class="error-message">${message}</div>
    </div>
  `;
}

function hideResults() {
  resultsSection.classList.add('hidden');
  resultsContent.innerHTML = '';
}

function showStatus(message, type = 'info') {
  statusMessage.textContent = message;
  statusMessage.className = 'status-message';
  
  if (type === 'success') {
    statusMessage.style.background = '#d1fae5';
    statusMessage.style.borderColor = '#a7f3d0';
    statusMessage.style.color = '#065f46';
  } else if (type === 'error') {
    statusMessage.style.background = '#fef2f2';
    statusMessage.style.borderColor = '#fecaca';
    statusMessage.style.color = '#991b1b';
  } else {
    statusMessage.style.background = '#eff6ff';
    statusMessage.style.borderColor = '#dbeafe';
    statusMessage.style.color = '#1e40af';
  }

  statusMessage.classList.remove('hidden');

  // Auto-hide after 3 seconds
  setTimeout(() => {
    statusMessage.classList.add('hidden');
  }, 3000);
}

async function checkServerConnection() {
  try {
    const response = await fetch('http://10.25.26.187:8002/api/v1/health', {
      method: 'GET',
      signal: AbortSignal.timeout(3000)
    });

    if (response.ok) {
      console.log('✅ Server connected');
    }
  } catch (error) {
    console.warn('⚠️ Server not reachable:', error.message);
    showStatus('Server offline - some features may not work', 'error');
  }
}

function isValidURL(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
