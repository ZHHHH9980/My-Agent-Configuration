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