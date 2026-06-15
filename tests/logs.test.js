const request = require('supertest');
const app = require('../app');

jest.mock('../db', () => ({
  query: jest.fn(),
}));

const db = require('../db');

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/logs', () => {
  it('belirtilen tarihteki kayıtları döndürür', async () => {
    const logs = [{ id: 1, name: 'Elma', kcal: 52, log_date: '2026-06-15' }];
    db.query.mockResolvedValueOnce({ rows: logs });

    const res = await request(app).get('/api/logs?date=2026-06-15');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(logs);
    expect(db.query).toHaveBeenCalledWith(
      expect.any(String),
      ['2026-06-15']
    );
  });

  it('date parametresi yoksa bugünü kullanır', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    await request(app).get('/api/logs');

    const calledDate = db.query.mock.calls[0][1][0];
    expect(calledDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('DB hatası 500 döndürür', async () => {
    db.query.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).get('/api/logs?date=2026-06-15');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Kayıtlar alınamadı.' });
  });
});

describe('GET /api/logs/history', () => {
  it('son 30 günün özetini döndürür', async () => {
    const history = [
      { date: '2026-06-15', total_kcal: 1800, total_prot: 90, total_karb: 200, total_yag: 60, total_lif: 25, entry_count: 4 },
    ];
    db.query.mockResolvedValueOnce({ rows: history });

    const res = await request(app).get('/api/logs/history');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(history);
  });

  it('DB hatası 500 döndürür', async () => {
    db.query.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).get('/api/logs/history');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Tarihçe alınamadı.' });
  });
});

describe('POST /api/logs', () => {
  const validBody = { meal: 'kahvalti', name: 'Yumurta', amount: 100, kcal: 155, prot: 13, karb: 1, yag: 11, lif: 0 };

  it('geçerli veriyle kayıt ekler', async () => {
    const saved = { id: 1, log_date: '2026-06-15', ...validBody, unhealthy: false };
    db.query.mockResolvedValueOnce({ rows: [saved] });

    const res = await request(app).post('/api/logs').send(validBody);

    expect(res.status).toBe(201);
    expect(res.body).toEqual(saved);
  });

  it('eksik alan (meal yok) 400 döndürür', async () => {
    const res = await request(app).post('/api/logs').send({ name: 'Yumurta', amount: 100 });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Eksik alan.' });
    expect(db.query).not.toHaveBeenCalled();
  });

  it('eksik alan (name yok) 400 döndürür', async () => {
    const res = await request(app).post('/api/logs').send({ meal: 'kahvalti', amount: 100 });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Eksik alan.' });
  });

  it('eksik alan (amount yok) 400 döndürür', async () => {
    const res = await request(app).post('/api/logs').send({ meal: 'kahvalti', name: 'Yumurta' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Eksik alan.' });
  });

  it('eksik makrolar 0 varsayılır', async () => {
    const saved = { id: 1, log_date: '2026-06-15', meal: 'kahvalti', name: 'Yumurta', amount: 100, kcal: 0, prot: 0, karb: 0, yag: 0, lif: 0, unhealthy: false };
    db.query.mockResolvedValueOnce({ rows: [saved] });

    await request(app).post('/api/logs').send({ meal: 'kahvalti', name: 'Yumurta', amount: 100 });

    const params = db.query.mock.calls[0][1];
    expect(params[4]).toBe(0); // kcal
    expect(params[5]).toBe(0); // prot
    expect(params[6]).toBe(0); // karb
    expect(params[7]).toBe(0); // yag
    expect(params[8]).toBe(0); // lif
    expect(params[9]).toBe(false); // unhealthy
  });

  it('DB hatası 500 döndürür', async () => {
    db.query.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).post('/api/logs').send(validBody);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Kayıt eklenemedi.' });
  });
});

describe('PUT /api/logs/:id', () => {
  it('miktarı güncelleyip ölçeklenmiş makroları döndürür', async () => {
    const updated = { id: 1, name: 'Yumurta', amount: 200, kcal: 310 };
    db.query.mockResolvedValueOnce({ rows: [updated] });

    const res = await request(app).put('/api/logs/1').send({ amount: 200 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(updated);
    expect(db.query).toHaveBeenCalledWith(expect.any(String), [200, 1]);
  });

  it('kayıt bulunamazsa 404 döndürür', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).put('/api/logs/999').send({ amount: 100 });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Kayıt bulunamadı.' });
  });

  it('geçersiz amount 400 döndürür', async () => {
    const res = await request(app).put('/api/logs/1').send({ amount: -50 });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Geçersiz değer.' });
    expect(db.query).not.toHaveBeenCalled();
  });

  it('amount sıfır ise 400 döndürür', async () => {
    const res = await request(app).put('/api/logs/1').send({ amount: 0 });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Geçersiz değer.' });
  });

  it('DB hatası 500 döndürür', async () => {
    db.query.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).put('/api/logs/1').send({ amount: 100 });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Kayıt güncellenemedi.' });
  });
});

describe('DELETE /api/logs/:id', () => {
  it('kaydı siler ve 204 döndürür', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).delete('/api/logs/1');

    expect(res.status).toBe(204);
    expect(db.query).toHaveBeenCalledWith(
      'DELETE FROM food_logs WHERE id = $1',
      [1]
    );
  });

  it('DB hatası 500 döndürür', async () => {
    db.query.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).delete('/api/logs/1');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Kayıt silinemedi.' });
  });
});
