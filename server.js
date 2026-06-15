const app = require('./app');
const { waitForDb } = require('./db');

const PORT = parseInt(process.env.PORT || '3000');

(async () => {
  await waitForDb();
  app.listen(PORT, () => {
    console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
  });
})();
