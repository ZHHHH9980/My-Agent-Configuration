const express = require('express');
const cors = require('cors');
const router = express.Router();
const hackernewsFetcher = require('../fetchers/hackernews');
const bloombergFetcher = require('../fetchers/bloomberg-browser');
const wsjFetcher = require('../fetchers/wsj-browser');
const trendingCalculator = require('../aggregators/trending-calculator');
const axios = require('axios');
const { JSDOM } = require('jsdom');

let cachedArticles = null;
let cacheTime = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes cache
let isFetching = false;
let lastFetchTime = 0;
const MIN_FETCH_INTERVAL = 60 * 1000; // 1 minute between fetches

async function fetchAllArticles(limit = 20, forceRefresh = false) {
  try {
    const now = Date.now();
    const perSourceLimit = Math.ceil(limit / 3);
    
    const hackernewsPromise = hackernewsFetcher.fetchTopStories(perSourceLimit);
    
    let bloombergPromise;
    let wsjPromise;
    
    if (forceRefresh || !cachedArticles || now - cacheTime > CACHE_DURATION) {
      // Fetch fresh data if cache expired or forced refresh
      bloombergPromise = bloombergFetcher.fetchBloombergNews(perSourceLimit);
      wsjPromise = wsjFetcher.fetchWSJNews(perSourceLimit);
    } else {
      // Use cached articles
      bloombergPromise = Promise.resolve(
        cachedArticles.filter(a => a.source === 'bloomberg').slice(0, perSourceLimit)
      );
      wsjPromise = Promise.resolve(
        cachedArticles.filter(a => a.source === 'wsj').slice(0, perSourceLimit)
      );
    }

    const [hackernewsArticles, bloombergArticles, wsjArticles] = await Promise.allSettled([
      hackernewsPromise,
      bloombergPromise,
      wsjPromise
    ]);

    const articles = [];
    
    if (hackernewsArticles.status === 'fulfilled') {
      articles.push(...hackernewsArticles.value);
    } else {
      console.error('Failed to fetch Hacker News:', hackernewsArticles.reason);
    }
    
    if (bloombergArticles.status === 'fulfilled') {
      articles.push(...bloombergArticles.value);
    } else {
      console.error('Failed to fetch Bloomberg:', bloombergArticles.reason);
      // Use cached Bloomberg if available
      if (cachedArticles) {
        const cachedBloomberg = cachedArticles.filter(a => a.source === 'bloomberg');
        articles.push(...cachedBloomberg.slice(0, perSourceLimit));
      }
    }
    
    if (wsjArticles.status === 'fulfilled') {
      articles.push(...wsjArticles.value);
    } else {
      console.error('Failed to fetch Wall Street Journal:', wsjArticles.reason);
      // Use cached WSJ if available
      if (cachedArticles) {
        const cachedWSJ = cachedArticles.filter(a => a.source === 'wsj');
        articles.push(...cachedWSJ.slice(0, perSourceLimit));
      }
    }

    // Update cache if we fetched fresh data
    if (forceRefresh || !cachedArticles || now - cacheTime > CACHE_DURATION) {
      cachedArticles = articles;
      cacheTime = now;
    }

    // Sort by time (newest first) and limit
    return articles
      .sort((a, b) => b.time - a.time)
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching all articles:', error);
    throw error;
  }
}

