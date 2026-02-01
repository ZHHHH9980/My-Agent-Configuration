# News Aggregator Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a personal web application that aggregates news from multiple sources, ranks by influence, and presents in a filterable interface.

**Architecture:** Node.js/Express backend fetches from external APIs, calculates trending scores, serves via REST API. React frontend consumes API and displays articles with filtering and sorting.

**Tech Stack:** Node.js, Express, Redis (optional), React, modern CSS, Hacker News API, Reddit API, RSS feeds

---

## Phase 1: Monorepo Setup

### Task 1: Create monorepo directory structure

**Files:**
- Create: `skills/track-skill.sh` (move from root)
- Create: `skills/sync-skills.sh` (move from root)
- Create: `skills/skills-config.json` (move from root)
- Create: `skills/SETUP.md` (move from root)
- Create: `tools/` directory
- Create: `tools/news-aggregator/` directory

**Step 1: Create tools directory**

```bash
mkdir -p tools/news-aggregator
```

**Step 2: Move skills files**

```bash
mv track-skill.sh skills/
mv sync-skills.sh skills/
mv skills-config.json skills/
mv SETUP.md skills/
```

**Step 3: Verify structure**

Run: `ls -la skills/ tools/`
Expected: Both directories exist with files moved

**Step 4: Commit**

```bash
git add .
git commit -m "refactor: restructure into monorepo with skills and tools directories"
```

### Task 2: Create root README for monorepo

**Files:**
- Create: `README.md`

**Step 1: Create root README**

```markdown
# My Agent Configuration

A monorepo for managing skills and building useful tools.

## Structure

- `skills/` - Skills tracking system (manage your OpenCode skills across laptops)
- `tools/` - Useful tools and applications
- `run.sh` - Unified launcher for all tools and skills

## Quick Start

```bash
# Install dependencies
brew install jq

# Run the launcher
./run.sh
```

## Tools

### News Aggregator
Fetch and display trending news and blogs from multiple sources.

### Skills Tracking
Track and sync your OpenCode skills across multiple laptops.

See individual tool directories for detailed documentation.
```

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add root README for monorepo overview"
```

### Task 3: Update skills README paths

**Files:**
- Modify: `skills/SETUP.md:9,17,19,22,24,27,32,34,39,41`
- Modify: `skills/track-skill.sh:3`

**Step 1: Update paths in SETUP.md**

```bash
cd skills
sed -i '' 's|git clone <this-repo> my-agent-configuration|git clone <this-repo> my-agent-configuration && cd my-agent-configuration|g' SETUP.md
sed -i '' 's|\./track-skill.sh|skills/track-skill.sh|g' SETUP.md
sed -i '' 's|\./sync-skills.sh|skills/sync-skills.sh|g' SETUP.md
sed -i '' 's|skills-config.json|skills/skills-config.json|g' SETUP.md
cd ..
```

**Step 2: Update track-skill.sh config path**

```bash
sed -i '' 's|SKILLS_CONFIG="$(pwd)/skills-config.json"|SKILLS_CONFIG="$(dirname "$0")/skills-config.json"|g' skills/track-skill.sh
```

**Step 3: Commit**

```bash
git add skills/
git commit -m "refactor: update skills scripts to work from new directory structure"
```

---

## Phase 2: Launcher System

### Task 4: Create main launcher script

**Files:**
- Create: `run.sh`

**Step 1: Create run.sh with basic structure**

```bash
#!/bin/bash

# Main launcher for all tools and skills
REPO_DIR="$(cd "$(dirname "$0")" && pwd)"

show_help() {
    echo "My Agent Configuration Launcher"
    echo "================================"
    echo ""
    echo "Available tools:"
    echo "  news-aggregator  - Fetch and display trending news"
    echo ""
    echo "Skills management:"
    echo "  skills add <name>   - Add skill to list"
    echo "  skills remove <name> - Remove skill from list"
    echo "  skills list         - List all skills"
    echo "  skills sync         - Sync skills between laptops"
    echo ""
    echo "Usage: ./run.sh <tool-name> [command]"
    echo "   or: ./run.sh skills <command> [args]"
}

