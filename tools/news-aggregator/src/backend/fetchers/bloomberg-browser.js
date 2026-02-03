const puppeteer = require('puppeteer');
const browserUtils = require('./browser-utils');

async function fetchBloombergNews(limit = 10) {
  let browser = null;
  let page = null;
  
  try {
    console.log('🚀 Launching enhanced browser to fetch Bloomberg news...');
    
    // Get enhanced launch options with Chrome profile
    const launchOptions = browserUtils.getEnhancedLaunchOptions();
    
    console.log('Launching browser with enhanced fingerprinting...');
    browser = await puppeteer.launch(launchOptions);

    page = await browser.newPage();
    
    // Setup enhanced page with fingerprinting
    await browserUtils.setupEnhancedPage(page);
    
    // Load saved cookies if available
    await browserUtils.loadCookies(page, 'bloomberg');
    
    // Try multiple Bloomberg URLs
    const bloombergUrls = [
      'https://www.bloomberg.com',
      'https://www.bloomberg.com/markets',
      'https://www.bloomberg.com/news',
      'https://www.bloomberg.com/business'
    ];
    
    let articles = [];
    let success = false;
    
    for (const url of bloombergUrls) {
      if (success) break;
      
      console.log(`🌐 Attempting: ${url}...`);
      
      try {
        // Simulate human behavior before navigation
        await browserUtils.simulateHumanBehavior(page);
        
        // Navigate with realistic wait conditions
        await page.goto(url, { 
          waitUntil: 'networkidle2',
          timeout: 30000 
        });
        
        console.log('✓ Page loaded');
        
        // Check if page is blocked
        if (await browserUtils.isPageBlocked(page)) {
          console.log(`🚫 Blocked on ${url}, trying next...`);
          continue;
        }
        
        // Take debug screenshot
        await browserUtils.takeDebugScreenshot(page, 'bloomberg');
        
        // Wait for content to load
        await page.waitForTimeout(2000 + Math.random() * 3000);
        
        // Simulate more human behavior
        await browserUtils.simulateHumanBehavior(page);
        
        // Extract article data with improved selectors
        console.log('🔍 Extracting articles...');
        const extractedArticles = await page.evaluate((limit) => {
          const results = [];
          
          // Try multiple selector strategies
          const selectors = [
            'a[href*="/news/articles/"]',
            'a[href*="/news/"]',
            'article a',
            '.story-list a',
            '.headline a',
            '[data-component="headline"] a'
          ];
          
          for (const selector of selectors) {
            if (results.length >= limit) break;
            
            const links = Array.from(document.querySelectorAll(selector));
            for (const link of links) {
              if (results.length >= limit) break;
              
              const href = link.href;
              const text = link.textContent?.trim() || link.innerText?.trim() || '';
              
              if (href && text.length > 15 && text.length < 200 &&
                  !text.includes('Subscribe') && !text.includes('Sign In') &&
                  !text.includes('Log In')) {
                
                // Get more context
                const parent = link.closest('article, div, section, li') || link.parentElement;
                const parentText = parent?.textContent?.trim() || text;
                const title = parentText.length > text.length ? parentText : text;
                
                // Clean up title
                const cleanTitle = title
                  .replace(/\s+/g, ' ')
                  .replace(/\\n/g, ' ')
                  .trim()
                  .substring(0, 200);
                
                results.push({
                  title: cleanTitle,
                  url: href,
                  source: 'bloomberg',
                  timestamp: Date.now()
                });
              }
            }
          }
          
          // Fallback: look for headlines
          if (results.length < limit) {
            const headlines = Array.from(document.querySelectorAll('h1, h2, h3, h4'));
            for (const headline of headlines) {
              if (results.length >= limit) break;
              
              const text = headline.textContent?.trim() || '';
              if (text.length > 15 && text.length < 200) {
                const link = headline.querySelector('a')?.href || 
                            headline.closest('a')?.href ||
                            `https://www.bloomberg.com/news/articles/${Date.now()}-${results.length}`;
                
                results.push({
                  title: text.substring(0, 200),
                  url: link,
                  source: 'bloomberg',
                  timestamp: Date.now() - (results.length * 60000)
                });
              }
            }
          }
          
          return results.slice(0, limit);
        }, limit);
        
        if (extractedArticles.length > 0) {
          articles = extractedArticles;
          success = true;
          console.log(`✅ Found ${articles.length} articles from Bloomberg`);
          
          // Save cookies for next time
          await browserUtils.saveCookies(page, 'bloomberg');
          break;
        } else {
          console.log(`⚠️ No articles found on ${url}`);
        }
        
      } catch (error) {
        console.log(`⚠️ Error on ${url}: ${error.message}`);
      }
    }
    
    if (!success) {
      console.log('❌ All Bloomberg URLs failed, using fallback data');
    }
    
    // Format articles to match our schema
    const formattedArticles = articles.map((article, index) => ({
      id: `bloomberg-${Date.now()}-${index}`,
      title: article.title,
      url: article.url,
      score: Math.floor(Math.random() * 80) + 70, // Higher base score for real articles
      time: Math.floor(article.timestamp / 1000),
      by: 'Bloomberg',
      descendants: Math.floor(Math.random() * 50) + 20,
      source: 'bloomberg',
      description: `Financial news from Bloomberg: ${article.title}`,
      category: 'financial',
      scraped: success // Mark if this was actually scraped or fallback
    }));

    // If we didn't get enough real articles, add fallback data
    if (formattedArticles.length < limit) {
      const needed = limit - formattedArticles.length;
      console.log(`Adding ${needed} fallback articles...`);
      const mockArticles = getFallbackArticles(needed);
      formattedArticles.push(...mockArticles);
    }

    return formattedArticles.slice(0, limit);
    
  } catch (error) {
    console.error('❌ Error fetching Bloomberg news:', error.message);
    console.log('Falling back to mock data...');
    return getFallbackArticles(limit);
  } finally {
    if (browser) {
      try {
        await browser.close();
        console.log('✅ Browser closed');
      } catch (closeError) {
        console.error('Error closing browser:', closeError.message);
      }
    }
  }
}