router.get('/articles', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const source = req.query.source; // Optional: filter by source
    const refresh = req.query.refresh === 'true'; // Optional: force refresh

    let articles;
    if (source === 'hackernews') {
      articles = await hackernewsFetcher.fetchTopStories(limit);
    } else if (source === 'bloomberg') {
      // For Bloomberg, use cache unless forced refresh
      const now = Date.now();
      if (refresh || !cachedArticles || now - cacheTime > CACHE_DURATION) {
        console.log('Fetching fresh Bloomberg data...');
        articles = await bloombergFetcher.fetchBloombergNews(limit);
        // Update cache
        if (cachedArticles) {
          const nonBloombergArticles = cachedArticles.filter(a => a.source !== 'bloomberg');
          cachedArticles = [...nonBloombergArticles, ...articles];
        } else {
          cachedArticles = articles;
        }
        cacheTime = now;
      } else {
        // Use cached Bloomberg articles
        articles = cachedArticles
          .filter(a => a.source === 'bloomberg')
          .slice(0, limit);
        console.log(`Using cached Bloomberg data (${articles.length} articles)`);
      }
    } else if (source === 'wsj') {
      // For WSJ, use cache unless forced refresh
      const now = Date.now();
      if (refresh || !cachedArticles || now - cacheTime > CACHE_DURATION) {
        console.log('Fetching fresh WSJ data...');
        articles = await wsjFetcher.fetchWSJNews(limit);
        // Update cache
        if (cachedArticles) {
          const nonWSJArticles = cachedArticles.filter(a => a.source !== 'wsj');
          cachedArticles = [...nonWSJArticles, ...articles];
        } else {
          cachedArticles = articles;
        }
        cacheTime = now;
      } else {
        // Use cached WSJ articles
        articles = cachedArticles
          .filter(a => a.source === 'wsj')
          .slice(0, limit);
        console.log(`Using cached WSJ data (${articles.length} articles)`);
      }
    } else {
      // All sources - use cache with optional refresh
      articles = await fetchAllArticles(limit, refresh);
    }

    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

router.get('/trending', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const source = req.query.source; // Optional: filter by source

    let articles;
    if (source === 'hackernews') {
      articles = await hackernewsFetcher.fetchTopStories(50);
    } else if (source === 'bloomberg') {
      articles = await bloombergFetcher.fetchBloombergNews(50);
    } else if (source === 'wsj') {
      articles = await wsjFetcher.fetchWSJNews(50);
    } else {
      // Fetch from all sources for trending
      const [hackernewsArticles, bloombergArticles, wsjArticles] = await Promise.allSettled([
        hackernewsFetcher.fetchTopStories(20),
        bloombergFetcher.fetchBloombergNews(20),
        wsjFetcher.fetchWSJNews(20)
      ]);

      articles = [];
      if (hackernewsArticles.status === 'fulfilled') {
        articles.push(...hackernewsArticles.value);
      }
      if (bloombergArticles.status === 'fulfilled') {
        articles.push(...bloombergArticles.value);
      }
      if (wsjArticles.status === 'fulfilled') {
        articles.push(...wsjArticles.value);
      }
    }

    const ranked = trendingCalculator.rankArticles(articles);
    res.json(ranked.slice(0, limit));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trending articles' });
  }
});

router.get('/sources', (req, res) => {
  res.json([
    { name: 'hackernews', enabled: true, category: 'technology' },
    { name: 'bloomberg', enabled: true, category: 'financial' },
    { name: 'wsj', enabled: true, category: 'business' },
    { name: 'reddit', enabled: false, category: 'social' },
    { name: 'techcrunch', enabled: false, category: 'technology' }
  ]);
});

router.get('/categories', (req, res) => {
  res.json([
    { name: 'technology', sources: ['hackernews'] },
    { name: 'financial', sources: ['bloomberg'] },
    { name: 'business', sources: ['wsj'] },
    { name: 'all', sources: ['hackernews', 'bloomberg', 'wsj'] }
  ]);
});

// Manual refresh endpoints
let isFetchingBloomberg = false;
let isFetchingWSJ = false;
let lastBloombergFetchTime = 0;
let lastWSJFetchTime = 0;
const MIN_WSJ_FETCH_INTERVAL = 2 * 60 * 1000; // 2 minutes for WSJ (more conservative)

