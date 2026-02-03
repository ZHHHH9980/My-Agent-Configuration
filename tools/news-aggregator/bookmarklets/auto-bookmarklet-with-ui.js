// Auto-Extract Bookmarklet WITH VISIBLE UI
// Save this as a bookmark named "Auto Extract News"
// When on Bloomberg/WSJ, click it to start auto-extraction with visible indicator

javascript:(function(){
  // Configuration
  const SERVER_URL = 'http://localhost:3001';
  const CHECK_INTERVAL = 10000; // Check every 10 seconds
  const MAX_ARTICLES_PER_PAGE = 10;
  
  // Determine source
  const hostname = window.location.hostname;
  const source = hostname.includes('bloomberg') ? 'bloomberg' : 
                 hostname.includes('wsj') ? 'wsj' : null;
  
  if (!source) {
    alert('❌ Not on Bloomberg or WSJ. Please visit:\n• https://www.bloomberg.com\n• https://www.wsj.com');
    return;
  }
  
  console.log(`🚀 Starting auto-extraction from ${source}`);
  
  // Check if already running
  if (window.newsAggregatorInterval) {
    stopAutoExtraction();
    return;
  }
  
  // Create visible UI
  createUI();
  
  // Extract immediately
  extractAndSend();
  
  // Set up periodic extraction
  window.newsAggregatorInterval = setInterval(extractAndSend, CHECK_INTERVAL);
  
  console.log('✅ Auto-extraction started with visible UI');
  
  function createUI() {
    // Remove existing UI if any
    const existingUI = document.getElementById('news-aggregator-ui');
    if (existingUI) {
      existingUI.remove();
    }
    
    // Create container
    const container = document.createElement('div');
    container.id = 'news-aggregator-ui';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 999999;
      background: white;
      border: 2px solid #0066cc;
      border-radius: 8px;
      padding: 15px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      min-width: 300px;
      max-width: 400px;
    `;
    
    // Create header
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid #eee;
    `;
    
    const title = document.createElement('div');
    title.innerHTML = `<strong style="color: #0066cc;">📰 News Aggregator</strong>`;
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = `
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #999;
      padding: 0 5px;
    `;
    closeBtn.onclick = stopAutoExtraction;
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    
    // Create status section
    const statusSection = document.createElement('div');
    statusSection.id = 'news-aggregator-status';
    statusSection.style.cssText = `
      margin-bottom: 10px;
      padding: 8px;
      background: #f0f8ff;
      border-radius: 4px;
      font-size: 13px;
    `;
    statusSection.innerHTML = `
      <div style="color: #006600; font-weight: bold;">✅ Auto-extraction ACTIVE</div>
      <div style="font-size: 12px; color: #666; margin-top: 3px;">
        Source: <span style="color: #1428a0; font-weight: bold;">${source}</span><br>
        Checking every 10 seconds<br>
        Articles sent to: ${SERVER_URL}
      </div>
    `;
    
    // Create stats section
    const statsSection = document.createElement('div');
    statsSection.id = 'news-aggregator-stats';
    statsSection.style.cssText = `
      margin-bottom: 10px;
      padding: 8px;
      background: #f8f9fa;
      border-radius: 4px;
      font-size: 13px;
    `;
    statsSection.innerHTML = `
      <div style="font-weight: bold; color: #333;">📊 Statistics</div>
      <div style="font-size: 12px; color: #666; margin-top: 3px;">
        Last check: <span id="last-check-time">Just now</span><br>
        Articles found: <span id="articles-found-count">0</span><br>
        Total sent: <span id="total-sent-count">0</span>
      </div>
    `;
    
    // Create control buttons
    const controlsSection = document.createElement('div');
    controlsSection.style.cssText = `
      display: flex;
      gap: 8px;
      margin-top: 10px;
    `;
    
    const stopBtn = document.createElement('button');
    stopBtn.textContent = '⏹️ Stop Auto-Extract';
    stopBtn.style.cssText = `
      flex: 1;
      background: #dc3545;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-weight: bold;
    `;
    stopBtn.onclick = stopAutoExtraction;
    
    const testBtn = document.createElement('button');
    testBtn.textContent = '🔍 Check Now';
    testBtn.style.cssText = `
      flex: 1;
      background: #28a745;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-weight: bold;
    `;
    testBtn.onclick = extractAndSend;
    
    controlsSection.appendChild(testBtn);
    controlsSection.appendChild(stopBtn);
    
    // Assemble UI
    container.appendChild(header);
    container.appendChild(statusSection);
    container.appendChild(statsSection);
    container.appendChild(controlsSection);
    
    // Add to page
    document.body.appendChild(container);
    
    // Track stats
    window.newsAggregatorStats = {
      articlesFound: 0,
      totalSent: 0,
      lastCheck: new Date()
    };
    
    // Update time periodically
    window.newsAggregatorTimeInterval = setInterval(() => {
      const elapsed = Math.floor((new Date() - window.newsAggregatorStats.lastCheck) / 1000);
      const timeEl = document.getElementById('last-check-time');
      if (timeEl) {
        if (elapsed < 60) {
          timeEl.textContent = `${elapsed}s ago`;
        } else {
          timeEl.textContent = `${Math.floor(elapsed / 60)}m ago`;
        }
      }
    }, 1000);
  }
  
  function stopAutoExtraction() {
    if (window.newsAggregatorInterval) {
      clearInterval(window.newsAggregatorInterval);
      delete window.newsAggregatorInterval;
    }
    
    if (window.newsAggregatorTimeInterval) {
      clearInterval(window.newsAggregatorTimeInterval);
      delete window.newsAggregatorTimeInterval;
    }
    
    // Update UI to show stopped
    const statusEl = document.getElementById('news-aggregator-status');
    if (statusEl) {
      statusEl.innerHTML = `
        <div style="color: #dc3545; font-weight: bold;">⏹️ Auto-extraction STOPPED</div>
        <div style="font-size: 12px; color: #666; margin-top: 3px;">
          Click bookmark again to restart
        </div>
      `;
      statusEl.style.background = '#ffe6e6';
    }
    
    // Disable buttons
    const buttons = document.querySelectorAll('#news-aggregator-ui button');
    buttons.forEach(btn => {
      if (btn.textContent.includes('Stop')) {
        btn.textContent = '✅ Stopped';
        btn.style.background = '#6c757d';
        btn.disabled = true;
      }
    });
    
    console.log('⏹️ Stopped auto-extraction');
  }
  
  function extractAndSend() {
    const articles = extractArticles();
    
    // Update last check time
    window.newsAggregatorStats.lastCheck = new Date();
    
    if (articles.length === 0) {
      console.log('📰 No new articles found');
      updateStats(0, 0);
      return;
    }
    
    console.log(`📊 Found ${articles.length} articles from ${source}`);
    sendToServer(articles);
  }
  
  function extractArticles() {
    const articles = [];
    const selectors = getSelectors();
    
    for (const selector of selectors) {
      if (articles.length >= MAX_ARTICLES_PER_PAGE) break;
      
      const links = document.querySelectorAll(selector);
      links.forEach(link => {
        if (articles.length >= MAX_ARTICLES_PER_PAGE) return;
        
        const href = link.href;
        const text = link.textContent?.trim() || link.innerText?.trim() || '';
        
        if (isValidArticle(href, text)) {
          const parent = link.closest('article, div, section, li') || link.parentElement;
          const parentText = parent?.textContent?.trim() || text;
          const title = parentText.length > text.length ? parentText : text;
          
          articles.push({
            title: cleanTitle(title),
            url: href,
            source: source,
            timestamp: Date.now()
          });
        }
      });
    }
    
    return removeDuplicates(articles);
  }
  
  function getSelectors() {
    if (source === 'bloomberg') {
      return [
        'a[href*="/news/articles/"]',
        'article a',
        '.story-list a',
        '.headline a',
        '[data-component="headline"] a',
        'h1 a', 'h2 a', 'h3 a',
        '.single-story-module a'
      ];
    } else { // wsj
      return [
        'a[href*="/articles/"]',
        'article a',
        '.WSJTheme--headline--',
        '[data-testid="headline"] a',
        '.headline a',
        'h1 a', 'h2 a', 'h3 a',
        '.wsj-card-headline a'
      ];
    }
  }
  
  function isValidArticle(href, text) {
    if (!href || !text) return false;
    if (text.length < 10 || text.length > 200) return false;
    
    const blockedTerms = ['Subscribe', 'Sign In', 'Log In', 'Register', 'Account'];
    if (blockedTerms.some(term => text.includes(term))) return false;
    
    // Check if we've already sent this URL recently
    if (window.sentUrls && window.sentUrls.has(href)) {
      return false;
    }
    
    return true;
  }
  
  function cleanTitle(title) {
    return title
      .substring(0, 150)
      .replace(/\s+/g, ' ')
      .replace(/\n/g, ' ')
      .trim();
  }
  
  function removeDuplicates(articles) {
    const unique = [];
    const seen = new Set();
    
    for (const article of articles) {
      if (!seen.has(article.url)) {
        seen.add(article.url);
        unique.push(article);
      }
    }
    
    return unique;
  }
  
  function updateStats(found, sent) {
    if (!window.newsAggregatorStats) return;
    
    window.newsAggregatorStats.articlesFound += found;
    window.newsAggregatorStats.totalSent += sent;
    
    const foundEl = document.getElementById('articles-found-count');
    const sentEl = document.getElementById('total-sent-count');
    
    if (foundEl) foundEl.textContent = window.newsAggregatorStats.articlesFound;
    if (sentEl) sentEl.textContent = window.newsAggregatorStats.totalSent;
  }
  
  function sendToServer(articles) {
    // Track sent URLs
    if (!window.sentUrls) {
      window.sentUrls = new Set();
    }
    
    // Filter out already sent URLs
    const newArticles = articles.filter(article => !window.sentUrls.has(article.url));
    
    if (newArticles.length === 0) {
      updateStats(articles.length, 0);
      return;
    }
    
    // Mark as sent
    newArticles.forEach(article => window.sentUrls.add(article.url));
    
    // Update stats
    updateStats(articles.length, newArticles.length);
    
    // Flash UI to indicate sending
    const statusEl = document.getElementById('news-aggregator-status');
    if (statusEl) {
      const originalBackground = statusEl.style.background;
      statusEl.style.background = '#e6ffe6';
      setTimeout(() => {
        statusEl.style.background = originalBackground;
      }, 500);
    }
    
    fetch(`${SERVER_URL}/api/bookmarklet`, {
      method: 'POST',
      mode: 'cors',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        articles: newArticles,
        source: source,
        url: window.location.href,
        auto: true
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log(`✅ Sent ${newArticles.length} new articles to News Aggregator`);
      
      // Show success in UI
      const statusEl = document.getElementById('news-aggregator-status');
      if (statusEl) {
        const originalHTML = statusEl.innerHTML;
        statusEl.innerHTML = `
          <div style="color: #006600; font-weight: bold;">✅ Sent ${newArticles.length} articles!</div>
          <div style="font-size: 12px; color: #666; margin-top: 3px;">
            Check <a href="${SERVER_URL}" target="_blank" style="color: #0066cc;">News Aggregator</a>
          </div>
        `;
        setTimeout(() => {
          statusEl.innerHTML = originalHTML;
        }, 3000);
      }
    })
    .catch(error => {
      console.error('❌ Error sending articles:', error);
      // Remove from sent cache on error
      newArticles.forEach(article => window.sentUrls.delete(article.url));
      // Update stats
      updateStats(0, -newArticles.length);
    });
  }
  
  // Clean up on page unload
  window.addEventListener('beforeunload', function() {
    if (window.newsAggregatorInterval) {
      clearInterval(window.newsAggregatorInterval);
    }
    if (window.newsAggregatorTimeInterval) {
      clearInterval(window.newsAggregatorTimeInterval);
    }
  });
  
  console.log('🔧 Auto-extraction with UI setup complete');
})();