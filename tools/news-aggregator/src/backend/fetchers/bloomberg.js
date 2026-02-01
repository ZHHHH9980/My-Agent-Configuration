const axios = require('axios');

// Using NewsAPI as a free alternative to Bloomberg API
// You'll need to get a free API key from https://newsapi.org
const NEWS_API_KEY = process.env.NEWS_API_KEY || 'your_newsapi_key_here';
const NEWS_API_BASE = 'https://newsapi.org/v2';

async function fetchFinancialNews(limit = 10) {
  try {
    if (NEWS_API_KEY === 'your_newsapi_key_here') {
      console.warn('Using mock data - set NEWS_API_KEY environment variable for real data');
      return getMockFinancialNews(limit);
    }

    const response = await axios.get(`${NEWS_API_BASE}/everything`, {
      params: {
        q: 'finance OR economy OR stocks OR markets',
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: limit,
        apiKey: NEWS_API_KEY
      }
    });

    return response.data.articles.map((article, index) => ({
      id: `bloomberg-${index}-${Date.now()}`,
      title: article.title,
      url: article.url,
      score: Math.floor(Math.random() * 100) + 1, // Mock score for ranking
      time: new Date(article.publishedAt).getTime() / 1000,
      by: article.source.name,
      descendants: Math.floor(Math.random() * 50), // Mock comment count
      source: 'bloomberg',
      description: article.description,
      imageUrl: article.urlToImage
    }));
  } catch (error) {
    console.error('Error fetching financial news:', error.message);
    
    // Fallback to mock data if API fails
    return getMockFinancialNews(limit);
  }
}

function getMockFinancialNews(limit) {
  const mockArticles = [
    {
      id: 'bloomberg-1',
      title: 'Federal Reserve Holds Interest Rates Steady Amid Inflation Concerns',
      url: 'https://www.bloomberg.com/news/articles/2024-01-15/fed-holds-rates-steady',
      score: 85,
      time: Math.floor(Date.now() / 1000) - 3600,
      by: 'Bloomberg',
      descendants: 42,
      source: 'bloomberg',
      description: 'The Federal Reserve kept interest rates unchanged while signaling caution on inflation trajectory.'
    },
    {
      id: 'bloomberg-2',
      title: 'Tech Stocks Rally as AI Investments Surge',
      url: 'https://www.bloomberg.com/news/articles/2024-01-15/tech-stocks-rally-ai',
      score: 92,
      time: Math.floor(Date.now() / 1000) - 7200,
      by: 'Bloomberg',
      descendants: 31,
      source: 'bloomberg',
      description: 'Major tech companies see stock gains following increased AI research spending announcements.'
    },
    {
      id: 'bloomberg-3',
      title: 'Global Oil Prices Stabilize After Middle East Tensions Ease',
      url: 'https://www.bloomberg.com/news/articles/2024-01-14/oil-prices-stabilize',
      score: 78,
      time: Math.floor(Date.now() / 1000) - 10800,
      by: 'Bloomberg',
      descendants: 28,
      source: 'bloomberg',
      description: 'Crude oil prices find equilibrium following diplomatic efforts in the region.'
    },
    {
      id: 'bloomberg-4',
      title: 'Cryptocurrency Market Shows Signs of Recovery',
      url: 'https://www.bloomberg.com/news/articles/2024-01-14/crypto-recovery-signs',
      score: 65,
      time: Math.floor(Date.now() / 1000) - 14400,
      by: 'Bloomberg',
      descendants: 56,
      source: 'bloomberg',
      description: 'Bitcoin and major altcoins gain momentum amid renewed institutional interest.'
    },
    {
      id: 'bloomberg-5',
      title: 'Housing Market Cools as Mortgage Rates Remain Elevated',
      url: 'https://www.bloomberg.com/news/articles/2024-01-13/housing-market-cools',
      score: 71,
      time: Math.floor(Date.now() / 1000) - 18000,
      by: 'Bloomberg',
      descendants: 39,
      source: 'bloomberg',
      description: 'Home sales slow down while prices show modest declines in key markets.'
    }
  ];

  return mockArticles.slice(0, limit);
}

module.exports = { fetchFinancialNews };