router.post('/refresh/bloomberg', async (req, res) => {
  try {
    const now = Date.now();
    
    // Rate limiting
    if (isFetchingBloomberg) {
      return res.status(429).json({ 
        error: 'Already fetching Bloomberg data. Please wait.' 
      });
    }
    
    if (now - lastBloombergFetchTime < MIN_FETCH_INTERVAL) {
      const waitSeconds = Math.ceil((MIN_FETCH_INTERVAL - (now - lastBloombergFetchTime)) / 1000);
      return res.status(429).json({ 
        error: `Rate limited. Please wait ${waitSeconds} seconds before refreshing again.` 
      });
    }
    
    isFetchingBloomberg = true;
    lastBloombergFetchTime = now;
    
    console.log('Manual Bloomberg refresh requested...');
    const articles = await bloombergFetcher.fetchBloombergNews(10);
    
    // Update cache with new Bloomberg articles
    if (cachedArticles) {
      // Remove old Bloomberg articles
      const nonBloombergArticles = cachedArticles.filter(a => a.source !== 'bloomberg');
      cachedArticles = [...nonBloombergArticles, ...articles];
    } else {
      cachedArticles = articles;
    }
    
    cacheTime = now;
    isFetchingBloomberg = false;
    
    res.json({ 
      success: true, 
      message: `Refreshed ${articles.length} Bloomberg articles`,
      articlesCount: articles.length,
      cachedUntil: new Date(now + CACHE_DURATION).toISOString()
    });
    
  } catch (error) {
    isFetchingBloomberg = false;
    console.error('Error refreshing Bloomberg:', error);
    res.status(500).json({ 
      error: 'Failed to refresh Bloomberg data',
      details: error.message 
    });
  }
});

// WSJ refresh endpoint
router.post('/refresh/wsj', async (req, res) => {
  try {
    const now = Date.now();
    
    // Rate limiting
    if (isFetchingWSJ) {
      return res.status(429).json({ 
        error: 'Already fetching WSJ data. Please wait.' 
      });
    }
    
    if (now - lastWSJFetchTime < MIN_WSJ_FETCH_INTERVAL) {
      const waitSeconds = Math.ceil((MIN_WSJ_FETCH_INTERVAL - (now - lastWSJFetchTime)) / 1000);
      return res.status(429).json({ 
        error: `Rate limited. Please wait ${waitSeconds} seconds before refreshing again.` 
      });
    }
    
    isFetchingWSJ = true;
    lastWSJFetchTime = now;
    
    console.log('Manual WSJ refresh requested...');
    const articles = await wsjFetcher.fetchWSJNews(10);
    
    // Update cache with new WSJ articles
    if (cachedArticles) {
      // Remove old WSJ articles
      const nonWSJArticles = cachedArticles.filter(a => a.source !== 'wsj');
      cachedArticles = [...nonWSJArticles, ...articles];
    } else {
      cachedArticles = articles;
    }
    
    cacheTime = now;
    isFetchingWSJ = false;
    
    res.json({ 
      success: true, 
      message: `Refreshed ${articles.length} Wall Street Journal articles`,
      articlesCount: articles.length,
      cachedUntil: new Date(now + CACHE_DURATION).toISOString()
    });
    
  } catch (error) {
    isFetchingWSJ = false;
    console.error('Error refreshing WSJ:', error);
    res.status(500).json({ 
      error: 'Failed to refresh WSJ data',
      details: error.message 
    });
  }
});

