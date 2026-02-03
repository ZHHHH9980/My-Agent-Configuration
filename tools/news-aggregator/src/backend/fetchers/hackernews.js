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
      source: 'hackernews',
      scraped: true // Hacker News API works
    }));
  } catch (error) {
    console.error('Error fetching Hacker News stories:', error.message);
    throw error;
  }
}

module.exports = { fetchTopStories };