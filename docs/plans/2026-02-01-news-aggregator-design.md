# News Aggregator Platform Design

**Date:** 2026-02-01
**Purpose:** Create a web platform to fetch and render the hottest, most influential news and blogs

## Overview

A personal web application that aggregates news from multiple sources (Hacker News, Reddit, tech blogs), ranks articles by influence and trending metrics, and presents them in a clean, filterable interface.

## Monorepo Architecture

```
my-agent-configuration/
├── skills/              # Skills tracking system
├── tools/               # All tools
│   └── news-aggregator/
├── run.sh               # Main launcher
└── docs/
    └── plans/           # Design documents
```

## News Aggregator Structure

```
tools/news-aggregator/
├── src/
│   ├── backend/
│   │   ├── fetchers/       # News source fetchers
│   │   │   ├── hackernews.js
│   │   │   ├── reddit.js
│   │   │   └── techcrunch.js
│   │   ├── aggregators/    # Combine and rank content
│   │   ├── api/           # REST API endpoints
│   │   └── cache/         # Redis/In-memory cache
│   ├── frontend/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   └── styles/        # CSS/styling
│   └── shared/            # Shared utilities
├── config/
│   └── sources.json       # Configure news sources
├── package.json
└── README.md
```

## Data Flow

1. **Fetchers** → Poll external APIs every 15 minutes
2. **Cache** → Store raw data (Redis/memory) for 30 minutes
3. **Aggregator** → Calculate trending scores
4. **API** → Serve ranked articles via REST endpoints
5. **Frontend** → Fetch and display with filtering

## Key Components

### Backend
- `HackerNewsFetcher` - Gets top stories from HN API
- `RedditFetcher` - Scrapes trending subreddits
- `BlogRssFetcher` - Parses RSS feeds from tech blogs
- `TrendingCalculator` - Ranks articles by engagement metrics
- `ArticleCache` - Prevents API rate limiting
- `ApiRoutes` - `/api/articles`, `/api/sources`, `/api/trending`

### Frontend
- `ArticleCard` - Displays article with trending score
- `FilterPanel` - Filter by source, time range, score
- `TrendingList` - Main list with infinite scroll

## Trending Algorithm

Score = (upvotes × 1.0) + (comments × 2.0) + (shares × 3.0) + (recency bonus)

## Launcher System

`run.sh` serves as unified entry point:

```bash
./run.sh help                    # Show all available tools
./run.sh list                    # List tools with status
./run.sh news-aggregator         # Launch news aggregator
./run.sh skills add <skill>      # Access skills commands
./run.sh skills sync             # Sync skills between laptops
```

## Technology Stack

- **Backend:** Node.js, Express, Redis (optional)
- **Frontend:** React, modern CSS
- **APIs:** Hacker News API, Reddit API, RSS feeds

## Implementation Phases

1. **Setup monorepo structure**
2. **Implement basic launcher**
3. **Build news fetcher prototype**
4. **Create trending algorithm**
5. **Build API endpoints**
6. **Create frontend components**
7. **Add filtering and sorting**
8. **Testing and deployment**