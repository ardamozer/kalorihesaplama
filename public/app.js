'use strict';

// SVG ring ile CSS stroke-dasharray (220) eşleşmesi için sabit
const SVG_CIRCUMFERENCE = 220;

// XSS önleme: kullanıcı verisi innerHTML'e girmeden önce kaçırılır
function escHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Türkçe karakter normalizasyonu: "sut" → "Süt" aramasını da bulur
function normTr(s) {
  return String(s).toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c');
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

// ── API KATMANI (localStorage yerine) ──────────────────────────────────────

const api = {
  async getProfile() {
    try {
      const r = await fetch('/api/profile');
      if (!r.ok) return null;
      return await r.json();
    } catch { return null; }
  },

  async saveProfile(profile) {
    const r = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },

  async getLogs(date = todayKey()) {
    try {
      const r = await fetch(`/api/logs?date=${date}`);
      if (!r.ok) return [];
      return await r.json();
    } catch { return []; }
  },

  async getHistory() {
    try {
      const r = await fetch('/api/logs/history');
      if (!r.ok) return [];
      return await r.json();
    } catch { return []; }
  },

  async addLog(entry) {
    const r = await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },

  async updateLog(id, newAmount) {
    const r = await fetch(`/api/logs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: newAmount })
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },

  async deleteLog(id) {
    const r = await fetch(`/api/logs/${id}`, { method: 'DELETE' });
    if (!r.ok) throw new Error(await r.text());
  }
};

// ── BESIN VERİTABANI ───────────────────────────────────────────────────────

class FoodDatabase {
  #foods;

  constructor() {
    this.#foods = [
      // ── YUMURTA ──
      { name: 'Yumurta (tam, haşlanmış)', kcal: 155, prot: 13, karb: 1.1, yag: 11, lif: 0 },
      { name: 'Yumurta (sahanda, az yağlı)', kcal: 185, prot: 13.5, karb: 0.4, yag: 14, lif: 0 },
      { name: 'Yumurta beyazı (haşlanmış)', kcal: 52, prot: 10.9, karb: 0.7, yag: 0.2, lif: 0 },
      { name: 'Yumurta sarısı', kcal: 322, prot: 15.9, karb: 3.6, yag: 26.5, lif: 0 },
      { name: 'Menemen (zeytinyağlı)', kcal: 98, prot: 5.8, karb: 4.2, yag: 6.8, lif: 1.2 },
      { name: 'Omlet (sade, az yağlı)', kcal: 154, prot: 10.6, karb: 0.4, yag: 12, lif: 0 },

      // ── TAVUK ──
      { name: 'Tavuk göğsü (haşlanmış)', kcal: 165, prot: 31, karb: 0, yag: 3.6, lif: 0 },
      { name: 'Tavuk göğsü (ızgara)', kcal: 158, prot: 32, karb: 0, yag: 2.7, lif: 0 },
      { name: 'Tavuk göğsü (fırında)', kcal: 172, prot: 30.5, karb: 0, yag: 4.5, lif: 0 },
      { name: 'Tavuk but (derisiz, pişmiş)', kcal: 179, prot: 28, karb: 0, yag: 7, lif: 0 },
      { name: 'Tavuk but (derili, pişmiş)', kcal: 209, prot: 26, karb: 0, yag: 11, lif: 0 },
      { name: 'Tavuk kanat (pişmiş)', kcal: 223, prot: 23, karb: 0, yag: 14, lif: 0 },
      { name: 'Tavuk kıyma (yağsız)', kcal: 143, prot: 17.4, karb: 0, yag: 8.1, lif: 0 },

      // ── HİNDİ ──
      { name: 'Hindi göğsü (haşlanmış)', kcal: 135, prot: 28.7, karb: 0, yag: 1.7, lif: 0 },
      { name: 'Hindi göğsü (ızgara)', kcal: 147, prot: 29.9, karb: 0, yag: 2.3, lif: 0 },
      { name: 'Hindi but (pişmiş)', kcal: 189, prot: 28.6, karb: 0, yag: 7.4, lif: 0 },
      { name: 'Hindi füme (dilimlenmiş)', kcal: 104, prot: 18.5, karb: 1.8, yag: 2.4, lif: 0 },
      { name: 'Hindi rosto (dilimlenmiş)', kcal: 112, prot: 22, karb: 0, yag: 2.1, lif: 0 },
      { name: 'Hindi kıyma (yağsız)', kcal: 149, prot: 21, karb: 0, yag: 7, lif: 0 },

      // ── KIRMIZI ET ──
      { name: 'Dana filetosu (ızgara)', kcal: 187, prot: 28.7, karb: 0, yag: 7.7, lif: 0 },
      { name: 'Dana antrikot (pişmiş)', kcal: 268, prot: 26.4, karb: 0, yag: 17.5, lif: 0 },
      { name: 'Dana kıyma (yağsız, pişmiş)', kcal: 215, prot: 26, karb: 0, yag: 12, lif: 0 },
      { name: 'Dana kıyma (yağlı, pişmiş)', kcal: 332, prot: 14, karb: 0, yag: 30, lif: 0, unhealthy: true },
      { name: 'Kuzu eti (pişmiş)', kcal: 258, prot: 26, karb: 0, yag: 16, lif: 0 },
      { name: 'Kuzu pirzola (pişmiş)', kcal: 283, prot: 25, karb: 0, yag: 19.5, lif: 0 },
      { name: 'Köfte (dana, pişmiş)', kcal: 235, prot: 20, karb: 4.5, yag: 14.5, lif: 0.3 },

      // ── İŞLENMİŞ ET ──
      { name: 'Sucuk', kcal: 455, prot: 20, karb: 2, yag: 40, lif: 0, unhealthy: true },
      { name: 'Pastırma', kcal: 199, prot: 31, karb: 0.5, yag: 7.2, lif: 0 },
      { name: 'Salam (dana)', kcal: 249, prot: 13.5, karb: 2.8, yag: 20.5, lif: 0, unhealthy: true },
      { name: 'Sosis (dana)', kcal: 290, prot: 11.4, karb: 3.1, yag: 26, lif: 0, unhealthy: true },
      { name: 'Hindi salam', kcal: 134, prot: 17, karb: 2.1, yag: 6, lif: 0 },
      { name: 'Jambon (hindi)', kcal: 107, prot: 14.5, karb: 3.5, yag: 4, lif: 0 },
      { name: 'Jambon (dana)', kcal: 145, prot: 17, karb: 3.8, yag: 7, lif: 0, unhealthy: true },

      // ── BALIK & DENİZ ÜRÜNÜ ──
      { name: 'Somon (fırında)', kcal: 208, prot: 20.4, karb: 0, yag: 13.4, lif: 0 },
      { name: 'Ton balığı (konserve, suyunda)', kcal: 116, prot: 25.5, karb: 0, yag: 0.8, lif: 0 },
      { name: 'Ton balığı (konserve, yağda)', kcal: 198, prot: 22, karb: 0, yag: 12, lif: 0 },
      { name: 'Uskumru (pişmiş)', kcal: 205, prot: 18.6, karb: 0, yag: 13.9, lif: 0 },
      { name: 'Levrek (fırında)', kcal: 124, prot: 23.6, karb: 0, yag: 2.5, lif: 0 },
      { name: 'Çipura (fırında)', kcal: 128, prot: 26.6, karb: 2.1, yag: 0, lif: 0 },
      { name: 'Hamsi (pişmiş)', kcal: 131, prot: 20.4, karb: 0, yag: 5, lif: 0 },
      { name: 'Karides (haşlanmış)', kcal: 99, prot: 20.9, karb: 0.9, yag: 1.1, lif: 0 },
      { name: 'Midye (buharda)', kcal: 86, prot: 11.9, karb: 3.7, yag: 2.2, lif: 0 },
      { name: 'Ahtapot (haşlanmış)', kcal: 82, prot: 14.9, karb: 2.2, yag: 1.0, lif: 0 },
      { name: 'Sardalya (konserve, yağda)', kcal: 208, prot: 24.6, karb: 0, yag: 11.4, lif: 0 },
      { name: 'Ringa balığı (pişmiş)', kcal: 217, prot: 24.6, karb: 0, yag: 12.4, lif: 0 },

      // ── SÜT ÜRÜNLERİ ──
      { name: 'Süt (tam yağlı, %3.5)', kcal: 61, prot: 3.2, karb: 4.8, yag: 3.3, lif: 0 },
      { name: 'Süt (yarım yağlı, %1.5)', kcal: 42, prot: 3.4, karb: 4.9, yag: 1.5, lif: 0 },
      { name: 'Süt (yağsız, %0)', kcal: 34, prot: 3.4, karb: 4.9, yag: 0.1, lif: 0 },
      { name: 'Yoğurt (sade, tam yağlı)', kcal: 59, prot: 3.5, karb: 3.6, yag: 3.3, lif: 0 },
      { name: 'Yoğurt (yağsız, %0)', kcal: 35, prot: 5.7, karb: 3.7, yag: 0.4, lif: 0 },
      { name: 'Süzme yoğurt (tam yağlı)', kcal: 97, prot: 9.0, karb: 3.8, yag: 5.0, lif: 0 },
      { name: 'Süzme yoğurt (yağsız)', kcal: 59, prot: 11.0, karb: 3.6, yag: 0.3, lif: 0 },
      { name: 'Kefir (tam yağlı)', kcal: 61, prot: 3.4, karb: 4.5, yag: 3.5, lif: 0 },
      { name: 'Ayran (1 bardak ~250ml)', kcal: 29, prot: 1.8, karb: 2.1, yag: 1.4, lif: 0 },
      { name: 'Lor peyniri', kcal: 98, prot: 11.1, karb: 3.4, yag: 4.0, lif: 0 },
      { name: 'Beyaz peynir (az yağlı, %6)', kcal: 130, prot: 19, karb: 1.5, yag: 5, lif: 0 },
      { name: 'Beyaz peynir (normal, %9)', kcal: 264, prot: 14, karb: 2.4, yag: 21, lif: 0 },
      { name: 'Kaşar peyniri', kcal: 387, prot: 25.2, karb: 1.3, yag: 31.0, lif: 0 },
      { name: 'Tulum peyniri', kcal: 354, prot: 22, karb: 0.5, yag: 29, lif: 0 },
      { name: 'Cheddar peyniri', kcal: 403, prot: 24.9, karb: 1.3, yag: 33.1, lif: 0 },
      { name: 'Mozzarella (tam yağlı)', kcal: 280, prot: 19.9, karb: 2.2, yag: 21.6, lif: 0 },
      { name: 'Parmesan peyniri', kcal: 431, prot: 38.5, karb: 4.1, yag: 28.6, lif: 0 },
      { name: 'Tereyağı (tuzsuz)', kcal: 717, prot: 0.9, karb: 0.1, yag: 81.1, lif: 0, unhealthy: true },
      { name: 'Margarin', kcal: 718, prot: 0.2, karb: 0.7, yag: 80.4, lif: 0, unhealthy: true },

      // ── EKMEK & HAMUR İŞLERİ ──
      { name: 'Ekmek (tam buğday)', kcal: 247, prot: 13.0, karb: 41.0, yag: 4.2, lif: 7.0 },
      { name: 'Ekmek (çok tahıllı)', kcal: 252, prot: 10.8, karb: 43.0, yag: 4.4, lif: 6.5 },
      { name: 'Ekmek (beyaz)', kcal: 265, prot: 9.0, karb: 49.0, yag: 3.2, lif: 2.7, unhealthy: true },
      { name: 'Ekmek (çavdar)', kcal: 259, prot: 8.5, karb: 48.0, yag: 3.3, lif: 6.0 },
      { name: 'Lavaş (tam buğday unlü)', kcal: 218, prot: 8.5, karb: 40.5, yag: 2.8, lif: 5.2 },
      { name: 'Lavaş (beyaz unlü)', kcal: 255, prot: 7.8, karb: 48.0, yag: 3.5, lif: 1.6, unhealthy: true },
      { name: 'Tortilla (tam buğday)', kcal: 234, prot: 8.0, karb: 36.0, yag: 6.5, lif: 4.5 },
      { name: 'Tortilla (beyaz un)', kcal: 298, prot: 7.8, karb: 48.0, yag: 7.6, lif: 2.1, unhealthy: true },
      { name: 'Simit (susamlı)', kcal: 297, prot: 10.0, karb: 57.0, yag: 3.0, lif: 2.0, unhealthy: true },
      { name: 'Bazlama', kcal: 264, prot: 8.1, karb: 52.0, yag: 3.0, lif: 1.8, unhealthy: true },
      { name: 'Yufka (ince)', kcal: 326, prot: 8.5, karb: 62.0, yag: 5.0, lif: 2.0 },
      { name: 'Pide (sade)', kcal: 239, prot: 8.2, karb: 46.5, yag: 2.1, lif: 1.8 },
      { name: 'Pide (kaşar peynirli)', kcal: 290, prot: 13.0, karb: 38.0, yag: 9.0, lif: 1.0, unhealthy: true },
      { name: 'Kruvasan', kcal: 406, prot: 8.2, karb: 45.8, yag: 21.0, lif: 1.9, unhealthy: true },
      { name: 'Galeta (tam buğday)', kcal: 348, prot: 12.0, karb: 62.0, yag: 5.0, lif: 8.0 },
      { name: 'Kraker (tam tahıllı)', kcal: 380, prot: 10, karb: 67, yag: 8, lif: 6 },

      // ── TAHIL & MAKARNA ──
      { name: 'Pirinç (beyaz, pişmiş)', kcal: 130, prot: 2.7, karb: 28.2, yag: 0.3, lif: 0.4 },
      { name: 'Pirinç (esmer, pişmiş)', kcal: 112, prot: 2.6, karb: 23.5, yag: 0.9, lif: 1.8 },
      { name: 'Bulgur (pişmiş)', kcal: 83, prot: 3.1, karb: 18.6, yag: 0.2, lif: 4.5 },
      { name: 'Kinoa (pişmiş)', kcal: 120, prot: 4.4, karb: 21.3, yag: 1.9, lif: 2.8 },
      { name: 'Yulaf ezmesi (kuru)', kcal: 389, prot: 16.9, karb: 66.3, yag: 6.9, lif: 10.6 },
      { name: 'Yulaf ezmesi (pişmiş, suda)', kcal: 68, prot: 2.4, karb: 12.0, yag: 1.4, lif: 1.7 },
      { name: 'Makarna (beyaz, pişmiş)', kcal: 131, prot: 5.0, karb: 25.1, yag: 1.1, lif: 1.8 },
      { name: 'Makarna (tam buğday, pişmiş)', kcal: 124, prot: 5.3, karb: 26.5, yag: 0.5, lif: 3.9 },
      { name: 'Mısır lapası (polenta, pişmiş)', kcal: 70, prot: 1.6, karb: 14.7, yag: 0.7, lif: 0.7 },
      { name: 'Pilav (pirinç, sade)', kcal: 143, prot: 2.6, karb: 28.0, yag: 2.5, lif: 0.4 },
      { name: 'Pilav (bulgur, sade)', kcal: 118, prot: 3.8, karb: 21.5, yag: 2.4, lif: 4.0 },

      // ── BAKLAGİLLER ──
      { name: 'Mercimek (kırmızı, pişmiş)', kcal: 116, prot: 9.0, karb: 20.1, yag: 0.4, lif: 7.9 },
      { name: 'Mercimek (yeşil, pişmiş)', kcal: 116, prot: 9.0, karb: 20.1, yag: 0.4, lif: 7.9 },
      { name: 'Nohut (pişmiş)', kcal: 164, prot: 8.9, karb: 27.4, yag: 2.6, lif: 7.6 },
      { name: 'Kuru fasulye (pişmiş)', kcal: 127, prot: 8.7, karb: 22.8, yag: 0.5, lif: 6.4 },
      { name: 'Bezelye (taze, haşlanmış)', kcal: 84, prot: 5.4, karb: 15.6, yag: 0.2, lif: 5.5 },
      { name: 'Edamame (haşlanmış)', kcal: 122, prot: 11.9, karb: 8.9, yag: 5.2, lif: 5.2 },
      { name: 'Soya fasulyesi (pişmiş)', kcal: 173, prot: 16.6, karb: 9.9, yag: 9.0, lif: 6.0 },
      { name: 'Tofu (sert)', kcal: 76, prot: 8.1, karb: 1.9, yag: 4.2, lif: 0.3 },
      { name: 'Barbunya (pişmiş)', kcal: 127, prot: 8.7, karb: 22.8, yag: 0.5, lif: 6.4 },

      // ── SEBZELER ──
      { name: 'Patates (haşlanmış)', kcal: 87, prot: 1.9, karb: 20.1, yag: 0.1, lif: 1.8 },
      { name: 'Patates kızartması (derin yağ)', kcal: 312, prot: 3.4, karb: 41.4, yag: 15.0, lif: 3.8, unhealthy: true },
      { name: 'Tatlı patates (haşlanmış)', kcal: 86, prot: 1.6, karb: 20.1, yag: 0.1, lif: 3.0 },
      { name: 'Domates (taze)', kcal: 18, prot: 0.9, karb: 3.9, yag: 0.2, lif: 1.2 },
      { name: 'Salatalık (taze)', kcal: 15, prot: 0.7, karb: 3.6, yag: 0.1, lif: 0.5 },
      { name: 'Ispanak (taze)', kcal: 23, prot: 2.9, karb: 3.6, yag: 0.4, lif: 2.2 },
      { name: 'Ispanak (pişmiş)', kcal: 41, prot: 5.3, karb: 3.8, yag: 0.5, lif: 4.3 },
      { name: 'Brokoli (haşlanmış)', kcal: 34, prot: 2.8, karb: 6.6, yag: 0.4, lif: 2.6 },
      { name: 'Karnabahar (haşlanmış)', kcal: 25, prot: 1.9, karb: 4.1, yag: 0.3, lif: 2.3 },
      { name: 'Lahana (beyaz, çiğ)', kcal: 25, prot: 1.3, karb: 5.8, yag: 0.1, lif: 2.5 },
      { name: 'Patlıcan (pişmiş)', kcal: 35, prot: 0.8, karb: 8.7, yag: 0.2, lif: 2.5 },
      { name: 'Kabak (haşlanmış)', kcal: 17, prot: 1.2, karb: 3.1, yag: 0.3, lif: 1.0 },
      { name: 'Biber (yeşil, dolmalık)', kcal: 20, prot: 0.9, karb: 4.6, yag: 0.2, lif: 1.7 },
      { name: 'Biber (kırmızı, dolmalık)', kcal: 31, prot: 1.0, karb: 7.3, yag: 0.3, lif: 2.1 },
      { name: 'Mantar (beyaz, taze)', kcal: 22, prot: 3.1, karb: 3.3, yag: 0.3, lif: 1.0 },
      { name: 'Soğan (kuru)', kcal: 40, prot: 1.1, karb: 9.3, yag: 0.1, lif: 1.7 },
      { name: 'Pırasa (pişmiş)', kcal: 31, prot: 0.8, karb: 7.6, yag: 0.2, lif: 1.8 },
      { name: 'Havuç (taze)', kcal: 41, prot: 0.9, karb: 9.6, yag: 0.2, lif: 2.8 },
      { name: 'Kereviz (sap)', kcal: 16, prot: 0.7, karb: 3.0, yag: 0.2, lif: 1.6 },
      { name: 'Roka (taze)', kcal: 25, prot: 2.6, karb: 3.7, yag: 0.7, lif: 1.6 },
      { name: 'Marul (yeşil yaprak)', kcal: 15, prot: 1.4, karb: 2.9, yag: 0.2, lif: 1.3 },
      { name: 'Avokado (olgun)', kcal: 160, prot: 2.0, karb: 8.5, yag: 14.7, lif: 6.7 },
      { name: 'Bamya (haşlanmış)', kcal: 22, prot: 1.9, karb: 4.0, yag: 0.2, lif: 2.0 },
      { name: 'Kuşkonmaz (haşlanmış)', kcal: 20, prot: 2.2, karb: 3.7, yag: 0.1, lif: 2.1 },
      { name: 'Enginar (haşlanmış)', kcal: 53, prot: 2.9, karb: 10.5, yag: 0.2, lif: 5.4 },
      { name: 'Mısır (haşlanmış)', kcal: 96, prot: 3.4, karb: 21.0, yag: 1.5, lif: 2.4 },
      { name: 'Maydanoz (taze)', kcal: 36, prot: 3.0, karb: 6.3, yag: 0.8, lif: 3.3 },
      { name: 'Dereotu (taze)', kcal: 43, prot: 3.5, karb: 7.0, yag: 1.1, lif: 2.1 },
      { name: 'Nane (taze)', kcal: 70, prot: 3.8, karb: 14.9, yag: 0.9, lif: 8.0 },

      // ── MEYVELER ──
      { name: 'Elma (kırmızı)', kcal: 52, prot: 0.3, karb: 13.8, yag: 0.2, lif: 2.4 },
      { name: 'Elma (yeşil, ekşi)', kcal: 58, prot: 0.4, karb: 15.2, yag: 0.2, lif: 2.8 },
      { name: 'Muz (olgun)', kcal: 89, prot: 1.1, karb: 22.8, yag: 0.3, lif: 2.6 },
      { name: 'Portakal', kcal: 47, prot: 0.9, karb: 11.8, yag: 0.1, lif: 2.4 },
      { name: 'Mandalina', kcal: 53, prot: 0.8, karb: 13.3, yag: 0.3, lif: 1.8 },
      { name: 'Greyfurt', kcal: 42, prot: 0.8, karb: 10.7, yag: 0.1, lif: 1.6 },
      { name: 'Çilek (taze)', kcal: 32, prot: 0.7, karb: 7.7, yag: 0.3, lif: 2.0 },
      { name: 'Karpuz', kcal: 30, prot: 0.6, karb: 7.6, yag: 0.2, lif: 0.4 },
      { name: 'Kavun', kcal: 34, prot: 0.8, karb: 8.2, yag: 0.2, lif: 0.9 },
      { name: 'Kivi (yeşil)', kcal: 61, prot: 1.1, karb: 14.7, yag: 0.5, lif: 3.0 },
      { name: 'Üzüm (yeşil)', kcal: 67, prot: 0.6, karb: 17.2, yag: 0.4, lif: 0.9 },
      { name: 'Şeftali (taze)', kcal: 39, prot: 0.9, karb: 9.5, yag: 0.3, lif: 1.5 },
      { name: 'Armut', kcal: 57, prot: 0.4, karb: 15.2, yag: 0.1, lif: 3.1 },
      { name: 'Kayısı (taze)', kcal: 48, prot: 1.4, karb: 11.1, yag: 0.4, lif: 2.0 },
      { name: 'Kayısı (kuru)', kcal: 241, prot: 3.4, karb: 62.6, yag: 0.5, lif: 7.3 },
      { name: 'Kiraz', kcal: 50, prot: 1.0, karb: 12.2, yag: 0.3, lif: 1.6 },
      { name: 'Vişne', kcal: 63, prot: 1.0, karb: 16.0, yag: 0.3, lif: 2.1 },
      { name: 'Nar (taze)', kcal: 83, prot: 1.7, karb: 18.7, yag: 1.2, lif: 4.0 },
      { name: 'İncir (taze)', kcal: 74, prot: 0.8, karb: 19.2, yag: 0.3, lif: 2.9 },
      { name: 'İncir (kuru)', kcal: 249, prot: 3.3, karb: 63.9, yag: 0.9, lif: 9.8 },
      { name: 'Hurma (medjool)', kcal: 282, prot: 2.5, karb: 74.9, yag: 0.4, lif: 8.0 },
      { name: 'Ananas (taze)', kcal: 50, prot: 0.5, karb: 13.1, yag: 0.1, lif: 1.4 }, // düzeltildi: font→prot
      { name: 'Mango (taze)', kcal: 60, prot: 0.8, karb: 15.0, yag: 0.4, lif: 1.6 },
      { name: 'Kuru üzüm', kcal: 299, prot: 3.1, karb: 79.2, yag: 0.5, lif: 3.7 },
      { name: 'Kuru erik', kcal: 240, prot: 2.2, karb: 63.9, yag: 0.4, lif: 7.1 },

      // ── YAĞLAR & KURUYEMIŞLER ──
      { name: 'Zeytinyağı (sızma)', kcal: 884, prot: 0, karb: 0, yag: 100, lif: 0 },
      { name: 'Zeytin (siyah, turşu)', kcal: 145, prot: 1.0, karb: 3.8, yag: 13.1, lif: 3.2 },
      { name: 'Zeytin (yeşil, turşu)', kcal: 145, prot: 1.0, karb: 3.8, yag: 13.1, lif: 3.2 },
      { name: 'Badem (çiğ)', kcal: 579, prot: 21.2, karb: 21.6, yag: 49.9, lif: 12.5 },
      { name: 'Fındık (çiğ)', kcal: 628, prot: 14.9, karb: 16.7, yag: 60.8, lif: 9.7 },
      { name: 'Ceviz (çiğ)', kcal: 654, prot: 15.2, karb: 13.7, yag: 65.2, lif: 6.7 },
      { name: 'Antep fıstığı (kavrulmuş)', kcal: 562, prot: 20.2, karb: 27.5, yag: 45.4, lif: 10.3 },
      { name: 'Kaju fıstığı (çiğ)', kcal: 553, prot: 18.2, karb: 30.2, yag: 43.9, lif: 3.3 },
      { name: 'Yer fıstığı (kavrulmuş)', kcal: 585, prot: 23.7, karb: 21.5, yag: 49.7, lif: 8.5 },
      { name: 'Tahin (susam ezmesi)', kcal: 595, prot: 17.0, karb: 21.2, yag: 53.8, lif: 9.3 },
      { name: 'Fıstık ezmesi (doğal)', kcal: 588, prot: 25.1, karb: 19.6, yag: 50.4, lif: 6.0 },
      { name: 'Chia tohumu', kcal: 486, prot: 16.5, karb: 42.1, yag: 30.7, lif: 34.4 },
      { name: 'Keten tohumu (öğütülmüş)', kcal: 534, prot: 18.3, karb: 28.9, yag: 42.2, lif: 27.3 },
      { name: 'Kabak çekirdeği (çiğ)', kcal: 559, prot: 30.2, karb: 10.7, yag: 49.1, lif: 6.0 },
      { name: 'Ayçiçeği çekirdeği', kcal: 584, prot: 20.8, karb: 20.0, yag: 51.5, lif: 8.6 },
      { name: 'Susam (çiğ)', kcal: 573, prot: 17.7, karb: 23.5, yag: 49.7, lif: 11.8 },

      // ── FAST FOOD & İŞLENMİŞ ──
      { name: 'Hamburger (ekmekle, standart)', kcal: 295, prot: 14.5, karb: 25.7, yag: 14.5, lif: 1.4, unhealthy: true },
      { name: 'Pizza (margarita, 1 dilim)', kcal: 213, prot: 9.0, karb: 26.0, yag: 8.0, lif: 1.6, unhealthy: true },
      { name: 'Pizza (pepperoni, 1 dilim)', kcal: 285, prot: 12.0, karb: 36.0, yag: 10.0, lif: 2.3, unhealthy: true },
      { name: 'Döner (tavuk, dürüm)', kcal: 380, prot: 22, karb: 40, yag: 13, lif: 2, unhealthy: true },
      { name: 'Döner (et, dürüm)', kcal: 430, prot: 24, karb: 38, yag: 18, lif: 1.5, unhealthy: true },
      { name: 'Lahmacun (1 adet)', kcal: 210, prot: 9, karb: 28, yag: 7, lif: 1.5, unhealthy: true },
      { name: 'Cips (patates, klasik)', kcal: 536, prot: 6.6, karb: 52.5, yag: 34.6, lif: 4.8, unhealthy: true },
      { name: 'Popcorn (tereyağlı)', kcal: 387, prot: 6.3, karb: 74.1, yag: 9.0, lif: 14.5, unhealthy: true },
      { name: 'Hot dog (sosis + ekmek)', kcal: 290, prot: 10.6, karb: 21.3, yag: 17.1, lif: 0.9, unhealthy: true },

      // ── TATLILAR & ŞEKER ──
      { name: 'Çikolata (sütlü)', kcal: 535, prot: 7.7, karb: 59.4, yag: 29.7, lif: 3.4, unhealthy: true },
      { name: 'Çikolata (bitter, %70+)', kcal: 598, prot: 7.8, karb: 45.9, yag: 43.1, lif: 10.9 },
      { name: 'Dondurma (çikolatalı)', kcal: 216, prot: 3.8, karb: 28.2, yag: 11.0, lif: 0.7, unhealthy: true },
      { name: 'Kek (çikolatalı)', kcal: 371, prot: 5.2, karb: 57.4, yag: 14.0, lif: 2.5, unhealthy: true },
      { name: 'Kurabiye (sade)', kcal: 453, prot: 5.7, karb: 64.2, yag: 20.9, lif: 1.5, unhealthy: true },
      { name: 'Baklava (1 dilim ~50g)', kcal: 330, prot: 4.0, karb: 40.0, yag: 17.5, lif: 1.3, unhealthy: true },
      { name: 'Kadayıf (cevizli, 1 porsiyon)', kcal: 298, prot: 4.2, karb: 45.0, yag: 11.5, lif: 1.1, unhealthy: true },
      { name: 'Şeker (toz, beyaz)', kcal: 387, prot: 0, karb: 100, yag: 0, lif: 0, unhealthy: true },
      { name: 'Bal (doğal)', kcal: 304, prot: 0.3, karb: 82.4, yag: 0, lif: 0.2 },
      { name: 'Nutella (2 kaşık ~30g)', kcal: 200, prot: 2.4, karb: 22.8, yag: 11.6, lif: 1.0, unhealthy: true },
      { name: 'Reçel (çilek)', kcal: 278, prot: 0.5, karb: 69.0, yag: 0.1, lif: 1.1, unhealthy: true },
      { name: 'Petibör bisküvisi (3 adet)', kcal: 432, prot: 8.4, karb: 71.2, yag: 13.2, lif: 1.8, unhealthy: true },

      // ── İÇECEKLER ──
      { name: 'Kola (1 kutu 330ml)', kcal: 139, prot: 0, karb: 35.0, yag: 0, lif: 0, unhealthy: true },
      { name: 'Diyet kola (1 kutu 330ml)', kcal: 1, prot: 0.1, karb: 0.1, yag: 0, lif: 0 },
      { name: 'Portakal suyu (taze sıkma)', kcal: 45, prot: 0.7, karb: 10.4, yag: 0.2, lif: 0.2 },
      { name: 'Elma suyu (%100 doğal)', kcal: 46, prot: 0.1, karb: 11.4, yag: 0.1, lif: 0.2 },
      { name: 'Kahve (filtre, sade)', kcal: 2, prot: 0.3, karb: 0, yag: 0, lif: 0 },
      { name: 'Kahve (latte, %2 süt, ort boy)', kcal: 96, prot: 5.8, karb: 11.0, yag: 3.5, lif: 0 },
      { name: 'Çay (sade, bir bardak)', kcal: 2, prot: 0, karb: 0.4, yag: 0, lif: 0 },
      { name: 'Bitki çayı (papatya, sade)', kcal: 1, prot: 0, karb: 0.2, yag: 0, lif: 0 },
      { name: 'Enerji içeceği (1 kutu 250ml)', kcal: 112, prot: 1.0, karb: 27.0, yag: 0, lif: 0, unhealthy: true },
      { name: 'Meyve suyu (hazır, tatlı)', kcal: 113, prot: 0.5, karb: 27.0, yag: 0.3, lif: 0.5, unhealthy: true },
      { name: 'Smoothie (muzlu-sütlü)', kcal: 120, prot: 4.5, karb: 22.0, yag: 2.0, lif: 1.5 },

      // ── TÜRK MUTFAĞI & HAZIR YEMEKLER ──
      { name: 'Çorba (kırmızı mercimek)', kcal: 70, prot: 4.5, karb: 11.0, yag: 1.2, lif: 3.0 },
      { name: 'Çorba (domates)', kcal: 55, prot: 1.7, karb: 8.3, yag: 1.5, lif: 1.2 },
      { name: 'Ezogelin çorbası', kcal: 78, prot: 4.8, karb: 12.5, yag: 1.5, lif: 3.8 },
      { name: 'Tavuk çorbası (ev yapımı)', kcal: 62, prot: 4.5, karb: 5.8, yag: 2.1, lif: 0.4 },
      { name: 'Zeytinyağlı fasulye', kcal: 110, prot: 5.0, karb: 14.0, yag: 4.0, lif: 5.5 },
      { name: 'Zeytinyağlı enginar', kcal: 88, prot: 2.5, karb: 11.5, yag: 3.5, lif: 5.0 },
      { name: 'İmam bayıldı', kcal: 135, prot: 1.8, karb: 12.0, yag: 9.0, lif: 3.5 },
      { name: 'Dolma (yaprak, zeytinyağlı)', kcal: 130, prot: 2.0, karb: 18.0, yag: 5.5, lif: 2.0 },
      { name: 'Dolma (biber, etli)', kcal: 155, prot: 8.5, karb: 15.0, yag: 6.5, lif: 1.8 },
      { name: 'Sarma (yaprak, zeytinyağlı)', kcal: 141, prot: 2.2, karb: 18.5, yag: 6.5, lif: 2.5 },
      { name: 'Fırında tavuk but (sezonlu)', kcal: 189, prot: 28.5, karb: 2.0, yag: 7.5, lif: 0.3 },
      { name: 'Peynirli börek (1 dilim)', kcal: 260, prot: 10.0, karb: 28.0, yag: 12.0, lif: 1.0, unhealthy: true },
      { name: 'Ispanaklı börek (1 dilim)', kcal: 230, prot: 8.5, karb: 26.5, yag: 10.5, lif: 2.0, unhealthy: true },
      { name: 'Sigara böreği (3 adet)', kcal: 310, prot: 9.5, karb: 32.0, yag: 16.0, lif: 1.5, unhealthy: true },
      { name: 'Musakka (1 porsiyon)', kcal: 210, prot: 11.0, karb: 14.5, yag: 12.0, lif: 3.0 },
      { name: 'Graten (patates, kremalı)', kcal: 175, prot: 5.5, karb: 18.0, yag: 9.0, lif: 1.5, unhealthy: true },

      // ── SALATA & MEZELER ──
      { name: 'Cacık (yoğurtlu salatalık)', kcal: 47, prot: 3.0, karb: 3.5, yag: 2.0, lif: 0.5 },
      { name: 'Haydari (sarımsaklı yoğurt)', kcal: 110, prot: 7.0, karb: 5.0, yag: 7.0, lif: 0.5 },
      { name: 'Humus (nohut ezmesi)', kcal: 166, prot: 7.9, karb: 14.3, yag: 9.6, lif: 6.0 },
      { name: 'Babaganuş (patlıcanlı)', kcal: 55, prot: 2.0, karb: 8.6, yag: 1.5, lif: 3.4 },
      { name: 'Ton balıklı salata (zeytinyağlı)', kcal: 120, prot: 14.0, karb: 4.0, yag: 5.5, lif: 2.0 },
      { name: 'Avokado-domates salatası', kcal: 105, prot: 1.5, karb: 7.0, yag: 8.5, lif: 4.5 },

      // ── PROTEİN & SUPPLEMENT ──
      { name: 'Protein bar (20g protein)', kcal: 220, prot: 20.0, karb: 22.0, yag: 7.0, lif: 5.0 },
      { name: 'Protein tozu (whey, 1 ölçek ~30g)', kcal: 120, prot: 24.0, karb: 3.0, yag: 1.5, lif: 1.0 },
      { name: 'Protein tozu (bitki bazlı, 1 ölçek)', kcal: 110, prot: 22.0, karb: 4.0, yag: 2.0, lif: 3.0 },
      { name: 'Gainer (mass, 1 porsiyon ~90g)', kcal: 380, prot: 30.0, karb: 55.0, yag: 4.0, lif: 2.0 },
    ];
  }

  get foods() { return this.#foods; }

  search(q, limit = 7) {
    if (!q || q.length < 2) return [];
    const norm = normTr(q);
    return this.#foods
      .filter(f => normTr(f.name).includes(norm))
      .slice(0, limit);
  }

  getByIndex(i) { return this.#foods[i]; }
  indexOf(f)    { return this.#foods.indexOf(f); }
}

// ── TDEE HESAPLAYICI ───────────────────────────────────────────────────────

class NutritionCalculator {
  static calcTDEE(p) {
    if (!p) return null;
    let bmr;
    if (p.gender === 'male') bmr = 10 * p.weight + 6.25 * p.height - 5 * p.age + 5;
    else                     bmr = 10 * p.weight + 6.25 * p.height - 5 * p.age - 161;
    let tdee = bmr * p.activity;
    if (p.goal === 'lose') tdee -= 400;
    if (p.goal === 'gain') tdee += 300;
    return {
      kcal: Math.round(tdee),
      prot: Math.round(p.weight * 2),
      karb: Math.round((tdee * 0.45) / 4),
      yag:  Math.round((tdee * 0.25) / 9),
      lif:  Number(p.fiber_goal) || 25
    };
  }
}

// ── UI RENDERER ────────────────────────────────────────────────────────────

class UIRenderer {
  showTab(name) {
    ['today', 'add', 'history', 'profile'].forEach(t => {
      document.getElementById('tab-' + t).style.display = t === name ? 'block' : 'none';
      document.getElementById('tab-btn-' + t).classList.toggle('active', t === name);
    });
  }

  setRing(pct) {
    const offset = SVG_CIRCUMFERENCE - (Math.min(pct, 100) / 100) * SVG_CIRCUMFERENCE;
    document.getElementById('ringFill').style.strokeDashoffset = offset;
    document.getElementById('ringPct').textContent = Math.min(pct, 999) + '%';
  }

  renderToday(entries, targets) {
    const d = new Date();
    document.getElementById('dateDisplay').textContent =
      d.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' });

    let totalKcal = 0, totalProt = 0, totalKarb = 0, totalYag = 0, totalLif = 0;
    entries.forEach(e => {
      totalKcal += Number(e.kcal);
      totalProt += Number(e.prot);
      totalKarb += Number(e.karb);
      totalYag  += Number(e.yag);
      totalLif  += Number(e.lif);
    });

    const noP    = document.getElementById('no-profile-msg');
    const cBlock = document.getElementById('calori-block');
    const mBlock = document.getElementById('macro-block');

    if (!targets) {
      noP.style.display    = 'flex';
      cBlock.style.display = 'none';
      mBlock.style.display = 'none';
    } else {
      noP.style.display    = 'none';
      cBlock.style.display = 'flex';
      mBlock.style.display = 'grid';

      document.getElementById('consumed').textContent   = Math.round(totalKcal);
      document.getElementById('targetKcal').textContent = targets.kcal;
      document.getElementById('burnedDisp').textContent = 0;

      const rem   = targets.kcal - Math.round(totalKcal);
      const remEl = document.getElementById('remaining');
      remEl.textContent = Math.abs(rem) + (rem < 0 ? ' fazla' : '');
      remEl.style.color = rem < 0 ? 'var(--red)' : 'var(--green)';

      this.setRing(Math.round((totalKcal / targets.kcal) * 100));

      document.getElementById('p-cur').textContent  = Math.round(totalProt);
      document.getElementById('p-goal').textContent = targets.prot;
      document.getElementById('k-cur').textContent  = Math.round(totalKarb);
      document.getElementById('k-goal').textContent = targets.karb;
      document.getElementById('y-cur').textContent  = Math.round(totalYag);
      document.getElementById('y-goal').textContent = targets.yag;
      document.getElementById('l-cur').textContent  = Math.round(totalLif);
      document.getElementById('l-goal').textContent = targets.lif;

      document.getElementById('p-bar').style.width = pct(totalProt, targets.prot);
      document.getElementById('k-bar').style.width = pct(totalKarb, targets.karb);
      document.getElementById('y-bar').style.width = pct(totalYag,  targets.yag);
      document.getElementById('l-bar').style.width = pct(totalLif,  targets.lif);
    }

    const list = document.getElementById('todayList');
    if (!entries.length) {
      document.getElementById('motivationBanner').style.display = 'none';
      list.innerHTML = `
        <div class="empty-state">
          <span class="es-icon"><i class="ti ti-bowl-chopsticks"></i></span>
          <div class="es-title">Henüz besin eklenmedi</div>
          <div class="es-sub">Ekle sekmesinden besin ekleyebilirsin</div>
        </div>`;
      return;
    }

    const byMeal = {};
    entries.forEach(e => {
      if (!byMeal[e.meal]) byMeal[e.meal] = [];
      byMeal[e.meal].push(e);
    });
    list.innerHTML = '';

    const mealIcons = { 'Kahvaltı': '☀️', 'Öğle': '🍽', 'Akşam': '🌙', 'Ara öğün': '🍎' };
    ['Kahvaltı', 'Öğle', 'Akşam', 'Ara öğün'].forEach(meal => {
      if (!byMeal[meal]) return;

      const mLabel = document.createElement('div');
      mLabel.className = 'meal-group-label';
      mLabel.textContent = (mealIcons[meal] || '') + ' ' + meal;
      list.appendChild(mLabel);

      byMeal[meal].forEach(e => {
        const div = document.createElement('div');
        div.className = 'food-item' + (e.unhealthy ? ' unhealthy' : '');
        div.id = 'fi-' + e.id;

        const unhealthyBadge = e.unhealthy
          ? `<span class="badge-unhealthy">⚠ Diyete uygun değil</span>` : '';

        // XSS önleme: kullanıcı verisi escHtml ile kaçırılır
        div.innerHTML = `
          <div style="flex:1;min-width:0">
            <div class="fi-name">
              ${escHtml(e.name)}
              <span class="fi-amount" id="fi-amt-${e.id}">${escHtml(e.amount)}g</span>
              ${unhealthyBadge}
            </div>
            <div class="fi-macros" id="fi-mac-${e.id}">
              P: ${Math.round(e.prot)}g &nbsp;·&nbsp; K: ${Math.round(e.karb)}g &nbsp;·&nbsp; Y: ${Math.round(e.yag)}g
            </div>
            <div class="fi-edit-row" id="fi-erow-${e.id}" style="display:none">
              <input class="fi-edit-input" id="fi-einp-${e.id}" type="number" min="1" max="5000"
                     value="${escHtml(e.amount)}" placeholder="gram">
              <button class="fi-save-btn"   onclick="saveEdit(${e.id})">Kaydet</button>
              <button class="fi-cancel-btn" onclick="cancelEdit(${e.id})">İptal</button>
            </div>
          </div>
          <div class="fi-right">
            <div style="text-align:right">
              <div class="fi-kcal" id="fi-kcal-${e.id}">${Math.round(e.kcal)}</div>
              <div class="fi-kcal-unit">kcal</div>
            </div>
            <button class="edit-btn" id="fi-ebtn-${e.id}" onclick="editFood(${e.id})" aria-label="Düzenle">
              <i class="ti ti-pencil" aria-hidden="true"></i>
            </button>
            <button class="del" onclick="delFood(${e.id})" aria-label="Sil">
              <i class="ti ti-x" aria-hidden="true"></i>
            </button>
          </div>`;
        list.appendChild(div);
      });
    });

    this.renderMotivation(entries, targets);
  }

  renderMotivation(entries, targets) {
    const banner = document.getElementById('motivationBanner');
    const hasUnhealthy  = entries.some(e => e.unhealthy);
    const totalKcal     = entries.reduce((s, e) => s + Number(e.kcal), 0);
    const isOverCalorie = targets && Math.round(totalKcal) > targets.kcal;

    if (!hasUnhealthy && !isOverCalorie) { banner.style.display = 'none'; return; }

    const pick = arr => arr[Math.floor(Math.random() * arr.length)];
    const overMsgs = [
      'Bugün limitini aştın. Yarın yeni bir başlangıç — her gün bir şans!',
      'Kalori hedefini geçtin. Biraz yürüyüş dengeyi geri getirebilir. 💪',
      'Fazla kalori aldın, ama bu seni yıkamaz. Yarın daha güçlü devam!',
    ];
    const unhealthyMsgs = [
      'Diyete uygun olmayan bir besin yedin. Bir dahaki öğünde dengelemeyi dene!',
      'Bazen canımız istiyor — ama yediklerin takipte. Geri kalan öğünleri sağlıklı tut!',
    ];
    const bothMsgs = [
      'Hem kalori aştın hem de uygun olmayan besin yedin. Bugün geride bırak, yarın daha iyi!',
    ];

    let cls, iconTxt, titleTxt, msgTxt;
    if (isOverCalorie && hasUnhealthy) {
      cls = 'warn'; iconTxt = '🔥'; titleTxt = 'Dikkat: Kalori fazlası + uygunsuz besin!'; msgTxt = pick(bothMsgs);
    } else if (isOverCalorie) {
      cls = 'warn'; iconTxt = '🔥'; titleTxt = 'Günlük kalori limitini aştın!'; msgTxt = pick(overMsgs);
    } else {
      cls = 'caution'; iconTxt = '⚠️'; titleTxt = 'Diyete uygun olmayan besin tüketildi'; msgTxt = pick(unhealthyMsgs);
    }

    banner.className = 'motivation-banner ' + cls;
    banner.style.display = 'block';
    document.getElementById('motivationIcon').textContent  = iconTxt;
    document.getElementById('motivationTitle').textContent = titleTxt;
    document.getElementById('motivationMsg').textContent   = msgTxt;
  }

  renderHistory(history, targets) {
    const list = document.getElementById('historyList');
    if (!history.length) {
      list.innerHTML = `
        <div class="empty-state">
          <span class="es-icon"><i class="ti ti-calendar-off"></i></span>
          <div class="es-title">Henüz kayıt yok</div>
          <div class="es-sub">Besin ekledikçe burada görünür</div>
        </div>`;
      return;
    }

    list.innerHTML = '';
    history.forEach(row => {
      const d = new Date(row.date + 'T12:00:00');
      const dateStr = d.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' });
      const kcal = Number(row.total_kcal);

      let cls = '';
      let kcalCls = '';
      if (targets) {
        if (kcal > targets.kcal) { cls = 'over-target';  kcalCls = 'over';  }
        else                     { cls = 'under-target'; kcalCls = 'under'; }
      }

      const item = document.createElement('div');
      item.className = `history-item ${cls}`;
      item.innerHTML = `
        <div class="hi-left">
          <div class="hi-date">${escHtml(dateStr)}</div>
          <div class="hi-macros">
            P: ${Math.round(row.total_prot)}g &nbsp;·&nbsp;
            K: ${Math.round(row.total_karb)}g &nbsp;·&nbsp;
            Y: ${Math.round(row.total_yag)}g
          </div>
        </div>
        <div class="hi-right">
          <div class="hi-kcal ${kcalCls}">${Math.round(kcal)}</div>
          <div class="hi-unit">kcal</div>
          <div class="hi-count">${row.entry_count} kayıt</div>
        </div>`;
      list.appendChild(item);
    });
  }

  showAddMsg(msg, isErr) {
    const el = document.getElementById('addMsg');
    el.textContent = msg;
    el.style.display  = 'block';
    el.style.color    = isErr ? 'var(--red)'   : 'var(--green)';
    el.style.background  = isErr ? 'rgba(248,113,113,0.08)' : 'rgba(52,211,153,0.08)';
    el.style.borderColor = isErr ? 'rgba(248,113,113,0.2)'  : 'rgba(52,211,153,0.2)';
    setTimeout(() => { el.style.display = 'none'; }, 2500);
  }
}

// ── PROFİL YÖNETİCİ ───────────────────────────────────────────────────────

class ProfileManager {
  #currentGoal = 'maintain';

  selectGoal(g) {
    this.#currentGoal = g;
    ['lose', 'maintain', 'gain'].forEach(x => {
      const el = document.getElementById('goal-' + x);
      el.classList.toggle('selected', x === g);
      el.setAttribute('aria-checked', String(x === g));
    });
  }

  loadIntoForm(profile) {
    if (!profile) return;
    document.getElementById('height').value    = profile.height    || '';
    document.getElementById('weight').value    = profile.weight    || '';
    document.getElementById('age').value       = profile.age       || '';
    document.getElementById('gender').value    = profile.gender    || 'male';
    document.getElementById('activity').value  = profile.activity  || '1.55';
    document.getElementById('fiberGoal').value = profile.fiber_goal || 25;
    this.selectGoal(profile.goal || 'maintain');
  }

  readFromForm() {
    const h   = parseFloat(document.getElementById('height').value);
    const w   = parseFloat(document.getElementById('weight').value);
    const a   = parseFloat(document.getElementById('age').value);
    const g   = document.getElementById('gender').value;
    const act = parseFloat(document.getElementById('activity').value);
    const fib = parseInt(document.getElementById('fiberGoal').value) || 25;
    if (!h || !w || !a) return null;
    return { height: h, weight: w, age: a, gender: g, activity: act,
             goal: this.#currentGoal, fiber_goal: fib };
  }

  showResult(targets, isError = false, errorMsg = '') {
    const res = document.getElementById('profileResult');
    res.style.display = 'block';
    if (isError) {
      res.style.background  = 'rgba(248,113,113,0.07)';
      res.style.borderColor = 'rgba(248,113,113,0.2)';
      res.textContent = errorMsg;
    } else {
      res.style.background  = 'rgba(52,211,153,0.07)';
      res.style.borderColor = 'rgba(52,211,153,0.2)';
      res.innerHTML = `<i class="ti ti-check" style="color:var(--green)"></i>&nbsp; Kaydedildi! Günlük hedefin:<br>
        <b>${targets.kcal} kcal</b> &nbsp;·&nbsp; Protein: <b>${targets.prot}g</b>
        &nbsp;·&nbsp; Karb: <b>${targets.karb}g</b> &nbsp;·&nbsp; Yağ: <b>${targets.yag}g</b>
        &nbsp;·&nbsp; Lif: <b>${targets.lif}g</b>`;
    }
  }
}

// ── ANA UYGULAMA ───────────────────────────────────────────────────────────

class App {
  static #instance = null;

  #foodDatabase   = new FoodDatabase();
  #ui             = new UIRenderer();
  #profileManager = new ProfileManager();
  #selectedFood   = null;
  #searchTimeout  = null;
  #onlineProducts = [];
  #currentProfile = null;

  constructor() {
    if (App.#instance) return App.#instance;
    App.#instance = this;
  }

  static get instance() {
    if (!App.#instance) App.#instance = new App();
    return App.#instance;
  }

  async init() {
    const [profile, entries] = await Promise.all([
      api.getProfile(),
      api.getLogs()
    ]);
    this.#currentProfile = profile;
    const targets = NutritionCalculator.calcTDEE(profile);
    this.#ui.renderToday(entries, targets);

    document.addEventListener('click', e => {
      const sr = document.getElementById('searchResults');
      if (sr && !sr.contains(e.target) && e.target.id !== 'foodSearch') {
        sr.style.display = 'none';
      }
    });
  }

  async showTab(name) {
    this.#ui.showTab(name);
    if (name === 'today') {
      const entries = await api.getLogs();
      const targets = NutritionCalculator.calcTDEE(this.#currentProfile);
      this.#ui.renderToday(entries, targets);
    }
    if (name === 'history') {
      const history = await api.getHistory();
      const targets = NutritionCalculator.calcTDEE(this.#currentProfile);
      this.#ui.renderHistory(history, targets);
    }
    if (name === 'profile') {
      this.#profileManager.loadIntoForm(this.#currentProfile);
    }
  }

  async delFood(id) {
    if (!confirm('Bu besini silmek istediğine emin misin?')) return;
    try {
      await api.deleteLog(id);
      const entries = await api.getLogs();
      const targets = NutritionCalculator.calcTDEE(this.#currentProfile);
      this.#ui.renderToday(entries, targets);
    } catch {
      alert('Silme işlemi başarısız oldu.');
    }
  }

  editFood(id) {
    document.getElementById('fi-erow-' + id).style.display = 'flex';
    document.getElementById('fi-mac-'  + id).style.display = 'none';
    const btn = document.getElementById('fi-ebtn-' + id);
    if (btn) btn.style.display = 'none';
    const inp = document.getElementById('fi-einp-' + id);
    if (inp) { inp.focus(); inp.select(); }
  }

  cancelEdit(id) {
    document.getElementById('fi-erow-' + id).style.display = 'none';
    document.getElementById('fi-mac-'  + id).style.display = '';
    const btn = document.getElementById('fi-ebtn-' + id);
    if (btn) btn.style.display = '';
  }

  async saveEdit(id) {
    const inp = document.getElementById('fi-einp-' + id);
    const newAmount = parseFloat(inp.value);
    if (!newAmount || newAmount <= 0) { inp.focus(); return; }
    try {
      await api.updateLog(id, newAmount);
      const entries = await api.getLogs();
      const targets = NutritionCalculator.calcTDEE(this.#currentProfile);
      this.#ui.renderToday(entries, targets);
    } catch {
      alert('Güncelleme başarısız oldu.');
    }
  }

  searchFood(q) {
    const box = document.getElementById('searchResults');
    if (this.#searchTimeout) clearTimeout(this.#searchTimeout);
    if (!q || q.length < 2) {
      box.style.display = 'none';
      this.#onlineProducts = [];
      return;
    }
    const localResults = this.#foodDatabase.search(q);
    this.#onlineProducts = [];
    this.#renderSearchResults(localResults, [], false);

    this.#searchTimeout = setTimeout(() => {
      this.#searchOnline(q, localResults);
    }, 300);
  }

  async #searchOnline(q, localResults) {
    this.#renderSearchResults(localResults, [], true);

    const targetUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&lc=tr`;

    const fetchDirect = async () => {
      const r = await fetch(targetUrl);
      if (!r.ok) throw new Error('direct failed');
      return (await r.json()).products || [];
    };
    const fetchProxy1 = async () => {
      const r = await fetch('https://corsproxy.io/?' + encodeURIComponent(targetUrl));
      if (!r.ok) throw new Error('proxy1 failed');
      return (await r.json()).products || [];
    };
    const fetchProxy2 = async () => {
      const r = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`);
      if (!r.ok) throw new Error('proxy2 failed');
      const w = await r.json();
      const d = typeof w.contents === 'string' ? JSON.parse(w.contents) : w.contents;
      return d.products || [];
    };

    let products = [], success = false;
    try {
      products = await Promise.any([fetchDirect(), fetchProxy1(), fetchProxy2()]);
      success = true;
    } catch (e) {
      console.error('Online arama başarısız:', e);
    }

    if (success) {
      this.#onlineProducts = products
        .filter(p => p.product_name || p.product_name_tr)
        .slice(0, 7)
        .map(p => {
          const name  = p.product_name_tr || p.product_name || 'Bilinmeyen Besin';
          const brand = p.brands ? ` (${p.brands})` : '';
          const nut   = p.nutriments || {};
          let kcal = 0;
          if (nut['energy-kcal_100g'] != null) kcal = parseFloat(nut['energy-kcal_100g']);
          else if (nut['energy-kcal'] != null) kcal = parseFloat(nut['energy-kcal']);
          else if (nut['energy_100g'] != null)  kcal = parseFloat(nut['energy_100g']) / 4.184;
          return {
            name: name + brand,
            kcal: Math.round(kcal),
            prot: Math.round((parseFloat(nut.proteins_100g      || 0)) * 10) / 10,
            karb: Math.round((parseFloat(nut.carbohydrates_100g || 0)) * 10) / 10,
            yag:  Math.round((parseFloat(nut.fat_100g           || 0)) * 10) / 10,
            lif:  Math.round((parseFloat(nut.fiber_100g         || 0)) * 10) / 10,
            online: true
          };
        });
      this.#renderSearchResults(localResults, this.#onlineProducts, false);
    } else {
      this.#renderSearchResults(localResults, [], false, true);
    }
  }

  #renderSearchResults(localResults, onlineResults, isLoading, isError = false) {
    const box = document.getElementById('searchResults');
    if (!localResults.length && !onlineResults.length && !isLoading && !isError) {
      box.style.display = 'none';
      return;
    }
    box.style.display = 'block';
    let html = '';

    if (localResults.length) {
      if (onlineResults.length || isLoading || isError) {
        html += `<div class="search-results-section">Kendi Yemeklerin</div>`;
      }
      html += localResults.map(f => {
        const idx = this.#foodDatabase.indexOf(f);
        return `
          <div class="search-item${f.unhealthy ? ' unhealthy' : ''}" onclick="selectSearchFood(${idx})">
            <div class="s-name">${escHtml(f.name)}${f.unhealthy ? '<span class="s-unhealthy-tag">⚠ Dikkat</span>' : ''}</div>
            <div class="s-macro">${f.kcal} kcal/100g &nbsp;·&nbsp; P:${f.prot}g &nbsp;K:${f.karb}g &nbsp;Y:${f.yag}g</div>
          </div>`;
      }).join('');
    }

    if (onlineResults.length) {
      html += `<div class="search-results-section">İnternet Sonuçları (Open Food Facts)</div>`;
      html += onlineResults.map((f, idx) => `
        <div class="search-item online" onclick="selectOnlineFood(${idx})">
          <div class="s-name">
            <span>${escHtml(f.name)}</span>
            <span class="s-online-tag">🌐 İnternet</span>
          </div>
          <div class="s-macro">${f.kcal} kcal/100g &nbsp;·&nbsp; P:${f.prot}g &nbsp;K:${f.karb}g &nbsp;Y:${f.yag}g</div>
        </div>`).join('');
    }

    if (isLoading) {
      html += `<div class="search-loading"><div class="spinner"></div><span>İnternette aranıyor...</span></div>`;
    }
    if (isError && !onlineResults.length) {
      html += `<div class="search-loading" style="color:var(--red)"><span>⚠ İnternet araması başarısız oldu.</span></div>`;
    }

    box.innerHTML = html;
  }

  selectSearchFood(idx) {
    this.#selectedFood = this.#foodDatabase.getByIndex(idx);
    this.#fillForm(this.#selectedFood);
  }

  selectOnlineFood(idx) {
    this.#selectedFood = this.#onlineProducts[idx];
    this.#fillForm(this.#selectedFood);
  }

  #fillForm(f) {
    document.getElementById('foodSearch').value = f.name;
    document.getElementById('searchResults').style.display = 'none';
    document.getElementById('customName').value = f.name;
    document.getElementById('customKcal').value = f.kcal;
    document.getElementById('customProt').value = f.prot;
    document.getElementById('customKarb').value = f.karb;
    document.getElementById('customYag').value  = f.yag;
    document.getElementById('customLif').value  = f.lif;
  }

  async addFood() {
    const name    = document.getElementById('customName').value.trim();
    const amount  = parseFloat(document.getElementById('foodAmount').value) || 100;
    const kcal100 = parseFloat(document.getElementById('customKcal').value) || 0;
    const prot100 = parseFloat(document.getElementById('customProt').value) || 0;
    const karb100 = parseFloat(document.getElementById('customKarb').value) || 0;
    const yag100  = parseFloat(document.getElementById('customYag').value)  || 0;
    const lif100  = parseFloat(document.getElementById('customLif').value)  || 0;
    const meal    = document.getElementById('mealType').value;

    if (!name) { this.#ui.showAddMsg('⚠ Besin adı giriniz!', true); return; }

    const ratio     = amount / 100;
    const isUnhealthy = this.#selectedFood ? (this.#selectedFood.unhealthy === true) : false;

    try {
      await api.addLog({
        log_date: todayKey(),
        meal, name, amount, unhealthy: isUnhealthy,
        kcal: kcal100 * ratio,
        prot: prot100 * ratio,
        karb: karb100 * ratio,
        yag:  yag100  * ratio,
        lif:  lif100  * ratio
      });
      this.#ui.showAddMsg('✓ ' + name + ' başarıyla eklendi!', false);
      ['customName','foodSearch','customKcal','customProt','customKarb','customYag','customLif']
        .forEach(id => { document.getElementById(id).value = ''; });
      document.getElementById('foodAmount').value = '100';
      this.#selectedFood = null;
    } catch {
      this.#ui.showAddMsg('⚠ Eklenirken bir hata oluştu.', true);
    }
  }

  selectGoal(g) {
    this.#profileManager.selectGoal(g);
  }

  async saveProfile() {
    const profile = this.#profileManager.readFromForm();
    if (!profile) {
      this.#profileManager.showResult(null, true, 'Lütfen tüm alanları doldur.');
      return;
    }
    try {
      this.#currentProfile = await api.saveProfile(profile);
      const targets = NutritionCalculator.calcTDEE(this.#currentProfile);
      this.#profileManager.showResult(targets);
    } catch {
      this.#profileManager.showResult(null, true, 'Kayıt sırasında bir hata oluştu.');
    }
  }
}

// ── YARDIMCI ──────────────────────────────────────────────────────────────

function pct(val, goal) {
  return Math.min(100, goal > 0 ? Math.round((val / goal) * 100) : 0) + '%';
}

// ── BAŞLATMA & GLOBAL KÖPRÜLER ────────────────────────────────────────────

const app = App.instance;

document.addEventListener('DOMContentLoaded', () => { app.init(); });

function showTab(name)        { app.showTab(name); }
function delFood(id)          { app.delFood(id); }
function editFood(id)         { app.editFood(id); }
function cancelEdit(id)       { app.cancelEdit(id); }
function saveEdit(id)         { app.saveEdit(id); }
function searchFood(q)        { app.searchFood(q); }
function selectSearchFood(i)  { app.selectSearchFood(i); }
function selectOnlineFood(i)  { app.selectOnlineFood(i); }
function addFood()            { app.addFood(); }
function selectGoal(g)        { app.selectGoal(g); }
function saveProfile()        { app.saveProfile(); }
