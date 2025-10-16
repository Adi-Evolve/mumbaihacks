/**
 * AI Search Popup - Floating search interface for text/link analysis
 */

class AISearchPopup {
  constructor() {
    this.popup = null;
    this.isVisible = false;
    this.isAnalyzing = false;
  }

  /**
   * Create and show the AI search popup
   */
  show() {
    if (this.popup) {
      this.popup.style.display = 'flex';
      this.isVisible = true;
      this.focusInput();
      return;
    }

    this.createPopup();
    this.attachEventListeners();
    this.isVisible = true;
  }

  /**
   * Hide the popup
   */
  hide() {
    if (this.popup) {
      this.popup.style.display = 'none';
      this.isVisible = false;
      this.clearInput();
    }
  }

  /**
   * Toggle popup visibility
   */
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Create the popup HTML structure
   */
  createPopup() {
    const popup = document.createElement('div');
    popup.className = 'misinfo-ai-search-popup';
    popup.innerHTML = `
      <div class="misinfo-ai-search-overlay"></div>
      <div class="misinfo-ai-search-container">
        <div class="misinfo-ai-search-header">
          <div class="misinfo-ai-search-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            </svg>
          </div>
          <h2>AI Fact Checker</h2>
          <button class="misinfo-ai-search-close" title="Close (Esc)">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <div class="misinfo-ai-search-body">
          <div class="misinfo-ai-search-input-wrapper">
            <svg class="misinfo-ai-search-input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="2"/>
              <path d="M14 14L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <input 
              type="text" 
              class="misinfo-ai-search-input" 
              placeholder="Enter text or paste a link to fact-check..."
              spellcheck="false"
            />
            <button class="misinfo-ai-search-clear" title="Clear" style="display: none;">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.2"/>
                <path d="M11 5L5 11M5 5L11 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <div class="misinfo-ai-search-suggestions">
            <button class="misinfo-ai-suggestion-chip" data-type="current-page">
              📄 Analyze Current Page
            </button>
            <button class="misinfo-ai-suggestion-chip" data-type="example-text">
              💬 Try Example Text
            </button>
            <button class="misinfo-ai-suggestion-chip" data-type="example-link">
              🔗 Try Example Link
            </button>
          </div>

          <div class="misinfo-ai-search-results" style="display: none;">
            <!-- Results will be inserted here -->
          </div>

          <div class="misinfo-ai-search-loading" style="display: none;">
            <div class="misinfo-ai-loading-spinner"></div>
            <p class="misinfo-ai-loading-text">Analyzing content...</p>
          </div>
        </div>

        <div class="misinfo-ai-search-footer">
          <div class="misinfo-ai-search-hints">
            <span class="misinfo-ai-hint">
              <kbd>Enter</kbd> to analyze
            </span>
            <span class="misinfo-ai-hint">
              <kbd>Esc</kbd> to close
            </span>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(popup);
    this.popup = popup;

    // Add styles
    this.injectStyles();
  }

  /**
   * Inject CSS styles for the popup
   */
  injectStyles() {
    if (document.getElementById('misinfo-ai-search-styles')) return;

    const style = document.createElement('style');
    style.id = 'misinfo-ai-search-styles';
    style.textContent = `
      .misinfo-ai-search-popup {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 2147483647;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding-top: 15vh;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }

      .misinfo-ai-search-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(8px);
        animation: misinfo-fade-in 0.2s ease;
      }

      .misinfo-ai-search-container {
        position: relative;
        width: 90%;
        max-width: 680px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 24px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        padding: 3px;
        animation: misinfo-slide-up 0.3s ease;
      }