// Get cache status
router.get('/cache/status', (req, res) => {
  const now = Date.now();
  const cacheAge = cachedArticles ? now - cacheTime : null;
  const cacheValid = cachedArticles && cacheAge < CACHE_DURATION;
  
  // Count articles by source and scraped status
  const sourceStats = {};
  if (cachedArticles) {
    cachedArticles.forEach(article => {
      if (!sourceStats[article.source]) {
        sourceStats[article.source] = {
          total: 0,
          scraped: 0,
          fallback: 0
        };
      }
      sourceStats[article.source].total++;
      if (article.scraped) {
        sourceStats[article.source].scraped++;
      } else {
        sourceStats[article.source].fallback++;
      }
    });
  }
  
  // Calculate success rates
  const successRates = {};
  Object.keys(sourceStats).forEach(source => {
    const stats = sourceStats[source];
    successRates[source] = stats.total > 0 ? 
      Math.round((stats.scraped / stats.total) * 100) : 0;
  });
  
  res.json({
    hasCache: !!cachedArticles,
    cacheTime: cacheTime ? new Date(cacheTime).toISOString() : null,
    cacheAge: cacheAge ? `${Math.round(cacheAge / 1000)} seconds` : null,
    cacheValid: cacheValid,
    expiresIn: cacheValid ? `${Math.round((CACHE_DURATION - cacheAge) / 1000)} seconds` : 'expired',
    isFetchingBloomberg: isFetchingBloomberg,
    isFetchingWSJ: isFetchingWSJ,
    lastBloombergFetchTime: lastBloombergFetchTime ? new Date(lastBloombergFetchTime).toISOString() : null,
    lastWSJFetchTime: lastWSJFetchTime ? new Date(lastWSJFetchTime).toISOString() : null,
    sourceStats: sourceStats,
    successRates: successRates,
    totalArticles: cachedArticles ? cachedArticles.length : 0,
    scrapingTips: [
      'To improve scraping success:',
      '1. Export cookies from Chrome using EditThisCookie extension',
      '2. Save as bloomberg-cookies.json and wsj-cookies.json',
      '3. Place in tools/news-aggregator/.cookies/',
      '4. Make sure you\'re logged into Bloomberg/WSJ in Chrome'
    ]
  });
});

// Proxy endpoint for frontend-initiated scraping
router.post('/proxy/fetch', async (req, res) => {
  try {
    const { url, source } = req.body;
    
    if (!url || !source) {
      return res.status(400).json({ error: 'Missing url or source parameter' });
    }
    
    // Validate URL to prevent abuse
    const allowedDomains = ['bloomberg.com', 'wsj.com', 'www.bloomberg.com', 'www.wsj.com'];
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    
    if (!allowedDomains.some(allowed => domain.endsWith(allowed))) {
      return res.status(400).json({ 
        error: 'Invalid domain. Only Bloomberg and WSJ are allowed.' 
      });
    }
    
    console.log(`🌐 Proxy request: ${source} -> ${url}`);
    
    // The frontend will make the actual fetch request and send us the HTML
    // This endpoint expects the HTML in the request body
    const { html } = req.body;
    
    if (!html) {
      return res.status(400).json({ error: 'Missing HTML content' });
    }
    
    // Parse HTML and extract articles
    const articles = extractArticlesFromHTML(html, source);
    
    res.json({
      success: true,
      source: source,
      articles: articles,
      count: articles.length
    });
    
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).json({ 
      error: 'Proxy request failed',
      details: error.message 
    });
  }
});