case "${1:-help}" in
    "help"|"-h"|"--help")
        show_help
        ;;
    "news-aggregator")
        echo "🚀 Launching news aggregator..."
        cd "$REPO_DIR/tools/news-aggregator"
        # Implementation to be added
        echo "News aggregator not yet implemented"
        ;;
    "skills")
        cd "$REPO_DIR/skills"
        ./track-skill.sh "${@:2}"
        ;;
    *)
        echo "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
```

**Step 2: Make executable**

```bash
chmod +x run.sh
```

**Step 3: Test launcher**

Run: `./run.sh help`
Expected: Shows help text

**Step 4: Test skills integration**

Run: `./run.sh skills list`
Expected: Lists skills

**Step 5: Commit**

```bash
git add run.sh
git commit -m "feat: add unified launcher script for tools and skills"
```

---

## Phase 3: News Aggregator Backend

### Task 5: Initialize Node.js project for news aggregator

**Files:**
- Create: `tools/news-aggregator/package.json`

**Step 1: Create package.json**

```json
{
  "name": "news-aggregator",
  "version": "1.0.0",
  "description": "Fetch and display trending news and blogs",
  "main": "src/backend/server.js",
  "scripts": {
    "start": "node src/backend/server.js",
    "dev": "node src/backend/server.js",
    "test": "echo \"Tests not yet implemented\""
  },
  "dependencies": {
    "express": "^4.18.2",
    "axios": "^1.6.0",
    "cors": "^2.8.5"
  },
  "keywords": ["news", "aggregator", "trending"],
  "author": "",
  "license": "MIT"
}
```

**Step 2: Create directory structure**

```bash
cd tools/news-aggregator
mkdir -p src/backend/{fetchers,aggregators,api,cache}
mkdir -p src/frontend/{components,pages,styles}
mkdir -p src/shared
mkdir -p config
cd ../..
```

**Step 3: Commit**

```bash
git add tools/news-aggregator/
git commit -m "feat: initialize news aggregator project structure"
```

### Task 6: Write test for HackerNews fetcher

**Files:**
- Create: `tools/news-aggregator/test/fetchers.test.js`

**Step 1: Create test directory and file**

```bash
mkdir -p tools/news-aggregator/test
```

**Step 2: Write failing test**

```javascript
const fetcher = require('../src/backend/fetchers/hackernews');

test('should fetch top stories from Hacker News', async () => {
  const stories = await fetcher.fetchTopStories(5);
  expect(Array.isArray(stories)).toBe(true);
  expect(stories.length).toBeLessThanOrEqual(5);
  if (stories.length > 0) {
    expect(stories[0]).toHaveProperty('id');
    expect(stories[0]).toHaveProperty('title');
    expect(stories[0]).toHaveProperty('url');
  }
}, 10000);
```

**Step 3: Create test runner package.json**

```bash
cd tools/news-aggregator
npm install --save-dev jest
cd ../..
```

**Step 4: Update package.json test script**

```bash
cd tools/news-aggregator
sed -i '' 's|"test": ".*"|"test": "jest --detectOpenHandles"|' package.json
cd ../..
```

**Step 5: Run test to verify it fails**

Run: `cd tools/news-aggregator && npm test`
Expected: FAIL - module not found

**Step 6: Commit**

```bash
git add tools/news-aggregator/test tools/news-aggregator/package.json
git commit -m "test: add failing test for HackerNews fetcher"
```

### Task 7: Implement HackerNews fetcher

**Files:**
- Create: `tools/news-aggregator/src/backend/fetchers/hackernews.js`

**Step 1: Implement fetcher**

```javascript
const axios = require('axios');

const HN_API_BASE = 'https://hacker-news.firebaseio.com/v0';