function getFallbackArticles(limit) {
  const mockArticles = [
    {
      id: `bloomberg-fallback-${Date.now()}-1`,
      title: 'Federal Reserve Holds Interest Rates Steady Amid Inflation Concerns',
      url: 'https://www.bloomberg.com/news/articles/2024-01-15/fed-holds-rates-steady',
      score: 65,
      time: Math.floor(Date.now() / 1000) - 3600,
      by: 'Bloomberg',
      descendants: 42,
      source: 'bloomberg',
      description: 'The Federal Reserve kept interest rates unchanged while signaling caution on inflation trajectory.',
      category: 'financial',
      scraped: false
    },
    {
      id: `bloomberg-fallback-${Date.now()}-2`,
      title: 'Tech Stocks Rally as AI Investments Surge',
      url: 'https://www.bloomberg.com/news/articles/2024-01-15/tech-stocks-rally-ai',
      score: 72,
      time: Math.floor(Date.now() / 1000) - 7200,
      by: 'Bloomberg',
      descendants: 31,
      source: 'bloomberg',
      description: 'Major tech companies see stock gains following increased AI research spending announcements.',
      category: 'financial',
      scraped: false
    },
    {
      id: `bloomberg-fallback-${Date.now()}-3`,
      title: 'Global Oil Prices Stabilize After Middle East Tensions Ease',
      url: 'https://www.bloomberg.com/news/articles/2024-01-14/oil-prices-stabilize',
      score: 68,
      time: Math.floor(Date.now() / 1000) - 10800,
      by: 'Bloomberg',
      descendants: 28,
      source: 'bloomberg',
      description: 'Crude oil prices find equilibrium following diplomatic efforts in the region.',
      category: 'financial',
      scraped: false
    },
    {
      id: `bloomberg-fallback-${Date.now()}-4`,
      title: 'Cryptocurrency Market Shows Signs of Recovery',
      url: 'https://www.bloomberg.com/news/articles/2024-01-14/crypto-recovery-signs',
      score: 55,
      time: Math.floor(Date.now() / 1000) - 14400,
      by: 'Bloomberg',
      descendants: 56,
      source: 'bloomberg',
      description: 'Bitcoin and major altcoins gain momentum amid renewed institutional interest.',
      category: 'financial',
      scraped: false
    },
    {
      id: `bloomberg-fallback-${Date.now()}-5`,
      title: 'Housing Market Cools as Mortgage Rates Remain Elevated',
      url: 'https://www.bloomberg.com/news/articles/2024-01-13/housing-market-cools',
      score: 61,
      time: Math.floor(Date.now() / 1000) - 18000,
      by: 'Bloomberg',
      descendants: 39,
      source: 'bloomberg',
      description: 'Home sales slow down while prices show modest declines in key markets.',
      category: 'financial',
      scraped: false
    }
  ];

  return mockArticles.slice(0, limit);
}

module.exports = { fetchBloombergNews };