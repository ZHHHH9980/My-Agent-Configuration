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