async function fetchTopStories(limit = 10) {
  try {
    const topStoriesIds = await axios.get(`${HN_API_BASE}/topstories.json`);
    const storyIds = topStoriesIds.data.slice(0, limit);

    const storyPromises = storyIds.map(id =>
      axios.get(`${HN_API_BASE}/item/${id}.json`)
    );

    const stories = await Promise.all(storyPromises);
    return stories.map(response => ({
      id: response.data.id,
      title: response.data.title,
      url: response.data.url || `https://news.ycombinator.com/item?id=${response.data.id}`,
      score: response.data.score,
      time: response.data.time,
      by: response.data.by,
      descendants: response.data.descendants,
      source: 'hackernews'
    }));
  } catch (error) {
    console.error('Error fetching Hacker News stories:', error.message);
    throw error;
  }
}

module.exports = { fetchTopStories };
```

**Step 2: Run test to verify it passes**

Run: `cd tools/news-aggregator && npm test`
Expected: PASS

**Step 3: Commit**

```bash
git add tools/news-aggregator/src/backend/fetchers/hackernews.js
git commit -m "feat: implement HackerNews fetcher"
```

### Task 8: Write test for trending calculator

**Files:**
- Create: `tools/news-aggregator/test/calculator.test.js`

**Step 1: Write failing test**

```javascript
const calculator = require('../src/backend/aggregators/trending-calculator');

test('should calculate trending score', () => {
  const article = {
    upvotes: 100,
    comments: 50,
    shares: 25,
    time: Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
  };

  const score = calculator.calculateScore(article);
  expect(typeof score).toBe('number');
  expect(score).toBeGreaterThan(0);
});

test('should give higher score to more recent articles', () => {
  const recent = {
    upvotes: 10,
    comments: 5,
    shares: 2,
    time: Math.floor(Date.now() / 1000) - 600 // 10 minutes ago
  };

  const old = {
    upvotes: 10,
    comments: 5,
    shares: 2,
    time: Math.floor(Date.now() / 1000) - 86400 // 1 day ago
  };

  const recentScore = calculator.calculateScore(recent);
  const oldScore = calculator.calculateScore(old);
  expect(recentScore).toBeGreaterThan(oldScore);
});
```

**Step 2: Run test to verify it fails**

Run: `cd tools/news-aggregator && npm test`
Expected: FAIL - module not found

**Step 3: Commit**

```bash
git add tools/news-aggregator/test/calculator.test.js
git commit -m "test: add failing tests for trending calculator"
```

### Task 9: Implement trending calculator

**Files:**
- Create: `tools/news-aggregator/src/backend/aggregators/trending-calculator.js`

**Step 1: Implement calculator**

```javascript
function calculateScore(article) {
  const now = Math.floor(Date.now() / 1000);
  const articleAge = now - article.time;

  // Base score from engagement
  const engagementScore =
    (article.upvotes || 0) * 1.0 +
    (article.comments || 0) * 2.0 +
    (article.shares || 0) * 3.0;

  // Recency bonus (higher for newer articles)
  const maxAge = 86400; // 24 hours
  const recencyBonus = Math.max(0, 1 - (articleAge / maxAge)) * 100;

  return engagementScore + recencyBonus;
}

function rankArticles(articles) {
  return articles
    .map(article => ({
      ...article,
      trendingScore: calculateScore(article)
    }))
    .sort((a, b) => b.trendingScore - a.trendingScore);
}

module.exports = { calculateScore, rankArticles };
```

**Step 2: Run tests**

Run: `cd tools/news-aggregator && npm test`
Expected: All tests PASS

**Step 3: Commit**

```bash
git add tools/news-aggregator/src/backend/aggregators/trending-calculator.js
git commit -m "feat: implement trending calculator algorithm"
```

---

## Phase 4: API Server

### Task 10: Write test for API routes

**Files:**
- Create: `tools/news-aggregator/test/api.test.js`

**Step 1: Write failing test**

```javascript
const request = require('supertest');
const express = require('express');
const app = express();

// Import routes after they're implemented
const routes = require('../src/backend/api/routes');
app.use('/api', routes);

test('GET /api/articles returns articles', async () => {
  const response = await request(app)
    .get('/api/articles?limit=10')
    .expect('Content-Type', /json/)
    .expect(200);

  expect(Array.isArray(response.body)).toBe(true);
});

