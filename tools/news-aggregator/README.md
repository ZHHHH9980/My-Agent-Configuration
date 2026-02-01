# News Aggregator

A modern news aggregator that fetches trending articles from multiple sources, categorizes them, and provides a clean interface for browsing.

## 🚀 Features

### 📰 **News Sources**
- **Hacker News** - Technology and startup news via API
- **Bloomberg** - Financial and business news via browser scraping
- **Extensible architecture** - Easy to add new sources

### 🎯 **Core Functionality**
- **Multi-source aggregation** - Combine news from different categories
- **Source filtering** - Filter by source (All/Hacker News/Bloomberg)
- **Manual refresh** - On-demand fetching to prevent rate limiting
- **30-minute caching** - Reduces API calls and improves performance
- **Rate limiting** - 1-minute cooldown between manual refreshes

### 🔧 **Technical Features**
- **Browser-based scraping** - Uses Puppeteer for real-time Bloomberg data
- **Fallback system** - Mock data ensures app always works
- **Trending algorithm** - Calculates article popularity scores
- **RESTful API** - Clean endpoints for frontend consumption

## 📁 Project Structure

```
tools/news-aggregator/
├── src/
│   ├── backend/
│   │   ├── fetchers/           # News source fetchers
│   │   │   ├── hackernews.js   # Hacker News API fetcher
│   │   │   ├── bloomberg-browser.js  # Bloomberg browser scraper
│   │   │   └── bloomberg.js    # Bloomberg API fetcher (unused)
│   │   ├── aggregators/        # Article processing
│   │   │   └── trending-calculator.js  # Trending score algorithm
│   │   ├── api/               # API routes
│   │   │   └── routes.js      # All API endpoints
│   │   └── server.js          # Express server
│   └── frontend/
│       └── index.html         # Main interface
├── test/                      # Test files
├── package.json              # Dependencies
└── README.md                 # This file
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 16+
- npm or yarn
- Chrome/Chromium (for Bloomberg scraping)

### Installation
```bash
cd tools/news-aggregator
npm install
```

### Running the Application
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The application will be available at: `http://localhost:3001`

## 📡 API Endpoints

### GET `/api/news`
Fetch all news articles with optional filtering.

**Query Parameters:**
- `source` - Filter by source: `hackernews`, `bloomberg`, or omit for all
- `limit` - Number of articles to return (default: 50)

**Example:**
```bash
curl "http://localhost:3001/api/news?source=bloomberg&limit=10"
```

### GET `/api/categories`
Get available news categories.

**Response:**
```json
{
  "categories": [
    {"id": "technology", "name": "Technology", "source": "hackernews"},
    {"id": "financial", "name": "Financial", "source": "bloomberg"}
  ]
}
```

### POST `/api/refresh/bloomberg`
Manually refresh Bloomberg news (rate limited to 1 request per minute).

**Response:**
```json
{
  "success": true,
  "message": "Bloomberg news refreshed successfully",
  "articles": 15
}
```

### GET `/api/cache/status`
Check cache status and expiration.

**Response:**
```json
{
  "bloomberg": {
    "cached": true,
    "expiresIn": 1200,
    "articleCount": 15
  },
  "hackernews": {
    "cached": true,
    "expiresIn": 900,
    "articleCount": 30
  }
}
```

## 🎨 Frontend Features

### Interface Components
- **Source Filter Dropdown** - Switch between news sources
- **Refresh Button** - Manual Bloomberg news refresh
- **Cache Status** - Shows when data was last updated
- **Article Cards** - Clean display with source badges

### Usage
1. Open `http://localhost:3001` in your browser
2. Use the dropdown to filter by source
3. Click "🔄 Refresh Bloomberg News" to fetch latest financial news
4. Watch Chrome launch briefly for real scraping
5. View articles with cache status indicators

## 🔬 Technical Details

### News Fetchers
- **Hacker News**: Uses official API with Axios
- **Bloomberg**: Uses Puppeteer for browser scraping with fallback to mock data

### Caching System
- **30-minute cache** for all news sources
- **In-memory storage** with expiration timestamps
- **Manual refresh** bypasses cache when needed

### Safety Features
- **Rate limiting** - Prevents excessive browser launches
- **Fallback data** - App works even if scraping fails
- **Error handling** - Graceful degradation on failures

### Trending Algorithm
The `trending-calculator.js` calculates article scores based on:
- Engagement metrics (upvotes, comments, shares)
- Recency bonus (newer articles score higher)
- Time decay (older articles lose score over 24 hours)

## 🧪 Testing

Run tests with:
```bash
npm test
```

Test coverage includes:
- API endpoint responses
- Fetcher functionality
- Trending calculator logic

## 🔧 Adding New News Sources

To add a new news source:

1. Create a new fetcher in `src/backend/fetchers/`:
```javascript
// Example: reddit.js
module.exports = {
  name: 'Reddit',
  category: 'social',
  fetch: async () => {
    // Fetch and return articles
    return articles;
  }
};
```

2. Add to routes in `src/backend/api/routes.js`:
```javascript
const redditFetcher = require('../fetchers/reddit');
// Add to sources array
```

3. Update frontend dropdown in `src/frontend/index.html`

## ⚠️ Important Notes

### Browser Automation
- Bloomberg scraping uses Puppeteer (headless Chrome)
- Chrome will launch briefly when refreshing Bloomberg news
- Rate limited to prevent detection/blocking

### Rate Limiting
- Manual refresh only (no automatic polling)
- 1-minute cooldown between Bloomberg refreshes
- Prevents triggering anti-bot measures

### Fallback System
- If Bloomberg scraping fails, mock data is returned
- App remains functional even with scraping issues
- Real data resumes on next successful refresh

## 📈 Future Enhancements

### Planned Features
1. **More news sources** (Reddit, TechCrunch, etc.)
2. **Search functionality** across all articles
3. **User preferences** (saved filters, favorite sources)
4. **Email digest** - Daily/weekly summary emails
5. **Mobile app** - React Native or Progressive Web App

### Technical Improvements
1. **Database integration** - Persistent storage for articles
2. **Background jobs** - Scheduled fetching with queue system
3. **Analytics dashboard** - Track popular articles and sources
4. **API documentation** - Swagger/OpenAPI specification
5. **Docker deployment** - Containerized application

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Hacker News for their public API
- Bloomberg for financial news content
- Puppeteer team for browser automation tools
- Express.js for the web framework