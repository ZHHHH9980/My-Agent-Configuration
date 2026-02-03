const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./api/routes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.use(express.static(path.join(__dirname, '../../src/frontend')));
app.use('/bookmarklets', express.static(path.join(__dirname, '../../bookmarklets')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../src/frontend/index.html'));
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`News Aggregator running on http://localhost:${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
  });
}

module.exports = app;