      .misinfo-ai-search-header {
        background: white;
        border-radius: 22px 22px 0 0;
        padding: 20px 24px;
        display: flex;
        align-items: center;
        gap: 12px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.08);
      }

      .misinfo-ai-search-icon {
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      }

      .misinfo-ai-search-header h2 {
        flex: 1;
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #1a202c;
      }

      .misinfo-ai-search-close {
        width: 32px;
        height: 32px;
        border: none;
        background: rgba(0, 0, 0, 0.05);
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #4a5568;
        transition: all 0.2s;
      }

      .misinfo-ai-search-close:hover {
        background: rgba(0, 0, 0, 0.1);
        color: #1a202c;
      }

      .misinfo-ai-search-body {
        background: white;
        padding: 24px;
        min-height: 200px;
      }

      .misinfo-ai-search-input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        gap: 12px;
        background: #f7fafc;
        border: 2px solid transparent;
        border-radius: 16px;
        padding: 14px 18px;
        transition: all 0.2s;
      }

      .misinfo-ai-search-input-wrapper:focus-within {
        background: white;
        border-color: #667eea;
        box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
      }

      .misinfo-ai-search-input-icon {
        color: #a0aec0;
        flex-shrink: 0;
      }

      .misinfo-ai-search-input {
        flex: 1;
        border: none;
        background: transparent;
        font-size: 16px;
        color: #1a202c;
        outline: none;
      }

      .misinfo-ai-search-input::placeholder {
        color: #a0aec0;
      }

      .misinfo-ai-search-clear {
        border: none;
        background: transparent;
        cursor: pointer;
        padding: 4px;
        color: #718096;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s;
      }

      .misinfo-ai-search-clear:hover {
        color: #4a5568;
      }

      .misinfo-ai-search-suggestions {
        display: flex;
        gap: 8px;
        margin-top: 16px;
        flex-wrap: wrap;
      }

      .misinfo-ai-suggestion-chip {
        padding: 8px 16px;
        border: 1.5px solid #e2e8f0;
        background: white;
        border-radius: 12px;
        font-size: 14px;
        color: #4a5568;
        cursor: pointer;
        transition: all 0.2s;
        font-weight: 500;
      }

      .misinfo-ai-suggestion-chip:hover {
        border-color: #667eea;
        background: #f7fafc;
        color: #667eea;
        transform: translateY(-1px);
      }

      .misinfo-ai-search-results {
        margin-top: 24px;
        animation: misinfo-fade-in 0.3s ease;
      }

      .misinfo-ai-result-card {
        background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
        border-radius: 16px;
        padding: 20px;
        margin-bottom: 16px;
      }

      .misinfo-ai-result-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
      }

      .misinfo-ai-result-badge {
        padding: 6px 14px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .misinfo-ai-result-badge.verified {
        background: #c6f6d5;
        color: #22543d;
      }

      .misinfo-ai-result-badge.questionable {
        background: #feebc8;
        color: #7c2d12;
      }

      .misinfo-ai-result-badge.false {
        background: #fed7d7;
        color: #742a2a;
      }

      .misinfo-ai-result-confidence {
        flex: 1;
        text-align: right;
        font-size: 24px;
        font-weight: 700;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .misinfo-ai-result-explanation {
        color: #4a5568;
        font-size: 15px;
        line-height: 1.6;
        margin-bottom: 16px;
      }

      .misinfo-ai-result-meter {
        height: 8px;
        background: #e2e8f0;
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 16px;
      }

      .misinfo-ai-result-meter-fill {
        height: 100%;
        background: linear-gradient(90deg, #48bb78 0%, #667eea 50%, #f56565 100%);
        transition: width 0.6s ease;
        border-radius: 4px;
      }

      .misinfo-ai-result-sources {
        margin-top: 16px;
      }

      .misinfo-ai-result-sources h4 {
        font-size: 13px;
        font-weight: 600;
        color: #718096;
        margin: 0 0 8px 0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .misinfo-ai-source-link {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        background: white;
        border-radius: 8px;
        font-size: 13px;
        color: #667eea;
        text-decoration: none;
        margin: 4px 4px 4px 0;
        transition: all 0.2s;
        border: 1px solid #e2e8f0;
      }

      .misinfo-ai-source-link:hover {
        background: #667eea;
        color: white;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      }

      .misinfo-ai-search-loading {
        text-align: center;
        padding: 40px 20px;
      }

      .misinfo-ai-loading-spinner {
        width: 48px;
        height: 48px;
        border: 4px solid #e2e8f0;
        border-top-color: #667eea;
        border-radius: 50%;
        animation: misinfo-spin 0.8s linear infinite;
        margin: 0 auto 16px;
      }

      .misinfo-ai-loading-text {
        color: #718096;
        font-size: 15px;
        margin: 0;
      }

      .misinfo-ai-search-footer {
        background: white;
        border-radius: 0 0 22px 22px;
        padding: 16px 24px;
        border-top: 1px solid rgba(0, 0, 0, 0.08);
      }

      .misinfo-ai-search-hints {
        display: flex;
        gap: 16px;
        justify-content: center;
      }

      .misinfo-ai-hint {
        font-size: 13px;
        color: #718096;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .misinfo-ai-hint kbd {
        padding: 4px 8px;
        background: #f7fafc;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        font-family: monospace;
        font-size: 12px;
        color: #4a5568;
      }

      @keyframes misinfo-fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes misinfo-slide-up {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes misinfo-spin {
        to { transform: rotate(360deg); }
      }

      @media (max-width: 768px) {
        .misinfo-ai-search-popup {
          padding-top: 10vh;
        }

        .misinfo-ai-search-container {
          width: 95%;
          max-width: none;
        }

        .misinfo-ai-search-suggestions {
          flex-direction: column;
        }

        .misinfo-ai-suggestion-chip {
          width: 100%;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const overlay = this.popup.querySelector('.misinfo-ai-search-overlay');
    const closeBtn = this.popup.querySelector('.misinfo-ai-search-close');
    const input = this.popup.querySelector('.misinfo-ai-search-input');
    const clearBtn = this.popup.querySelector('.misinfo-ai-search-clear');
    const suggestionChips = this.popup.querySelectorAll('.misinfo-ai-suggestion-chip');

    // Close on overlay click
    overlay.addEventListener('click', () => this.hide());

    // Close on close button
    closeBtn.addEventListener('click', () => this.hide());

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });

    // Input events
    input.addEventListener('input', (e) => {
      const value = e.target.value.trim();
      clearBtn.style.display = value ? 'flex' : 'none';
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !this.isAnalyzing) {
        const value = input.value.trim();
        if (value) {
          this.analyze(value);
        }
      }
    });

    // Clear button
    clearBtn.addEventListener('click', () => {
      this.clearInput();
    });

    // Suggestion chips
    suggestionChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const type = chip.dataset.type;
        this.handleSuggestion(type);
      });
    });
  }

  /**
   * Handle suggestion chip clicks
   */
  handleSuggestion(type) {
    const input = this.popup.querySelector('.misinfo-ai-search-input');

    switch (type) {
      case 'current-page':
        this.analyzeCurrentPage();
        break;
      
      case 'example-text':
        input.value = "Breaking: Scientists discover new cure for cancer that works in 24 hours!";
        this.analyze(input.value);
        break;
      
      case 'example-link':
        input.value = "https://www.ndtv.com/world-news/indian-origin-us-defence-strategist-ashley-tellis-arrested-over-secret-documents-meeting-chinese-officials-9457048";
        this.analyze(input.value);
        break;
    }
  }

  /**
   * Analyze current page
   */
  async analyzeCurrentPage() {
    this.showLoading();

    try {
      // Get current page content
      const result = await chrome.runtime.sendMessage({
        action: 'analyzeCurrentPage'
      });

      this.displayResults(result);
    } catch (error) {
      this.showError('Failed to analyze current page: ' + error.message);
    }
  }

  /**
   * Main analysis function
   */
  async analyze(input) {
    // Determine if input is URL or text
    const isURL = this.isValidURL(input);

    if (isURL) {
      await this.analyzeURL(input);
    } else {
      await this.analyzeText(input);
    }
  }

  /**
   * Analyze text content
   */
  async analyzeText(text) {
    this.showLoading('Analyzing text...');

    try {
      const response = await fetch(CONFIG.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text,
          url: window.location.href,
          title: 'User Input Text',
          pageType: 'user-input',
          language: 'en'
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      this.displayResults(result, 'text');
    } catch (error) {
      this.showError('Analysis failed: ' + error.message);
    }
  }

  /**
   * Analyze URL
   */
  async analyzeURL(url) {
    this.showLoading('Fetching and analyzing URL...');

    try {
      // Send URL to background script to fetch and analyze
      const result = await chrome.runtime.sendMessage({
        action: 'analyzeURL',
        url: url
      });

      this.displayResults(result, 'url');
    } catch (error) {
      this.showError('Failed to analyze URL: ' + error.message);
    }
  }

  /**
   * Display analysis results
   */
  displayResults(result, type = 'text') {
    const resultsContainer = this.popup.querySelector('.misinfo-ai-search-results');
    const loadingContainer = this.popup.querySelector('.misinfo-ai-search-loading');
    const suggestions = this.popup.querySelector('.misinfo-ai-search-suggestions');

    loadingContainer.style.display = 'none';
    suggestions.style.display = 'none';
    resultsContainer.style.display = 'block';

    const confidence = result.confidence || 0.5;
    const classification = result.classification || 'unknown';
    const explanation = result.explanation || 'No explanation available.';
    const misinfoScore = result.misinformation_score || 50;

    // Determine badge class
    let badgeClass = 'verified';
    let badgeText = 'VERIFIED';
    
    if (confidence >= 0.7) {
      badgeClass = 'verified';
      badgeText = 'VERIFIED';
    } else if (confidence >= 0.4) {
      badgeClass = 'questionable';
      badgeText = 'QUESTIONABLE';
    } else {
      badgeClass = 'false';
      badgeText = 'LIKELY FALSE';
    }

    // Calculate truthfulness percentage
    const truthPercent = Math.round((1 - (misinfoScore / 100)) * 100);

    resultsContainer.innerHTML = `
      <div class="misinfo-ai-result-card">
        <div class="misinfo-ai-result-header">
          <span class="misinfo-ai-result-badge ${badgeClass}">${badgeText}</span>
          <span class="misinfo-ai-result-confidence">${truthPercent}% True</span>
        </div>

        <div class="misinfo-ai-result-meter">
          <div class="misinfo-ai-result-meter-fill" style="width: ${truthPercent}%"></div>
        </div>

        <p class="misinfo-ai-result-explanation">${explanation}</p>

        ${result.highlighted_phrases && result.highlighted_phrases.length > 0 ? `
          <div class="misinfo-ai-result-highlights">
            <h4>Key Claims Detected:</h4>
            <div>
              ${result.highlighted_phrases.map(phrase => 
                `<span class="misinfo-ai-source-link" style="background: #fef5e7; color: #744210; border-color: #f6e05e;">
                  ${phrase}
                </span>`
              ).join('')}
            </div>
          </div>
        ` : ''}

        ${result.fact_check_sources && result.fact_check_sources.length > 0 ? `
          <div class="misinfo-ai-result-sources">
            <h4>Fact-Check Sources:</h4>
            ${result.fact_check_sources.map(source => 
              `<a href="${source.url}" target="_blank" class="misinfo-ai-source-link">
                ✓ ${source.name}
              </a>`
            ).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Show loading state
   */
  showLoading(text = 'Analyzing content...') {
    const resultsContainer = this.popup.querySelector('.misinfo-ai-search-results');
    const loadingContainer = this.popup.querySelector('.misinfo-ai-search-loading');
    const loadingText = this.popup.querySelector('.misinfo-ai-loading-text');
    const suggestions = this.popup.querySelector('.misinfo-ai-search-suggestions');

    resultsContainer.style.display = 'none';
    suggestions.style.display = 'none';
    loadingContainer.style.display = 'block';
    loadingText.textContent = text;

    this.isAnalyzing = true;
  }

  /**
   * Show error message
   */
  showError(message) {
    const resultsContainer = this.popup.querySelector('.misinfo-ai-search-results');
    const loadingContainer = this.popup.querySelector('.misinfo-ai-search-loading');
    const suggestions = this.popup.querySelector('.misinfo-ai-search-suggestions');

    loadingContainer.style.display = 'none';
    suggestions.style.display = 'none';
    resultsContainer.style.display = 'block';

    resultsContainer.innerHTML = `
      <div class="misinfo-ai-result-card" style="background: #fed7d7; border: 2px solid #fc8181;">
        <div style="color: #742a2a; font-size: 15px;">
          ❌ ${message}
        </div>
      </div>
    `;

    this.isAnalyzing = false;
  }

  /**
   * Check if string is valid URL
   */
  isValidURL(string) {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clear input and reset state
   */
  clearInput() {
    const input = this.popup.querySelector('.misinfo-ai-search-input');
    const clearBtn = this.popup.querySelector('.misinfo-ai-search-clear');
    const resultsContainer = this.popup.querySelector('.misinfo-ai-search-results');
    const suggestions = this.popup.querySelector('.misinfo-ai-search-suggestions');

    input.value = '';
    clearBtn.style.display = 'none';
    resultsContainer.style.display = 'none';
    suggestions.style.display = 'flex';
    this.isAnalyzing = false;

    this.focusInput();
  }

  /**
   * Focus input field
   */
  focusInput() {
    setTimeout(() => {
      const input = this.popup.querySelector('.misinfo-ai-search-input');
      if (input) input.focus();
    }, 100);
  }
}

// Export for use in content script
window.AISearchPopup = AISearchPopup;
