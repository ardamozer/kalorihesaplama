require('dotenv').config();
const express = require('express');
const path = require('path');
const { waitForDb } = require('./db');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/profile', require('./routes/profile'));
app.use('/api/logs',    require('./routes/logs'));

// Catch-all: SPA için index.html dön
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = parseInt(process.env.PORT || '3000');

(async () => {
  await waitForDb();
  app.listen(PORT, () => {
    console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
  });
})();