// Helper function to extract articles from HTML
function extractArticlesFromHTML(html, source) {
  const articles = [];
  
  try {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    if (source === 'bloomberg') {
      // Bloomberg-specific extraction
      const bloombergSelectors = [
        'a[href*="/news/articles/"]',
        'article a',
        '.story-list a',
        '.headline a',
        '[data-component="headline"] a'
      ];
      
      for (const selector of bloombergSelectors) {
        const links = document.querySelectorAll(selector);
        links.forEach(link => {
          const href = link.href;
          const text = link.textContent?.trim() || '';
          
          if (href && text.length > 15 && text.length < 200 &&
              !text.includes('Subscribe') && !text.includes('Sign In')) {
            
            const parent = link.closest('article, div, section, li') || link.parentElement;
            const parentText = parent?.textContent?.trim() || text;
            const title = parentText.length > text.length ? parentText : text;
            
            articles.push({
              title: title.substring(0, 200),
              url: href,
              source: 'bloomberg',
              timestamp: Date.now(),
              scraped: true
            });
          }
        });
      }
    } 
    else if (source === 'wsj') {
      // WSJ-specific extraction
      const wsjSelectors = [
        'a[href*="/articles/"]',
        'article a',
        '.WSJTheme--headline--',
        '[data-testid="headline"] a',
        '.headline a'
      ];
      
      for (const selector of wsjSelectors) {
        const links = document.querySelectorAll(selector);
        links.forEach(link => {
          const href = link.href;
          const text = link.textContent?.trim() || '';
          
          if (href && text.length > 15 && text.length < 200 &&
              !text.includes('Subscribe') && !text.includes('Sign In')) {
            
            const parent = link.closest('article, div, section, li') || link.parentElement;
            const parentText = parent?.textContent?.trim() || text;
            const title = parentText.length > text.length ? parentText : text;
            
            articles.push({
              title: title.substring(0, 200),
              url: href,
              source: 'wsj',
              timestamp: Date.now(),
              scraped: true
            });
          }
        });
      }
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
    
    return uniqueArticles.slice(0, 10); // Limit to 10 articles
    
  } catch (error) {
    console.error('HTML parsing error:', error.message);
    return [];
  }
}

// Direct proxy endpoint (server makes the request)
router.get('/proxy/direct', async (req, res) => {
  try {
    const { url, source } = req.query;
    
    if (!url || !source) {
      return res.status(400).json({ error: 'Missing url or source parameter' });
    }
    
    // Validate URL
    const allowedDomains = ['bloomberg.com', 'wsj.com', 'www.bloomberg.com', 'www.wsj.com'];
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    
    if (!allowedDomains.some(allowed => domain.endsWith(allowed))) {
      return res.status(400).json({ 
        error: 'Invalid domain. Only Bloomberg and WSJ are allowed.' 
      });
    }
    
    console.log(`🌐 Direct proxy: ${source} -> ${url}`);
    
    // Make the request with realistic headers
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0'
      },
      timeout: 10000
    });
    
    // Extract articles from the HTML
    const articles = extractArticlesFromHTML(response.data, source);
    
    res.json({
      success: true,
      source: source,
      url: url,
      articles: articles,
      count: articles.length
    });
    
  } catch (error) {
    console.error('Direct proxy error:', error.message);
    res.status(500).json({ 
      error: 'Direct proxy request failed',
      details: error.message 
    });
  }
});

// Bookmarklet endpoint
router.post('/bookmarklet', async (req, res) => {
  try {
    const { articles, source, url } = req.body;
    
    if (!articles || !Array.isArray(articles)) {
      return res.status(400).json({ error: 'Missing or invalid articles array' });
    }
    
    const detectedSource = source || detectSourceFromArticles(articles) || 'unknown';
    console.log(`📚 Bookmarklet received ${articles.length} articles from ${detectedSource}`);
    
    // Format articles
    const formattedArticles = articles.map((article, index) => ({
      id: `bookmarklet-${detectedSource}-${Date.now()}-${index}`,
      title: article.title || `Article ${index + 1}`,
      url: article.url || `https://${detectedSource}.com/article-${index}`,
      score: 80 + Math.floor(Math.random() * 20), // High score for manually collected articles
      time: Math.floor(Date.now() / 1000),
      by: detectedSource === 'bloomberg' ? 'Bloomberg' : 
          detectedSource === 'wsj' ? 'Wall Street Journal' : 
          detectedSource.charAt(0).toUpperCase() + detectedSource.slice(1),
      descendants: 20 + Math.floor(Math.random() * 30),
      source: detectedSource,
      description: article.description || `News from ${detectedSource}: ${article.title || 'Untitled'}`,
      category: detectedSource === 'bloomberg' ? 'financial' : 
                detectedSource === 'wsj' ? 'business' : 'general',
      scraped: true,
      bookmarklet: true // Mark as from bookmarklet
    }));
    
    // Update cache with new articles
    if (cachedArticles) {
      // Remove old articles from same source to avoid duplicates
      const otherArticles = cachedArticles.filter(a => a.source !== detectedSource || !a.bookmarklet);
      cachedArticles = [...formattedArticles, ...otherArticles];
    } else {
      cachedArticles = formattedArticles;
    }
    
    cacheTime = Date.now();
    
    res.json({
      success: true,
      message: `Added ${formattedArticles.length} articles from ${detectedSource}`,
      count: formattedArticles.length,
      source: detectedSource
    });
    
  } catch (error) {
    console.error('Bookmarklet error:', error.message);
    res.status(500).json({ 
      error: 'Bookmarklet processing failed',
      details: error.message 
    });
  }
});

