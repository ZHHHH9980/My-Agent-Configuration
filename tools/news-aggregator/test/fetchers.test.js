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