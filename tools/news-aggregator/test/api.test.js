const request = require('supertest');
const express = require('express');
const app = express();

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