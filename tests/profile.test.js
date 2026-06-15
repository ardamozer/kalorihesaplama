const request = require('supertest');
const app = require('../app');

jest.mock('../db', () => ({
  query: jest.fn(),
}));

const db = require('../db');

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/profile', () => {
  it('profil varsa döndürür', async () => {
    const fakeProfile = { id: 1, height: 175, weight: 70, age: 25, gender: 'male', activity: 'moderate', goal: 'maintain', fiber_goal: 25 };
    db.query.mockResolvedValueOnce({ rows: [fakeProfile] });

    const res = await request(app).get('/api/profile');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeProfile);
  });

  it('profil yoksa null döndürür', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/api/profile');

    expect(res.status).toBe(200);
    expect(res.body).toBeNull();
  });

  it('DB hatası 500 döndürür', async () => {
    db.query.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).get('/api/profile');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Profil alınamadı.' });
  });
});

describe('PUT /api/profile', () => {
  const validBody = { height: 175, weight: 70, age: 25, gender: 'male', activity: 'moderate', goal: 'maintain' };

  it('geçerli veriyle profili kaydeder', async () => {
    const saved = { id: 1, ...validBody, fiber_goal: 25 };
    db.query.mockResolvedValueOnce({ rows: [saved] });

    const res = await request(app).put('/api/profile').send(validBody);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(saved);
  });

  it('fiber_goal varsayılan 25 kullanır', async () => {
    const saved = { id: 1, ...validBody, fiber_goal: 25 };
    db.query.mockResolvedValueOnce({ rows: [saved] });

    await request(app).put('/api/profile').send(validBody);

    expect(db.query).toHaveBeenCalledWith(
      expect.any(String),
      [175, 70, 25, 'male', 'moderate', 'maintain', 25]
    );
  });

  it('özel fiber_goal değeri kullanır', async () => {
    const saved = { id: 1, ...validBody, fiber_goal: 30 };
    db.query.mockResolvedValueOnce({ rows: [saved] });

    await request(app).put('/api/profile').send({ ...validBody, fiber_goal: 30 });

    expect(db.query).toHaveBeenCalledWith(
      expect.any(String),
      [175, 70, 25, 'male', 'moderate', 'maintain', 30]
    );
  });

  it('eksik alan 400 döndürür', async () => {
    const res = await request(app).put('/api/profile').send({ height: 175 });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Eksik alan.' });
    expect(db.query).not.toHaveBeenCalled();
  });

  it('DB hatası 500 döndürür', async () => {
    db.query.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).put('/api/profile').send(validBody);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Profil kaydedilemedi.' });
  });
});
