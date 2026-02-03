// Wall Street Journal Bookmarklet
// Save this as a bookmark in Chrome: 
// 1. Copy the entire code below
// 2. Create new bookmark
// 3. Paste as URL
// 4. Name it "Save WSJ to News Aggregator"
// 5. When on WSJ.com, click the bookmark

javascript:(function(){
  // WSJ Bookmarklet
  const articles = [];
  const selectors = [
    'a[href*="/articles/"]',
    'article a',
    '.WSJTheme--headline--',
    '[data-testid="headline"] a',
    '.headline a',
    '.wsj-card-headline a',
    'h1 a', 'h2 a', 'h3 a',
    '[class*="headline"] a',
    '.wsj-snippet-headline a'
  ];
  
  // Try each selector
  for (const selector of selectors) {
    if (articles.length >= 15) break;
    const links = document.querySelectorAll(selector);
    links.forEach(link => {
      if (articles.length >= 15) return;
      const href = link.href;
      const text = link.textContent?.trim() || link.innerText?.trim() || '';
      if (href && text.length > 10 && text.length < 200 && 
          !text.includes('Subscribe') && !text.includes('Sign In') &&
          !text.includes('Log In') && !text.includes('Register')) {
        
        // Get more context
        const parent = link.closest('article, div, section, li') || link.parentElement;
        const parentText = parent?.textContent?.trim() || text;
        const title = parentText.length > text.length ? parentText : text;
        
        articles.push({
          title: title.substring(0, 150).replace(/\s+/g, ' ').trim(),
          url: href,
          source: 'wsj',
          timestamp: Date.now()
        });
      }
    });
  }
  
  if (articles.length === 0) {
    alert('📰 No articles found on this WSJ page.\n\nTry:\n• https://www.wsj.com\n• https://www.wsj.com/news/business\n• https://www.wsj.com/news/markets');
    return;
  }
  
  // Remove duplicates
  const uniqueArticles = [];
  const seenUrls = new Set();
  for (const article of articles) {
    if (!seenUrls.has(article.url)) {
      seenUrls.add(article.url);
      uniqueArticles.push(article);
    }
  }
  
  console.log(`📊 Found ${uniqueArticles.length} WSJ articles`);
  
  // Send to news aggregator
  const serverUrl = 'http://localhost:3001'; // Change this if your server is elsewhere
  fetch(serverUrl + '/api/bookmarklet', {
    method: 'POST',
    mode: 'cors',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ 
      articles: uniqueArticles,
      source: 'wsj',
      url: window.location.href
    })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    alert(`✅ Success!\n\nSent ${uniqueArticles.length} WSJ articles to News Aggregator.\n\nOpen ${serverUrl} to view them.`);
    console.log('Bookmarklet success:', data);
  })
  .catch(error => {
    console.error('Bookmarklet error:', error);
    alert(`❌ Error: ${error.message}\n\nMake sure:\n1. News aggregator is running at ${serverUrl}\n2. You're on http://localhost:3001 (not https)`);
  });
})();