test('GET /api/trending returns ranked articles', async () => {
  const response = await request(app)
    .get('/api/trending?limit=5')
    .expect('Content-Type', /json/)
    .expect(200);

  expect(Array.isArray(response.body)).toBe(true);
  if (response.body.length > 1) {
    expect(response.body[0].trendingScore)
      .toBeGreaterThanOrEqual(response.body[1].trendingScore);
  }
});
```

**Step 2: Install test dependencies**

```bash
cd tools/news-aggregator
npm install --save-dev supertest
cd ../..
```

**Step 3: Run test to verify it fails**

Run: `cd tools/news-aggregator && npm test`
Expected: FAIL - routes module not found

**Step 4: Commit**

```bash
git add tools/news-aggregator/test/api.test.js tools/news-aggregator/package.json
git commit -m "test: add failing tests for API routes"
```

### Task 11: Implement Express server and routes

**Files:**
- Create: `tools/news-aggregator/src/backend/api/routes.js`
- Create: `tools/news-aggregator/src/backend/server.js`

**Step 1: Create routes**

```javascript
const express = require('express');
const router = express.Router();
const hackernewsFetcher = require('../fetchers/hackernews');
const trendingCalculator = require('../aggregators/trending-calculator');

// Simple in-memory cache
let cachedArticles = null;
let cacheTime = 0;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

router.get('/articles', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const now = Date.now();

    // Return cached articles if still valid
    if (cachedArticles && now - cacheTime < CACHE_DURATION) {
      return res.json(cachedArticles.slice(0, limit));
    }

    // Fetch fresh articles
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

    const articlesResponse = await fetch(`http://localhost:3000/api/articles?limit=50`);
    const articles = await articlesResponse.json();

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
```

**Step 2: Create server**

```javascript
const express = require('express');
const cors = require('cors');
const routes = require('./api/routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 News Aggregator API running on port ${PORT}`);
  });
}

module.exports = app;
```

**Step 3: Run tests**

Run: `cd tools/news-aggregator && npm test`
Expected: All tests PASS

**Step 4: Commit**

```bash
git add tools/news-aggregator/src/backend/api/ tools/news-aggregator/src/backend/server.js
git commit -m "feat: implement Express API server with articles and trending endpoints"
```

### Task 12: Update launcher to start server

**Files:**
- Modify: `run.sh`

**Step 1: Update launcher script**

```bash
#!/bin/bash

# Main launcher for all tools and skills
REPO_DIR="$(cd "$(dirname "$0")" && pwd)"

show_help() {
    echo "My Agent Configuration Launcher"
    echo "================================"
    echo ""
    echo "Available tools:"
    echo "  news-aggregator  - Fetch and display trending news"
    echo ""
    echo "Skills management:"
    echo "  skills add <name>   - Add skill to list"
    echo "  skills remove <name> - Remove skill from list"
    echo "  skills list         - List all skills"
    echo "  skills sync         - Sync skills between laptops"
    echo ""
    echo "Usage: ./run.sh <tool-name> [command]"
    echo "   or: ./run.sh skills <command> [args]"
}

case "${1:-help}" in
    "help"|"-h"|"--help")
        show_help
        ;;
    "news-aggregator")
        echo "🚀 Starting news aggregator server..."
        cd "$REPO_DIR/tools/news-aggregator"
        if [ ! -d "node_modules" ]; then
            echo "📦 Installing dependencies..."
            npm install
        fi
        npm start
        ;;
    "skills")
        cd "$REPO_DIR/skills"
        ./track-skill.sh "${@:2}"
        ;;
    *)
        echo "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
