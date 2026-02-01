const express = require('express');
const cors = require('cors');
const router = express.Router();
const hackernewsFetcher = require('../fetchers/hackernews');
const bloombergFetcher = require('../fetchers/bloomberg-browser');
const trendingCalculator = require('../aggregators/trending-calculator');

let cachedArticles = null;
let cacheTime = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes cache
let isFetching = false;
let lastFetchTime = 0;
const MIN_FETCH_INTERVAL = 60 * 1000; // 1 minute between fetches

async function fetchAllArticles(limit = 20, forceRefresh = false) {
  try {
    const now = Date.now();
    const hackernewsPromise = hackernewsFetcher.fetchTopStories(Math.ceil(limit / 2));
    
    let bloombergPromise;
    if (forceRefresh || !cachedArticles || now - cacheTime > CACHE_DURATION) {
      // Fetch Bloomberg if cache expired or forced refresh
      bloombergPromise = bloombergFetcher.fetchBloombergNews(Math.ceil(limit / 2));
    } else {
      // Use cached Bloomberg articles
      bloombergPromise = Promise.resolve(
        cachedArticles.filter(a => a.source === 'bloomberg').slice(0, Math.ceil(limit / 2))
      );
    }

    const [hackernewsArticles, bloombergArticles] = await Promise.allSettled([
      hackernewsPromise,
      bloombergPromise
    ]);

    const articles = [];
    
    if (hackernewsArticles.status === 'fulfilled') {
      articles.push(...hackernewsArticles.value);
    } else {
      console.error('Failed to fetch Hacker News:', hackernewsArticles.reason);
    }
    
    if (bloombergArticles.status === 'fulfilled') {
      articles.push(...bloombergArticles.value);
      // Update cache if we fetched fresh Bloomberg data
      if (forceRefresh || !cachedArticles || now - cacheTime > CACHE_DURATION) {
        cachedArticles = articles;
        cacheTime = now;
      }
    } else {
      console.error('Failed to fetch Bloomberg:', bloombergArticles.reason);
      // Use cached Bloomberg if available
      if (cachedArticles) {
        const cachedBloomberg = cachedArticles.filter(a => a.source === 'bloomberg');
        articles.push(...cachedBloomberg.slice(0, Math.ceil(limit / 2)));
      }
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
    } else {
      // Fetch from all sources for trending
      const [hackernewsArticles, bloombergArticles] = await Promise.allSettled([
        hackernewsFetcher.fetchTopStories(30),
        bloombergFetcher.fetchBloombergNews(30)
      ]);

      articles = [];
      if (hackernewsArticles.status === 'fulfilled') {
        articles.push(...hackernewsArticles.value);
      }
      if (bloombergArticles.status === 'fulfilled') {
        articles.push(...bloombergArticles.value);
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
    { name: 'reddit', enabled: false, category: 'social' },
    { name: 'techcrunch', enabled: false, category: 'technology' }
  ]);
});

router.get('/categories', (req, res) => {
  res.json([
    { name: 'technology', sources: ['hackernews'] },
    { name: 'financial', sources: ['bloomberg'] },
    { name: 'all', sources: ['hackernews', 'bloomberg'] }
  ]);
});

// Manual refresh endpoint
router.post('/refresh/bloomberg', async (req, res) => {
  try {
    const now = Date.now();
    
    // Rate limiting
    if (isFetching) {
      return res.status(429).json({ 
        error: 'Already fetching Bloomberg data. Please wait.' 
      });
    }
    
    if (now - lastFetchTime < MIN_FETCH_INTERVAL) {
      const waitSeconds = Math.ceil((MIN_FETCH_INTERVAL - (now - lastFetchTime)) / 1000);
      return res.status(429).json({ 
        error: `Rate limited. Please wait ${waitSeconds} seconds before refreshing again.` 
      });
    }
    
    isFetching = true;
    lastFetchTime = now;
    
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
    isFetching = false;
    
    res.json({ 
      success: true, 
      message: `Refreshed ${articles.length} Bloomberg articles`,
      articlesCount: articles.length,
      cachedUntil: new Date(now + CACHE_DURATION).toISOString()
    });
    
  } catch (error) {
    isFetching = false;
    console.error('Error refreshing Bloomberg:', error);
    res.status(500).json({ 
      error: 'Failed to refresh Bloomberg data',
      details: error.message 
    });
  }
});

// Get cache status
router.get('/cache/status', (req, res) => {
  const now = Date.now();
  const cacheAge = cachedArticles ? now - cacheTime : null;
  const cacheValid = cachedArticles && cacheAge < CACHE_DURATION;
  
  res.json({
    hasCache: !!cachedArticles,
    cacheTime: cacheTime ? new Date(cacheTime).toISOString() : null,
    cacheAge: cacheAge ? `${Math.round(cacheAge / 1000)} seconds` : null,
    cacheValid: cacheValid,
    expiresIn: cacheValid ? `${Math.round((CACHE_DURATION - cacheAge) / 1000)} seconds` : 'expired',
    isFetching: isFetching,
    lastFetchTime: lastFetchTime ? new Date(lastFetchTime).toISOString() : null
  });
});

module.exports = router;