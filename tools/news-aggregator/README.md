# News Aggregator

A personal web application that fetches trending news from Hacker News and displays them ranked by influence and engagement.

## Features

- Fetches top stories from Hacker News API
- Calculates trending scores based on upvotes, comments, and recency
- Simple, clean web interface
- Auto-refreshes every minute
- Caches data to reduce API calls

## Quick Start

```bash
# From monorepo root
./run.sh news-aggregator

# Or navigate to tool directly
cd tools/news-aggregator
npm install
npm start
```

Visit http://localhost:3000 to see the trending news.

## API Endpoints

- `GET /api/articles` - Get recent articles
- `GET /api/trending?limit=10` - Get ranked trending articles
- `GET /api/sources` - List available news sources
- `GET /health` - Health check

## Architecture

- **Backend**: Node.js with Express
- **Frontend**: Simple HTML/JavaScript
- **Data Sources**: Hacker News API
- **Caching**: In-memory (15 min)

## Testing

```bash
cd tools/news-aggregator
npm test
```

## Development

Add more news sources by implementing new fetchers in `src/backend/fetchers/` and updating API routes.