```

**Step 2: Test launcher**

Run: `./run.sh news-aggregator`
Expected: Server starts on port 3000

**Step 3: Commit**

```bash
git add run.sh
git commit -m "feat: update launcher to start news aggregator server"
```

---

## Phase 5: Simple Frontend

### Task 13: Create simple HTML frontend

**Files:**
- Create: `tools/news-aggregator/src/frontend/index.html`

**Step 1: Create simple frontend**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>News Aggregator</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .container { max-width: 800px; margin: 40px auto; padding: 0 20px; }
        h1 { margin-bottom: 30px; }
        .article { padding: 20px; margin-bottom: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .article h3 { margin-bottom: 10px; }
        .article a { color: #0066cc; text-decoration: none; }
        .article a:hover { text-decoration: underline; }
        .meta { font-size: 14px; color: #666; margin-top: 10px; }
        .score { font-weight: bold; color: #006600; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📰 Trending News</h1>
        <div id="articles"></div>
    </div>

    <script>
        async function fetchArticles() {
            try {
                const response = await fetch('/api/trending?limit=10');
                const articles = await response.json();

                const container = document.getElementById('articles');
                container.innerHTML = articles.map(article => `
                    <div class="article">
                        <h3><a href="${article.url}" target="_blank">${article.title}</a></h3>
                        <div class="meta">
                            <span class="score">Score: ${Math.round(article.trendingScore)}</span> |
                            Source: ${article.source} |
                            Upvotes: ${article.score || article.upvotes} |
                            Comments: ${article.descendants || article.comments}
                        </div>
                    </div>
                `).join('');
            } catch (error) {
                console.error('Error fetching articles:', error);
                document.getElementById('articles').innerHTML = '<p>Error loading articles</p>';
            }
        }

        fetchArticles();
        setInterval(fetchArticles, 60000); // Refresh every minute
    </script>
</body>
</html>
```

**Step 2: Update server to serve frontend

```javascript
const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./api/routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static frontend
app.use(express.static(path.join(__dirname, '../../frontend')));

// API routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 News Aggregator running on http://localhost:${PORT}`);
  });
}

module.exports = app;
```

**Step 3: Test frontend**

Run: `./run.sh news-aggregator` then visit `http://localhost:3000`
Expected: See trending articles displayed

**Step 4: Commit**

```bash
git add tools/news-aggregator/src/frontend/
git add tools/news-aggregator/src/backend/server.js
git commit -m "feat: add simple HTML frontend for news aggregator"
```

---

## Phase 6: Documentation

### Task 14: Create news aggregator README

**Files:**
- Create: `tools/news-aggregator/README.md`

**Step 1: Create README**

```markdown
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
# From the monorepo root
./run.sh news-aggregator

# Or navigate to the tool directly
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

Add more news sources by implementing new fetchers in `src/backend/fetchers/` and updating the API routes.

## Future Enhancements

- Add Reddit source
- Add RSS feed parsing for tech blogs
- Add user authentication and saved articles
- Add filtering by category or source
- Add dark mode
- Add mobile-responsive design
```

**Step 2: Commit**

```bash
git add tools/news-aggregator/README.md
git commit -m "docs: add README for news aggregator"
```

### Task 15: Update root README with tools documentation

**Files:**
- Modify: `README.md`

**Step 1: Update root README**

```markdown
# My Agent Configuration

A monorepo for managing skills and building useful tools.

## Structure

- `skills/` - Skills tracking system (manage your OpenCode skills across laptops)
- `tools/` - Useful tools and applications
- `run.sh` - Unified launcher for all tools and skills
- `docs/plans/` - Design documents and implementation plans

## Quick Start

```bash
# Install dependencies
brew install jq

# Run the launcher
./run.sh
```

## Tools

### News Aggregator
Fetch and display trending news and blogs from multiple sources.

```bash
./run.sh news-aggregator
```

See [tools/news-aggregator/README.md](tools/news-aggregator/README.md) for details.

### Skills Tracking
Track and sync your OpenCode skills across multiple laptops.

```bash
./run.sh skills add <skill-name>
./run.sh skills sync
```

See [skills/SETUP.md](skills/SETUP.md) for details.

## Development

See [docs/plans/](docs/plans/) for design documents and implementation plans.

## License

MIT
```

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: update root README with complete tools documentation"
```

---

## Summary

This implementation plan creates a fully functional news aggregator platform:

✅ **Complete**: From monorepo setup to working frontend
✅ **Tested**: Each component has tests
✅ **Documented**: README files at every level
✅ **Maintainable**: Clean structure, frequent commits

**Total tasks:** 15
**Estimated time:** 2-3 hours for implementation
**Key features delivered:**
- Unified launcher system
- Hacker News integration
- Trending calculation algorithm
- REST API with caching
- Simple web interface
- Full documentation