// Helper to detect source from articles
function detectSourceFromArticles(articles) {
  if (!articles.length) return null;
  
  // Check URLs for source indicators
  const firstUrl = articles[0].url || '';
  if (firstUrl.includes('bloomberg.com')) return 'bloomberg';
  if (firstUrl.includes('wsj.com')) return 'wsj';
  if (firstUrl.includes('hackernews') || firstUrl.includes('ycombinator')) return 'hackernews';
  
  // Check article titles/source field
  const firstArticle = articles[0];
  if (firstArticle.source) return firstArticle.source;
  
  return null;
}

// Get bookmarklet code
router.get('/bookmarklet/code', (req, res) => {
  const source = req.query.source || 'bloomberg';
  const serverUrl = 'http://localhost:3001'; // In production, this would be your actual domain
  
  const bookmarkletCode = generateBookmarkletCode(source, serverUrl);
  
  res.json({
    code: bookmarkletCode,
    instructions: `1. Copy the code below
2. Create a new bookmark in Chrome
3. Paste as URL
4. When on ${source}.com, click the bookmark`,
    source: source
  });
});

// Generate bookmarklet JavaScript code
function generateBookmarkletCode(source, serverUrl) {
  const sourceConfig = {
    bloomberg: {
      name: 'Bloomberg',
      selectors: [
        'a[href*="/news/articles/"]',
        'article a',
        '.story-list a',
        '.headline a',
        '[data-component="headline"] a'
      ],
      urlPattern: 'bloomberg.com'
    },
    wsj: {
      name: 'Wall Street Journal',
      selectors: [
        'a[href*="/articles/"]',
        'article a',
        '.WSJTheme--headline--',
        '[data-testid="headline"] a',
        '.headline a'
      ],
      urlPattern: 'wsj.com'
    }
  };
  
  const config = sourceConfig[source] || sourceConfig.bloomberg;
  
  const code = `javascript:(function(){
  // ${config.name} Bookmarklet
  const articles = [];
  const selectors = ${JSON.stringify(config.selectors)};
  
  // Try each selector
  for (const selector of selectors) {
    if (articles.length >= 20) break;
    const links = document.querySelectorAll(selector);
    links.forEach(link => {
      if (articles.length >= 20) return;
      const href = link.href;
      const text = link.textContent?.trim() || link.innerText?.trim() || '';
      if (href && text.length > 10 && text.length < 200 && 
          !text.includes('Subscribe') && !text.includes('Sign In')) {
        articles.push({
          title: text.substring(0, 150),
          url: href,
          source: '${source}'
        });
      }
    });
  }
  
  if (articles.length === 0) {
    alert('No articles found on this page. Try a different ${config.name} page.');
    return;
  }
  
  // Send to news aggregator
  fetch('${serverUrl}/api/bookmarklet', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ 
      articles: articles,
      source: '${source}',
      url: window.location.href
    })
  })
  .then(response => response.json())
  .then(data => {
    alert('✅ Sent ' + articles.length + ' articles to News Aggregator!\\n' +
          'Open ${serverUrl} to view them.');
  })
  .catch(error => {
    alert('❌ Error: ' + error.message + '\\n' +
          'Make sure the news aggregator is running at ${serverUrl}');
  });
})();`;
  
  return code;
}

module.exports = router;