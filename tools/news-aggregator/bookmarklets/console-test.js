// Console Test Script
// Copy this code and paste in Bloomberg.com/WSJ.com console (F12 → Console)
// No javascript: prefix needed for console

(function(){
  // Configuration
  const SERVER_URL = 'http://localhost:3001';
  
  // Determine source
  const hostname = window.location.hostname;
  const source = hostname.includes('bloomberg') ? 'bloomberg' : 
                 hostname.includes('wsj') ? 'wsj' : null;
  
  if (!source) {
    console.log('❌ Not on Bloomberg or WSJ. Please visit:\n• https://www.bloomberg.com\n• https://www.wsj.com');
    return;
  }
  
  console.log(`🚀 Testing extraction from ${source}`);
  
  // Extract articles
  const articles = extractArticles();
  
  if (articles.length === 0) {
    console.log('📰 No articles found on this page');
    return;
  }
  
  console.log(`📊 Found ${articles.length} articles from ${source}`);
  
  // Send to server
  sendToServer(articles);
  
  function extractArticles() {
    const articles = [];
    const selectors = getSelectors();
    const MAX_ARTICLES = 5; // Limit for testing
    
    for (const selector of selectors) {
      if (articles.length >= MAX_ARTICLES) break;
      
      const links = document.querySelectorAll(selector);
      links.forEach(link => {
        if (articles.length >= MAX_ARTICLES) return;
        
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
        'h1 a', 'h2 a', 'h3 a'
      ];
    } else { // wsj
      return [
        'a[href*="/articles/"]',
        'article a',
        '.WSJTheme--headline--',
        '[data-testid="headline"] a',
        '.headline a',
        'h1 a', 'h2 a', 'h3 a'
      ];
    }
  }
  
  function isValidArticle(href, text) {
    if (!href || !text) return false;
    if (text.length < 10 || text.length > 200) return false;
    
    const blockedTerms = ['Subscribe', 'Sign In', 'Log In', 'Register', 'Account'];
    if (blockedTerms.some(term => text.includes(term))) return false;
    
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
    fetch(`${SERVER_URL}/api/bookmarklet`, {
      method: 'POST',
      mode: 'cors',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        articles: articles,
        source: source,
        url: window.location.href,
        consoleTest: true
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log(`✅ Success! Sent ${articles.length} articles to News Aggregator`);
      console.log(`📺 Open ${SERVER_URL} to view them`);
      console.log('📋 Response:', data);
    })
    .catch(error => {
      console.error('❌ Error sending articles:', error);
      console.log(`🔧 Make sure news aggregator is running at ${SERVER_URL}`);
    });
  }
  
  console.log('🔧 Console test script loaded. Articles extracted and sent.');
})();