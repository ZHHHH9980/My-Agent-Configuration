const express = require('express');
const cors = require('cors');
const router = express.Router();
const hackernewsFetcher = require('../fetchers/hackernews');
const trendingCalculator = require('../aggregators/trending-calculator');

let cachedArticles = null;
let cacheTime = 0;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

router.get('/articles', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const now = Date.now();

    if (cachedArticles && now - cacheTime < CACHE_DURATION) {
      return res.json(cachedArticles.slice(0, limit));
    }

    const articles = await hackernewsFetcher.fetchTopStories(limit);
    cachedArticles = articles;
    cacheTime = now;

    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

router.get('/trending', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const articles = await hackernewsFetcher.fetchTopStories(50);
    const ranked = trendingCalculator.rankArticles(articles);
    res.json(ranked.slice(0, limit));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trending articles' });
  }
});

router.get('/sources', (req, res) => {
  res.json([
    { name: 'hackernews', enabled: true },
    { name: 'reddit', enabled: false },
    { name: 'techcrunch', enabled: false }
  ]);
});

module.exports = router;