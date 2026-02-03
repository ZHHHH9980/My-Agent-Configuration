// Auto-Extract Bookmarklet
// Save this as a bookmark named "Auto Extract News"
// When on Bloomberg/WSJ, click it to start auto-extraction

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
    clearInterval(window.newsAggregatorInterval);
    delete window.newsAggregatorInterval;
    alert('⏹️ Stopped auto-extraction');
    return;
  }
  
  alert(`✅ Started auto-extraction from ${source}\n\nArticles will be sent to:\n${SERVER_URL}\n\nClick bookmark again to stop.`);
  
  // Extract immediately
  extractAndSend();
  
  // Set up periodic extraction
  window.newsAggregatorInterval = setInterval(extractAndSend, CHECK_INTERVAL);
  
  function extractAndSend() {
    const articles = extractArticles();
    
    if (articles.length === 0) {
      console.log('📰 No new articles found');
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
  
  function sendToServer(articles) {
    // Track sent URLs
    if (!window.sentUrls) {
      window.sentUrls = new Set();
    }
    
    // Filter out already sent URLs
    const newArticles = articles.filter(article => !window.sentUrls.has(article.url));
    
    if (newArticles.length === 0) {
      return;
    }
    
    // Mark as sent
    newArticles.forEach(article => window.sentUrls.add(article.url));
    
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
      
      // Update badge if extension API available
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
        chrome.runtime.sendMessage({
          action: 'articlesSent',
          count: newArticles.length,
          source: source
        });
      }
    })
    .catch(error => {
      console.error('❌ Error sending articles:', error);
      // Remove from sent cache on error
      newArticles.forEach(article => window.sentUrls.delete(article.url));
    });
  }
  
  // Clean up on page unload
  window.addEventListener('beforeunload', function() {
    if (window.newsAggregatorInterval) {
      clearInterval(window.newsAggregatorInterval);
    }
  });
  
  console.log('🔧 Auto-extraction setup complete');
})();