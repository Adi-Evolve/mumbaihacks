/**
 * Content Extractor - Enhanced intelligent extraction with ad blocking
 * Filters out advertisements, identifies page types, extracts multiple articles
 */

const ContentExtractor = {
  /**
   * Extract main content from current page
   */
  extractMainContent() {
    const content = {
      text: '',
      title: '',
      author: '',
      publishDate: '',
      source: window.location.hostname,
      pageType: this.detectPageType(),
      articles: [], // Multiple articles if detected
      images: [], // NEW: Extract images for CLIP verification
      confidence: 0,
      adBlockedCount: 0
    };

    // Extract title
    content.title = this.extractTitle();

    // Extract metadata
    const metadata = this.extractMetadata();
    content.author = metadata.author;
    content.publishDate = metadata.publishDate;

    // Extract main text (with ad filtering)
    const extractionResult = this.extractText();
    content.text = extractionResult.text;
    content.adBlockedCount = extractionResult.adsBlocked;
    
    // Extract individual articles if multiple found
    content.articles = this.extractMultipleArticles();
    
    // NEW: Extract images for CLIP multi-modal verification
    content.images = this.extractImages();
    
    // Calculate extraction confidence
    content.confidence = this.calculateExtractionConfidence(content);

    console.log('Content Extraction Summary:', {
      pageType: content.pageType,
      textLength: content.text.length,
      articlesFound: content.articles.length,
      imagesFound: content.images.length,
      adsBlocked: content.adBlockedCount,
      confidence: content.confidence
    });

    return content;
  },

  /**
   * Detect specific page type (News, Blog, Social Media, etc.)
   */
  detectPageType() {
    const url = window.location.href.toLowerCase();
    const hostname = window.location.hostname.toLowerCase();

    // Social Media Platforms
    const socialMediaPatterns = {
      'facebook.com': 'social-facebook',
      'fb.com': 'social-facebook',
      'twitter.com': 'social-twitter',
      'x.com': 'social-twitter',
      'instagram.com': 'social-instagram',
      'linkedin.com': 'social-linkedin',
      'reddit.com': 'social-reddit',
      'tiktok.com': 'social-tiktok',
      'youtube.com': 'social-youtube',
      'pinterest.com': 'social-pinterest',
      'snapchat.com': 'social-snapchat',
      'whatsapp.com': 'social-whatsapp',
      'telegram.org': 'social-telegram',
      'discord.com': 'social-discord',
      'mastodon': 'social-mastodon'
    };

    for (const [domain, type] of Object.entries(socialMediaPatterns)) {
      if (hostname.includes(domain)) {
        console.log(`✓ Page Type: ${type}`);
        return type;
      }
    }

    // News Portals (Major domains)
    const newsPortals = [
      // US/International News
      'bbc.com', 'cnn.com', 'nytimes.com', 'theguardian.com', 'reuters.com',
      'apnews.com', 'bloomberg.com', 'wsj.com', 'washingtonpost.com',
      'forbes.com', 'time.com', 'newsweek.com', 'usatoday.com',
      'nbcnews.com', 'abcnews.go.com', 'cbsnews.com', 'foxnews.com',
      'aljazeera.com', 'economist.com', 'politico.com', 'thehill.com',
      'axios.com', 'vice.com', 'vox.com', 'buzzfeednews.com', 'huffpost.com',
      
      // Indian News
      'timesofindia.indiatimes.com', 'hindustantimes.com', 'indianexpress.com',
      'ndtv.com', 'thehindu.com', 'news18.com', 'dnaindia.com', 'india.com',
      'firstpost.com', 'thequint.com', 'scroll.in', 'thenewsminute.com',
      
      // Global News
      'dw.com', 'france24.com', 'rt.com', 'sputniknews.com',
      'scmp.com', 'japantimes.co.jp', 'straitstimes.com'
    ];

    for (const domain of newsPortals) {
      if (hostname.includes(domain)) {
        console.log('✓ Page Type: news-portal');
        return 'news-portal';
      }
    }

    // Blog Detection
    const blogIndicators = [
      'blog', 'wordpress', 'blogspot', 'medium.com', 'substack.com',
      'ghost.io', 'tumblr.com', 'blogger.com', 'wix.com/blog',
      'squarespace.com', 'weebly.com'
    ];

    for (const indicator of blogIndicators) {
      if (hostname.includes(indicator) || url.includes('/blog/')) {
        console.log('✓ Page Type: blog');
        return 'blog';
      }
    }

    // Check DOM for blog indicators
    if (document.querySelector('.blog, .post, article.entry, .blog-post')) {
      console.log('✓ Page Type: blog (DOM)');
      return 'blog';
    }

    // Check for article tag
    if (document.querySelector('article')) {
      console.log('✓ Page Type: article-page');
      return 'article-page';
    }

    console.log('⚠ Page Type: unknown');
    return 'unknown';
  },

  /**
   * Extract page title
   */
  extractTitle() {
    // Try Open Graph title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      return ogTitle.getAttribute('content');
    }

    // Try Twitter title
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) {
      return twitterTitle.getAttribute('content');
    }

    // Try article title
    const h1 = document.querySelector('article h1, .article h1, h1.title, h1.headline');
    if (h1) {
      return h1.textContent.trim();
    }

    // Fallback to page title
    return document.title;
  },

  /**
   * Extract metadata (author, date, etc.)
   */
  extractMetadata() {
    const metadata = {
      author: '',
      publishDate: ''
    };

    // Extract author
    const authorSelectors = [
      'meta[name="author"]',
      'meta[property="article:author"]',
      '[rel="author"]',
      '.author',
      '.byline',
      '.author-name',
      '[itemprop="author"]'
    ];

    for (let selector of authorSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        metadata.author = element.getAttribute('content') || element.textContent.trim();
        if (metadata.author) break;
      }
    }

    // Extract publish date
    const dateSelectors = [
      'meta[property="article:published_time"]',
      'meta[name="publish-date"]',
      'time[datetime]',
      '.publish-date',
      '.date',
      '[itemprop="datePublished"]'
    ];

    for (let selector of dateSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        metadata.publishDate = element.getAttribute('content') || 
                              element.getAttribute('datetime') || 
                              element.textContent.trim();
        if (metadata.publishDate) break;
      }
    }

    return metadata;
  },

  /**
   * Extract main text content with comprehensive ad blocking
   */
  extractText() {
    // Try common article selectors - EXPANDED for news sites
    const contentSelectors = [
      // Standard article tags
      'article',
      '[role="article"]',
      '[itemtype*="Article"]',
      
      // Common news site selectors
      '.story-element-text',  // NDTV specific
      '.sp-cn',               // NDTV story content
      '#ins_storybody',       // NDTV story body
      '.article-content',
      '.post-content',
      '.entry-content',
      '.story-body',
      '.article-body',
      '.story-content',
      '.main-content',
      
      // Generic content areas
      'main article',
      'main .content',
      '#content article',
      '.content',
      '[itemprop="articleBody"]',
      
      // Paragraph-based extraction (find container with most <p> tags)
      'div.story', 'div.article', 'div.post',
      'section.story', 'section.article'
    ];

    let mainElement = null;
    let maxTextLength = 0;

    // Find element with most substantial text content
    for (let selector of contentSelectors) {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        const textLength = element.textContent.trim().length;
        if (textLength > maxTextLength && textLength > 200) {
          mainElement = element;
          maxTextLength = textLength;
        }
      });
    }

    // If still nothing, find div with most paragraphs
    if (!mainElement || maxTextLength < 500) {
      const divsWithParagraphs = Array.from(document.querySelectorAll('div'))
        .map(div => ({
          element: div,
          pCount: div.querySelectorAll('p').length,
          textLength: div.textContent.trim().length
        }))
        .filter(item => item.pCount >= 3 && item.textLength > 500)
        .sort((a, b) => b.textLength - a.textLength);

      if (divsWithParagraphs.length > 0) {
        mainElement = divsWithParagraphs[0].element;
        console.log(`✓ Found content container with ${divsWithParagraphs[0].pCount} paragraphs`);
      }
    }

    // Fallback to body if no article found
    if (!mainElement) {
      mainElement = document.body;
      console.log('⚠ Using document.body as fallback');
    } else {
      console.log(`✓ Found main content: ${mainElement.tagName}.${mainElement.className || 'no-class'}`);
    }

    // Extract and clean text
    return this.cleanText(mainElement);
  },

  /**
   * Clean text - EXTRACT TEXT FIRST, then filter ads from text
   */
  cleanText(element) {
    const clone = element.cloneNode(true);
    let adsBlocked = 0;

    // === STEP 1: Remove ONLY obvious non-content (scripts, navigation) ===
    const criticalRemoval = [
      'script', 'style', 'noscript', 'link',
      'nav', 'header:not(article header)', 'footer:not(article footer)', 
      'aside:not(article aside)', 'menu',
      '.comments', '.comment-section', '#disqus_thread'
    ];

    criticalRemoval.forEach(selector => {
      try {
        const elements = clone.querySelectorAll(selector);
        elements.forEach(el => el.remove());
        adsBlocked += elements.length;
      } catch (e) {}
    });

    // === STEP 2: Extract text from NDTV-specific structures ===
    let text = '';
    
    // NDTV uses .sp-cn as container, then we extract <p> tags from within it
    const ndtvContainer = clone.querySelector('.sp-cn, #ins_storybody, .story__content, .article__content');
    
    let ndtvParagraphs = [];
    if (ndtvContainer) {
      // Found container, now get all <p> tags inside it
      ndtvParagraphs = ndtvContainer.querySelectorAll('p');
      console.log(`✅ Found article container with ${ndtvParagraphs.length} paragraphs`);
    } else {
      // Fallback: try direct selectors
      const directSelectors = [
        '.story-element-text',
        '#ins_storybody p',
        '.article__content p',
        '.story__content p',
        'div[itemprop="articleBody"] p',
        '.content_text p'
      ];
      
      for (const selector of directSelectors) {
        const elements = clone.querySelectorAll(selector);
        if (elements.length > 0) {
          ndtvParagraphs = elements;
          console.log(`✅ Found ${elements.length} paragraphs`);
          break;
        }
      }
    }
    
    console.log(`� Processing ${ndtvParagraphs.length} paragraph elements...`);
    
    if (ndtvParagraphs.length > 0) {
      // NDTV structure detected
      let paraCount = 0;
      ndtvParagraphs.forEach(el => {
        const elText = el.textContent.trim();
        
        // More lenient filtering - only skip very short text or obvious ads
        if (elText.length < 20) return; // Skip very short
        if (this.isAdText(elText)) return; // Skip ads
        
        // Skip navigation/UI text
        if (elText.toLowerCase().includes('share via') || 
            elText.toLowerCase().includes('follow us') ||
            elText.toLowerCase().includes('download app')) return;
        
        paraCount++;
        text += elText + '\n\n';
      });
      console.log(`✅ Extracted ${paraCount} paragraphs (${text.length} characters)`);
    } else {
      // Fallback: Get ALL paragraph tags
      const paragraphs = clone.querySelectorAll('p');
      console.log(`⚠️ Using fallback mode: ${paragraphs.length} <p> tags found`);
      
      paragraphs.forEach(p => {
        const pText = p.textContent.trim();
        
        // Skip very short paragraphs
        if (pText.length < 10) return;
        
        // Skip ad-related text
        if (this.isAdText(pText)) return;
        
        // Skip if mostly links
        const links = p.querySelectorAll('a');
        const linkTextLength = Array.from(links).reduce((sum, a) => sum + a.textContent.length, 0);
        const linkDensity = pText.length > 0 ? linkTextLength / pText.length : 0;
        if (linkDensity > 0.7) return;
        
        text += pText + '\n\n';
      });
    }
    
    // Get headings for context
    const headings = clone.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let headingText = '';
    headings.forEach(h => {
      const hText = h.textContent.trim();
      if (hText.length > 5 && !this.isAdText(hText)) {
        headingText += hText + '\n\n';
      }
    });
    text = headingText + text;

    // Clean text if needed (remove from verbose logging)
    // No console log here
    
    // If still not enough, get all text
    if (text.length < 300) {
      console.log(`⚠️ Only ${text.length} chars extracted, using fallback extraction`);
      text = clone.textContent || '';
    }

    // Final cleaning
    text = text
      .replace(/\s+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    // Summary log only
    console.log(`🛡️ Blocked ${adsBlocked} ads | Extracted ${text.length} chars`);
    
    return { text, adsBlocked };
  },

  /**
   * Check if text is likely ad content
   */
  isAdText(text) {
    const adPatterns = [
      /^advertisement$/i,
      /^sponsored by/i,
      /^promoted content/i,
      /^click here to/i,
      /^buy now/i,
      /^subscribe to/i,
      /^sign up for/i
    ];
    
    return adPatterns.some(pattern => pattern.test(text.trim()));
  },

  /**
   * Remove ads by attributes
   */
  removeAdElementsByAttributes(element) {
    const adKeywords = [
      'ad', 'ads', 'advert', 'sponsor', 'promo', 'banner',
      'commercial', 'marketing', 'affiliate'
    ];

    const allElements = element.querySelectorAll('*');
    let removed = 0;
    
    allElements.forEach(el => {
      const className = (el.className || '').toString().toLowerCase();
      const id = (el.id || '').toLowerCase();
      const dataAttrs = Array.from(el.attributes)
        .filter(attr => attr.name.startsWith('data-'))
        .map(attr => `${attr.name}=${attr.value}`.toLowerCase())
        .join(' ');
      
      const combined = `${className} ${id} ${dataAttrs}`;
      
      if (adKeywords.some(kw => combined.includes(kw))) {
        el.remove();
        removed++;
      }
    });

    return removed;
  },

  /**
   * Remove suspicious elements
   */
  removeSuspiciousElements(element) {
    let removed = 0;
    const containers = element.querySelectorAll('div, section');
    
    containers.forEach(container => {
      const text = container.textContent.trim();
      const links = container.querySelectorAll('a');
      
      if (text.length > 0) {
        const linkText = Array.from(links).reduce((sum, link) => 
          sum + link.textContent.length, 0);
        const linkDensity = linkText / text.length;
        
        if (linkDensity > 0.8 && text.length < 500) {
          container.remove();
          removed++;
        }
      }
    });

    return removed;
  },

  /**
   * Extract multiple articles
   */
  extractMultipleArticles() {
    const articles = [];
    const articleSelectors = [
      'article', '[itemtype*="Article"]', '.article',
      '.post', '.story', '.news-item', '[role="article"]'
    ];

    const found = new Set();

    for (const selector of articleSelectors) {
      const elements = document.querySelectorAll(selector);
      
      elements.forEach(element => {
        if (found.has(element)) return;
        
        const cleanResult = this.cleanText(element);
        const articleText = cleanResult.text;
        
        if (articleText.length < 200) return;
        
        articles.push({
          index: articles.length,
          text: articleText,
          title: this.extractArticleTitle(element),
          author: this.extractArticleAuthor(element),
          publishDate: this.extractArticleDate(element),
          url: this.extractArticleURL(element),
          wordCount: articleText.split(/\s+/).length,
          selector: selector
        });
        
        found.add(element);
        if (articles.length >= 10) return;
      });
      
      if (articles.length >= 10) break;
    }

    console.log(`📄 Found ${articles.length} articles`);
    return articles;
  },

  extractArticleTitle(element) {
    const selectors = ['h1', 'h2', 'h3', '.title', '.headline', '[itemprop="headline"]'];
    for (const sel of selectors) {
      const el = element.querySelector(sel);
      if (el && el.textContent.trim().length > 10) {
        return el.textContent.trim();
      }
    }
    return '';
  },

  extractArticleAuthor(element) {
    const selectors = ['[rel="author"]', '.author', '.byline', '[itemprop="author"]'];
    for (const sel of selectors) {
      const el = element.querySelector(sel);
      if (el) return el.textContent.trim().replace(/^by\s+/i, '');
    }
    return '';
  },

  extractArticleDate(element) {
    const selectors = ['time[datetime]', '.publish-date', '[itemprop="datePublished"]'];
    for (const sel of selectors) {
      const el = element.querySelector(sel);
      if (el) return el.getAttribute('datetime') || el.textContent.trim();
    }
    return '';
  },

  extractArticleURL(element) {
    const link = element.querySelector('a[href]');
    if (link) {
      const href = link.getAttribute('href');
      if (href && href.startsWith('http')) return href;
      if (href && !href.startsWith('#')) {
        try {
          return new URL(href, window.location.origin).href;
        } catch (e) {}
      }
    }
    return window.location.href;
  },

  /**
   * Extract images from article for CLIP multi-modal verification
   */
  extractImages() {
    const images = [];
    const seen = new Set();
    
    // Find article container first
    const articleContainers = [
      'article', '[role="article"]', '.article', '.post', '.story-body',
      '.article-body', '.entry-content', 'main article'
    ];
    
    let container = document.body;
    for (const selector of articleContainers) {
      const el = document.querySelector(selector);
      if (el) {
        container = el;
        break;
      }
    }
    
    // Extract images from container
    const imgElements = container.querySelectorAll('img');
    
    imgElements.forEach(img => {
      const src = img.src;
      
      // Skip small images (likely icons/ads)
      if (img.width < 100 || img.height < 100) return;
      
      // Skip already processed
      if (seen.has(src)) return;
      
      // Skip ad/tracking pixels
      if (src.includes('pixel') || src.includes('tracker') || src.includes('beacon')) return;
      
      // Skip social media icons
      if (src.includes('facebook') || src.includes('twitter') || src.includes('linkedin')) return;
      
      // Get caption/alt text
      let caption = img.alt || '';
      
      // Try to find figcaption
      const figure = img.closest('figure');
      if (figure) {
        const figcaption = figure.querySelector('figcaption');
        if (figcaption) {
          caption = figcaption.textContent.trim() || caption;
        }
      }
      
      // Try to find nearby text (caption below image)
      const nextElement = img.nextElementSibling;
      if (nextElement && (nextElement.classList.contains('caption') || 
          nextElement.classList.contains('image-caption'))) {
        caption = nextElement.textContent.trim() || caption;
      }
      
      images.push({
        url: src,
        alt: img.alt || '',
        caption: caption,
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height
      });
      
      seen.add(src);
      
      // Limit to 3 images to avoid too much processing
      if (images.length >= 3) return;
    });
    
    console.log(`🖼️ Extracted ${images.length} images for verification`);
    return images;
  },

  /**
   * Calculate extraction confidence
   */
  calculateExtractionConfidence(content) {
    let confidence = 0;
    
    if (content.title && content.title.length > 10) confidence += 15;
    if (content.author) confidence += 10;
    if (content.publishDate) confidence += 10;
    if (content.text.length > 300) confidence += 15;
    if (content.text.length > 800) confidence += 10;
    if (content.text.length > 1500) confidence += 10;
    if (content.pageType !== 'unknown') confidence += 15;
    if (content.articles.length > 0) confidence += 10;
    if (content.adBlockedCount > 0) confidence += 10;
    
    return Math.min(confidence, 100);
  }
};

window.ContentExtractor = ContentExtractor;
