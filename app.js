class StateManager {
  #dbKey;
  #state;

  constructor(dbKey) {
    this.#dbKey = dbKey;
    this.#state = JSON.parse(localStorage.getItem(this.#dbKey) || 'null') || {
      profile: null,
      goal: 'maintain',
      logs: {}
    };
  }

  get state() {
    return this.#state;
  }

  get profile() {
    return this.#state.profile;
  }

  set profile(p) {
    this.#state.profile = p;
    this.save();
  }

  get goal() {
    return this.#state.goal || 'maintain';
  }

  set goal(g) {
    this.#state.goal = g;
    this.save();
  }

  get logs() {
    return this.#state.logs;
  }

  todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  checkDayReset() {
    const today = this.todayKey();
    if (!this.#state.logs[today]) {
      this.#state.logs[today] = [];
    }
    this.save();
  }

  save() {
    localStorage.setItem(this.#dbKey, JSON.stringify(this.#state));
  }
}

class FoodDatabase {
  #foods;

  constructor() {
    this.#foods = [
      // ── YUMURTA ──
      { name: 'Yumurta (tam, haslanmis)', kcal: 155, prot: 13, karb: 1.1, yag: 11, lif: 0 },
      { name: 'Yumurta (sahanda, az yagli)', kcal: 185, prot: 13.5, karb: 0.4, yag: 14, lif: 0 },
      { name: 'Yumurta beyazi (haslanmis)', kcal: 52, prot: 10.9, karb: 0.7, yag: 0.2, lif: 0 },
      { name: 'Yumurta sarisi', kcal: 322, prot: 15.9, karb: 3.6, yag: 26.5, lif: 0 },
      { name: 'Menemen (zeytinyagli)', kcal: 98, prot: 5.8, karb: 4.2, yag: 6.8, lif: 1.2 },
      { name: 'Omlet (sade, az yagli)', kcal: 154, prot: 10.6, karb: 0.4, yag: 12, lif: 0 },

      // ── TAVUK ──
      { name: 'Tavuk gogsu (haslanmis)', kcal: 165, prot: 31, karb: 0, yag: 3.6, lif: 0 },
      { name: 'Tavuk gogsu (izgara)', kcal: 158, prot: 32, karb: 0, yag: 2.7, lif: 0 },
      { name: 'Tavuk gogsu (firinda)', kcal: 172, prot: 30.5, karb: 0, yag: 4.5, lif: 0 },
      { name: 'Tavuk but (derisiz, pismis)', kcal: 179, prot: 28, karb: 0, yag: 7, lif: 0 },
      { name: 'Tavuk but (derili, pismis)', kcal: 209, prot: 26, karb: 0, yag: 11, lif: 0 },
      { name: 'Tavuk kanat (pismis)', kcal: 223, prot: 23, karb: 0, yag: 14, lif: 0 },
      { name: 'Tavuk kiyma (yagsiz)', kcal: 143, prot: 17.4, karb: 0, yag: 8.1, lif: 0 },

      // ── HINDI ──
      { name: 'Hindi gogsu (haslanmis)', kcal: 135, prot: 28.7, karb: 0, yag: 1.7, lif: 0 },
      { name: 'Hindi gogsu (izgara)', kcal: 147, prot: 29.9, karb: 0, yag: 2.3, lif: 0 },
      { name: 'Hindi but (pismis)', kcal: 189, prot: 28.6, karb: 0, yag: 7.4, lif: 0 },
      { name: 'Hindi fume (dilimlenmis)', kcal: 104, prot: 18.5, karb: 1.8, yag: 2.4, lif: 0 },
      { name: 'Hindi rosto (dilimlenmis)', kcal: 112, prot: 22, karb: 0, yag: 2.1, lif: 0 },
      { name: 'Hindi kiyma (yagsiz)', kcal: 149, prot: 21, karb: 0, yag: 7, lif: 0 },

      // ── KIRMIZI ET ──
      { name: 'Dana filetosu (izgara)', kcal: 187, prot: 28.7, karb: 0, yag: 7.7, lif: 0 },
      { name: 'Dana antrikot (pismis)', kcal: 268, prot: 26.4, karb: 0, yag: 17.5, lif: 0 },
      { name: 'Dana kiyma (yagsiz, pismis)', kcal: 215, prot: 26, karb: 0, yag: 12, lif: 0 },
      { name: 'Dana kiyma (yagli, pismis)', kcal: 332, prot: 14, karb: 0, yag: 30, lif: 0, unhealthy: true },
      { name: 'Kuzu eti (pismis)', kcal: 258, prot: 26, karb: 0, yag: 16, lif: 0 },
      { name: 'Kuzu pirzola (pismis)', kcal: 283, prot: 25, karb: 0, yag: 19.5, lif: 0 },
      { name: 'Kofte (dana, pismis)', kcal: 235, prot: 20, karb: 4.5, yag: 14.5, lif: 0.3 },

      // ── ISLENMIS ET ──
      { name: 'Sucuk', kcal: 455, prot: 20, karb: 2, yag: 40, lif: 0, unhealthy: true },
      { name: 'Pastirma', kcal: 199, prot: 31, karb: 0.5, yag: 7.2, lif: 0 },
      { name: 'Salam (dana)', kcal: 249, prot: 13.5, karb: 2.8, yag: 20.5, lif: 0, unhealthy: true },
      { name: 'Sosis (dana)', kcal: 290, prot: 11.4, karb: 3.1, yag: 26, lif: 0, unhealthy: true },
      { name: 'Hindi salam', kcal: 134, prot: 17, karb: 2.1, yag: 6, lif: 0 },
      { name: 'Jambon (hindi)', kcal: 107, prot: 14.5, karb: 3.5, yag: 4, lif: 0 },
      { name: 'Jambon (dana)', kcal: 145, prot: 17, karb: 3.8, yag: 7, lif: 0, unhealthy: true },

      // ── BALIK & DENIZ URUNU ──
      { name: 'Somon (firinda)', kcal: 208, prot: 20.4, karb: 0, yag: 13.4, lif: 0 },
      { name: 'Ton baligi (konserve, suyu icinde)', kcal: 116, prot: 25.5, karb: 0, yag: 0.8, lif: 0 },
      { name: 'Ton baligi (konserve, yagda)', kcal: 198, prot: 22, karb: 0, yag: 12, lif: 0 },
      { name: 'Uskumru (pismis)', kcal: 205, prot: 18.6, karb: 0, yag: 13.9, lif: 0 },
      { name: 'Levrek (firinda)', kcal: 124, prot: 23.6, karb: 0, yag: 2.5, lif: 0 },
      { name: 'Cipura (firinda)', kcal: 128, prot: 26.6, karb: 2.1, yag: 0, lif: 0 }, // Cipura
      { name: 'Hamsi (pismis)', kcal: 131, prot: 20.4, karb: 0, yag: 5, lif: 0 },
      { name: 'Karides (haslanmis)', kcal: 99, prot: 20.9, karb: 0.9, yag: 1.1, lif: 0 },
      { name: 'Midye (buharda)', kcal: 86, prot: 11.9, karb: 3.7, yag: 2.2, lif: 0 },
      { name: 'Ahtapot (haslanmis)', kcal: 82, prot: 14.9, karb: 2.2, yag: 1.0, lif: 0 },
      { name: 'Sardalya (konserve, yagda)', kcal: 208, prot: 24.6, karb: 0, yag: 11.4, lif: 0 },
      { name: 'Ringa baligi (pismis)', kcal: 217, prot: 24.6, karb: 0, yag: 12.4, lif: 0 },

      // ── SUT URUNLERI ──
      { name: 'Sut (tam yagli, %3.5)', kcal: 61, prot: 3.2, karb: 4.8, yag: 3.3, lif: 0 },
      { name: 'Sut (yarim yagli, %1.5)', kcal: 42, prot: 3.4, karb: 4.9, yag: 1.5, lif: 0 },
      { name: 'Sut (yagsiz, %0)', kcal: 34, prot: 3.4, karb: 4.9, yag: 0.1, lif: 0 },
      { name: 'Yogurt (sade, tam yagli)', kcal: 59, prot: 3.5, karb: 3.6, yag: 3.3, lif: 0 },
      { name: 'Yogurt (yagsiz, %0)', kcal: 35, prot: 5.7, karb: 3.7, yag: 0.4, lif: 0 },
      { name: 'Suzme yogurt (tam yagli)', kcal: 97, prot: 9.0, karb: 3.8, yag: 5.0, lif: 0 },
      { name: 'Suzme yogurt (yagsiz)', kcal: 59, prot: 11.0, karb: 3.6, yag: 0.3, lif: 0 },
      { name: 'Kefir (tam yagli)', kcal: 61, prot: 3.4, karb: 4.5, yag: 3.5, lif: 0 },
      { name: 'Ayran (1 bardak ~250ml)', kcal: 29, prot: 1.8, karb: 2.1, yag: 1.4, lif: 0 },
      { name: 'Lor peyniri', kcal: 98, prot: 11.1, karb: 3.4, yag: 4.0, lif: 0 },
      { name: 'Beyaz peynir (az yagli, %6)', kcal: 130, prot: 19, karb: 1.5, yag: 5, lif: 0 },
      { name: 'Beyaz peynir (normal, %9)', kcal: 264, prot: 14, karb: 2.4, yag: 21, lif: 0 },
      { name: 'Kasar peyniri', kcal: 387, prot: 25.2, karb: 1.3, yag: 31.0, lif: 0 },
      { name: 'Tulum peyniri', kcal: 354, prot: 22, karb: 0.5, yag: 29, lif: 0 },
      { name: 'Cheddar peyniri', kcal: 403, prot: 24.9, karb: 1.3, yag: 33.1, lif: 0 },
      { name: 'Mozzarella (tam yagli)', kcal: 280, prot: 19.9, karb: 2.2, yag: 21.6, lif: 0 },
      { name: 'Parmesan peyniri', kcal: 431, prot: 38.5, karb: 4.1, yag: 28.6, lif: 0 },
      { name: 'Tereyagi (tuzsuz)', kcal: 717, prot: 0.9, karb: 0.1, yag: 81.1, lif: 0, unhealthy: true },
      { name: 'Margarin', kcal: 718, prot: 0.2, karb: 0.7, yag: 80.4, lif: 0, unhealthy: true },

      // ── EKMEK & HAMUR ISLERI ──
      { name: 'Ekmek (tam bugday)', kcal: 247, prot: 13.0, karb: 41.0, yag: 4.2, lif: 7.0 },
      { name: 'Ekmek (cok tahilli)', kcal: 252, prot: 10.8, karb: 43.0, yag: 4.4, lif: 6.5 },
      { name: 'Ekmek (beyaz)', kcal: 265, prot: 9.0, karb: 49.0, yag: 3.2, lif: 2.7, unhealthy: true },
      { name: 'Ekmek (cavdar)', kcal: 259, prot: 8.5, karb: 48.0, yag: 3.3, lif: 6.0 },
      { name: 'Lavash (tam bugday unlu)', kcal: 218, prot: 8.5, karb: 40.5, yag: 2.8, lif: 5.2 },
      { name: 'Lavash (beyaz unlu)', kcal: 255, prot: 7.8, karb: 48.0, yag: 3.5, lif: 1.6, unhealthy: true },
      { name: 'Tortilla (tam bugday)', kcal: 234, prot: 8.0, karb: 36.0, yag: 6.5, lif: 4.5 },
      { name: 'Tortilla (beyaz un)', kcal: 298, prot: 7.8, karb: 48.0, yag: 7.6, lif: 2.1, unhealthy: true },
      { name: 'Simit (susamli)', kcal: 297, prot: 10.0, karb: 57.0, yag: 3.0, lif: 2.0, unhealthy: true },
      { name: 'Bazlama', kcal: 264, prot: 8.1, karb: 52.0, yag: 3.0, lif: 1.8, unhealthy: true },
      { name: 'Yufka (ince)', kcal: 326, prot: 8.5, karb: 62.0, yag: 5.0, lif: 2.0 },
      { name: 'Pide (sade)', kcal: 239, prot: 8.2, karb: 46.5, yag: 2.1, lif: 1.8 },
      { name: 'Pide (kasar peynirli)', kcal: 290, prot: 13.0, karb: 38.0, yag: 9.0, lif: 1.0, unhealthy: true },
      { name: 'Kruvasan', kcal: 406, prot: 8.2, karb: 45.8, yag: 21.0, lif: 1.9, unhealthy: true },
      { name: 'Galeta (tam bugday)', kcal: 348, prot: 12.0, karb: 62.0, yag: 5.0, lif: 8.0 },
      { name: 'Kraker (tam tahilli)', kcal: 380, prot: 10, karb: 67, yag: 8, lif: 6 },

      // ── TAHIL & MAKARNA ──
      { name: 'Pirinc (beyaz, pismis)', kcal: 130, prot: 2.7, karb: 28.2, yag: 0.3, lif: 0.4 },
      { name: 'Pirinc (esmer, pismis)', kcal: 112, prot: 2.6, karb: 23.5, yag: 0.9, lif: 1.8 },
      { name: 'Bulgur (pismis)', kcal: 83, prot: 3.1, karb: 18.6, yag: 0.2, lif: 4.5 },
      { name: 'Kinoa (pismis)', kcal: 120, prot: 4.4, karb: 21.3, yag: 1.9, lif: 2.8 },
      { name: 'Yulaf ezmesi (kuru)', kcal: 389, prot: 16.9, karb: 66.3, yag: 6.9, lif: 10.6 },
      { name: 'Yulaf ezmesi (pismis, suda)', kcal: 68, prot: 2.4, karb: 12.0, yag: 1.4, lif: 1.7 },
      { name: 'Makarna (beyaz, pismis)', kcal: 131, prot: 5.0, karb: 25.1, yag: 1.1, lif: 1.8 },
      { name: 'Makarna (tam bugday, pismis)', kcal: 124, prot: 5.3, karb: 26.5, yag: 0.5, lif: 3.9 },
      { name: 'Misir lapasi (polenta, pismis)', kcal: 70, prot: 1.6, karb: 14.7, yag: 0.7, lif: 0.7 },
      { name: 'Pilav (pirinc, sade)', kcal: 143, prot: 2.6, karb: 28.0, yag: 2.5, lif: 0.4 },
      { name: 'Pilav (bulgur, sade)', kcal: 118, prot: 3.8, karb: 21.5, yag: 2.4, lif: 4.0 },

      // ── BAKLAGILLER ──
      { name: 'Mercimek (kirmizi, pismis)', kcal: 116, prot: 9.0, karb: 20.1, yag: 0.4, lif: 7.9 },
      { name: 'Mercimek (yesil, pismis)', kcal: 116, prot: 9.0, karb: 20.1, yag: 0.4, lif: 7.9 },
      { name: 'Nohut (pismis)', kcal: 164, prot: 8.9, karb: 27.4, yag: 2.6, lif: 7.6 },
      { name: 'Kuru fasulye (pismis)', kcal: 127, prot: 8.7, karb: 22.8, yag: 0.5, lif: 6.4 },
      { name: 'Bezelye (taze, haslanmis)', kcal: 84, prot: 5.4, karb: 15.6, yag: 0.2, lif: 5.5 },
      { name: 'Edamame (haslanmis)', kcal: 122, prot: 11.9, karb: 8.9, yag: 5.2, lif: 5.2 },
      { name: 'Soya fasulyesi (pismis)', kcal: 173, prot: 16.6, karb: 9.9, yag: 9.0, lif: 6.0 },
      { name: 'Tofu (sert)', kcal: 76, prot: 8.1, karb: 1.9, yag: 4.2, lif: 0.3 },
      { name: 'Barbunya (pismis)', kcal: 127, prot: 8.7, karb: 22.8, yag: 0.5, lif: 6.4 },

      // ── SEBZELER ──
      { name: 'Patates (haslanmis)', kcal: 87, prot: 1.9, karb: 20.1, yag: 0.1, lif: 1.8 },
      { name: 'Patates kizartmasi (derin yag)', kcal: 312, prot: 3.4, karb: 41.4, yag: 15.0, lif: 3.8, unhealthy: true },
      { name: 'Tatli patates (haslanmis)', kcal: 86, prot: 1.6, karb: 20.1, yag: 0.1, lif: 3.0 },
      { name: 'Domates (taze)', kcal: 18, prot: 0.9, karb: 3.9, yag: 0.2, lif: 1.2 },
      { name: 'Salatalik (taze)', kcal: 15, prot: 0.7, karb: 3.6, yag: 0.1, lif: 0.5 },
      { name: 'Ispanak (taze)', kcal: 23, prot: 2.9, karb: 3.6, yag: 0.4, lif: 2.2 },
      { name: 'Ispanak (pismis)', kcal: 41, prot: 5.3, karb: 3.8, yag: 0.5, lif: 4.3 },
      { name: 'Brokoli (haslanmis)', kcal: 34, prot: 2.8, karb: 6.6, yag: 0.4, lif: 2.6 },
      { name: 'Karnabahar (haslanmis)', kcal: 25, prot: 1.9, karb: 4.1, yag: 0.3, lif: 2.3 },
      { name: 'Lahana (beyaz, cig)', kcal: 25, prot: 1.3, karb: 5.8, yag: 0.1, lif: 2.5 },
      { name: 'Patlican (pismis)', kcal: 35, prot: 0.8, karb: 8.7, yag: 0.2, lif: 2.5 },
      { name: 'Kabak (haslanmis)', kcal: 17, prot: 1.2, karb: 3.1, yag: 0.3, lif: 1.0 },
      { name: 'Biber (yesil, dolmalik)', kcal: 20, prot: 0.9, karb: 4.6, yag: 0.2, lif: 1.7 },
      { name: 'Biber (kirmizi, dolmalik)', kcal: 31, prot: 1.0, karb: 7.3, yag: 0.3, lif: 2.1 },
      { name: 'Mantar (beyaz, taze)', kcal: 22, prot: 3.1, karb: 3.3, yag: 0.3, lif: 1.0 },
      { name: 'Sogan (kuru)', kcal: 40, prot: 1.1, karb: 9.3, yag: 0.1, lif: 1.7 },
      { name: 'Pirasa (pismis)', kcal: 31, prot: 0.8, karb: 7.6, yag: 0.2, lif: 1.8 },
      { name: 'Havuc (taze)', kcal: 41, prot: 0.9, karb: 9.6, yag: 0.2, lif: 2.8 },
      { name: 'Kereviz (sap)', kcal: 16, prot: 0.7, karb: 3.0, yag: 0.2, lif: 1.6 },
      { name: 'Roka (taze)', kcal: 25, prot: 2.6, karb: 3.7, yag: 0.7, lif: 1.6 },
      { name: 'Marul (yesil yaprak)', kcal: 15, prot: 1.4, karb: 2.9, yag: 0.2, lif: 1.3 },
      { name: 'Avokado (olgun)', kcal: 160, prot: 2.0, karb: 8.5, yag: 14.7, lif: 6.7 },
      { name: 'Bamya (haslanmis)', kcal: 22, prot: 1.9, karb: 4.0, yag: 0.2, lif: 2.0 },
      { name: 'Kuskonmaz (haslanmis)', kcal: 20, prot: 2.2, karb: 3.7, yag: 0.1, lif: 2.1 },
      { name: 'Enginar (haslanmis)', kcal: 53, prot: 2.9, karb: 10.5, yag: 0.2, lif: 5.4 },
      { name: 'Misir (haslanmis)', kcal: 96, prot: 3.4, karb: 21.0, yag: 1.5, lif: 2.4 },
      { name: 'Maydanoz (taze)', kcal: 36, prot: 3.0, karb: 6.3, yag: 0.8, lif: 3.3 },
      { name: 'Dereotu (taze)', kcal: 43, prot: 3.5, karb: 7.0, yag: 1.1, lif: 2.1 },
      { name: 'Nane (taze)', kcal: 70, prot: 3.8, karb: 14.9, yag: 0.9, lif: 8.0 },

      // ── MEYVELER ──
      { name: 'Elma (kirmizi)', kcal: 52, prot: 0.3, karb: 13.8, yag: 0.2, lif: 2.4 },
      { name: 'Elma (yesil, eksi)', kcal: 58, prot: 0.4, karb: 15.2, yag: 0.2, lif: 2.8 },
      { name: 'Muz (olgun)', kcal: 89, prot: 1.1, karb: 22.8, yag: 0.3, lif: 2.6 },
      { name: 'Portakal', kcal: 47, prot: 0.9, karb: 11.8, yag: 0.1, lif: 2.4 },
      { name: 'Mandalina', kcal: 53, prot: 0.8, karb: 13.3, yag: 0.3, lif: 1.8 },
      { name: 'Greyfurt', kcal: 42, prot: 0.8, karb: 10.7, yag: 0.1, lif: 1.6 },
      { name: 'Cilek (taze)', kcal: 32, prot: 0.7, karb: 7.7, yag: 0.3, lif: 2.0 },
      { name: 'Karpuz', kcal: 30, prot: 0.6, karb: 7.6, yag: 0.2, lif: 0.4 },
      { name: 'Kavun', kcal: 34, prot: 0.8, karb: 8.2, yag: 0.2, lif: 0.9 },
      { name: 'Kivi (yesil)', kcal: 61, prot: 1.1, karb: 14.7, yag: 0.5, lif: 3.0 },
      { name: 'Uzum (yesil)', kcal: 67, prot: 0.6, karb: 17.2, yag: 0.4, lif: 0.9 },
      { name: 'Seftali (taze)', kcal: 39, prot: 0.9, karb: 9.5, yag: 0.3, lif: 1.5 },
      { name: 'Armut', kcal: 57, prot: 0.4, karb: 15.2, yag: 0.1, lif: 3.1 },
      { name: 'Kayisi (taze)', kcal: 48, prot: 1.4, karb: 11.1, yag: 0.4, lif: 2.0 },
      { name: 'Kayisi (kuru)', kcal: 241, prot: 3.4, karb: 62.6, yag: 0.5, lif: 7.3 },
      { name: 'Kiraz', kcal: 50, prot: 1.0, karb: 12.2, yag: 0.3, lif: 1.6 },
      { name: 'Visne', kcal: 63, prot: 1.0, karb: 16.0, yag: 0.3, lif: 2.1 },
      { name: 'Nar (taze)', kcal: 83, prot: 1.7, karb: 18.7, yag: 1.2, lif: 4.0 },
      { name: 'Incir (taze)', kcal: 74, prot: 0.8, karb: 19.2, yag: 0.3, lif: 2.9 },
      { name: 'Incir (kuru)', kcal: 249, prot: 3.3, karb: 63.9, yag: 0.9, lif: 9.8 },
      { name: 'Hurma (medjool)', kcal: 282, prot: 2.5, karb: 74.9, yag: 0.4, lif: 8.0 },
      { name: 'Ananas (taze)', kcal: 50, font: 0.5, karb: 13.1, yag: 0.1, lif: 1.4 },
      { name: 'Mango (taze)', kcal: 60, prot: 0.8, karb: 15.0, yag: 0.4, lif: 1.6 },
      { name: 'Kuru uzum', kcal: 299, prot: 3.1, karb: 79.2, yag: 0.5, lif: 3.7 },
      { name: 'Kuru erik', kcal: 240, prot: 2.2, karb: 63.9, yag: 0.4, lif: 7.1 },

      // ── YAĞLAR & KURUYEMIŞLER ──
      { name: 'Zeytinyagi (sizma)', kcal: 884, prot: 0, karb: 0, yag: 100, lif: 0 },
      { name: 'Zeytin (siyah, tursu)', kcal: 145, prot: 1.0, karb: 3.8, yag: 13.1, lif: 3.2 },
      { name: 'Zeytin (yesil, tursu)', kcal: 145, prot: 1.0, karb: 3.8, yag: 13.1, lif: 3.2 },
      { name: 'Badem (cig)', kcal: 579, prot: 21.2, karb: 21.6, yag: 49.9, lif: 12.5 },
      { name: 'Findik (cig)', kcal: 628, prot: 14.9, karb: 16.7, yag: 60.8, lif: 9.7 },
      { name: 'Ceviz (cig)', kcal: 654, prot: 15.2, karb: 13.7, yag: 65.2, lif: 6.7 },
      { name: 'Antep fistigi (kavrulmus)', kcal: 562, prot: 20.2, karb: 27.5, yag: 45.4, lif: 10.3 },
      { name: 'Kaju fisigi (cig)', kcal: 553, prot: 18.2, karb: 30.2, yag: 43.9, lif: 3.3 },
      { name: 'Yer fistigi (kavrulmus)', kcal: 585, prot: 23.7, karb: 21.5, yag: 49.7, lif: 8.5 },
      { name: 'Tahin (susam ezmesi)', kcal: 595, prot: 17.0, karb: 21.2, yag: 53.8, lif: 9.3 },
      { name: 'Fistik ezmesi (dogal)', kcal: 588, prot: 25.1, karb: 19.6, yag: 50.4, lif: 6.0 },
      { name: 'Chia tohumu', kcal: 486, prot: 16.5, karb: 42.1, yag: 30.7, lif: 34.4 },
      { name: 'Keten tohumu (ogutulmus)', kcal: 534, prot: 18.3, karb: 28.9, yag: 42.2, lif: 27.3 },
      { name: 'Kabak cekirdegi (cig)', kcal: 559, prot: 30.2, karb: 10.7, yag: 49.1, lif: 6.0 },
      { name: 'Ayicekirdegi cekirdegi', kcal: 584, prot: 20.8, karb: 20.0, yag: 51.5, lif: 8.6 },
      { name: 'Susam (cig)', kcal: 573, prot: 17.7, karb: 23.5, yag: 49.7, lif: 11.8 },

      // ── FAST FOOD & ISLENMIS ──
      { name: 'Hamburger (ekmekle, standart)', kcal: 295, prot: 14.5, karb: 25.7, yag: 14.5, lif: 1.4, unhealthy: true },
      { name: 'Pizza (margarita, 1 dilim)', kcal: 213, prot: 9.0, karb: 26.0, yag: 8.0, lif: 1.6, unhealthy: true },
      { name: 'Pizza (pepperoni, 1 dilim)', kcal: 285, prot: 12.0, karb: 36.0, yag: 10.0, lif: 2.3, unhealthy: true },
      { name: 'Doner (tavuk, durum)', kcal: 380, prot: 22, karb: 40, yag: 13, lif: 2, unhealthy: true },
      { name: 'Doner (et, durum)', kcal: 430, prot: 24, karb: 38, yag: 18, lif: 1.5, unhealthy: true },
      { name: 'Lahmacun (1 adet)', kcal: 210, prot: 9, karb: 28, yag: 7, lif: 1.5, unhealthy: true },
      { name: 'Cips (patates, klasik)', kcal: 536, prot: 6.6, karb: 52.5, yag: 34.6, lif: 4.8, unhealthy: true },
      { name: 'Popcorn (tereyagli)', kcal: 387, prot: 6.3, karb: 74.1, yag: 9.0, lif: 14.5, unhealthy: true },
      { name: 'Hot dog (sosis + ekmek)', kcal: 290, prot: 10.6, karb: 21.3, yag: 17.1, lif: 0.9, unhealthy: true },

      // ── TATLILAR & SEKER ──
      { name: 'Cikolata (sutlu)', kcal: 535, prot: 7.7, karb: 59.4, yag: 29.7, lif: 3.4, unhealthy: true },
      { name: 'Cikolata (bitter, %70+)', kcal: 598, prot: 7.8, karb: 45.9, yag: 43.1, lif: 10.9 },
      { name: 'Dondurma (cikolatali)', kcal: 216, prot: 3.8, karb: 28.2, yag: 11.0, lif: 0.7, unhealthy: true },
      { name: 'Kek (cikolatali)', kcal: 371, prot: 5.2, karb: 57.4, yag: 14.0, lif: 2.5, unhealthy: true },
      { name: 'Kurabiye (sade)', kcal: 453, prot: 5.7, karb: 64.2, yag: 20.9, lif: 1.5, unhealthy: true },
      { name: 'Baklava (1 dilim ~50g)', kcal: 330, prot: 4.0, karb: 40.0, yag: 17.5, lif: 1.3, unhealthy: true },
      { name: 'Kadayif (cevizli, 1 porsiyon)', kcal: 298, prot: 4.2, karb: 45.0, yag: 11.5, lif: 1.1, unhealthy: true },
      { name: 'Seker (toz, beyaz)', kcal: 387, prot: 0, karb: 100, yag: 0, lif: 0, unhealthy: true },
      { name: 'Bal (dogal)', kcal: 304, prot: 0.3, karb: 82.4, yag: 0, lif: 0.2 },
      { name: 'Nutella (2 kasik ~30g)', kcal: 200, prot: 2.4, karb: 22.8, yag: 11.6, lif: 1.0, unhealthy: true },
      { name: 'Recep (cilek)', kcal: 278, prot: 0.5, karb: 69.0, yag: 0.1, lif: 1.1, unhealthy: true },
      { name: 'Petibor biskuvisi (3 adet)', kcal: 432, prot: 8.4, karb: 71.2, yag: 13.2, lif: 1.8, unhealthy: true },

      // ── ICECEKLER ──
      { name: 'Kola (1 kutu 330ml)', kcal: 139, prot: 0, karb: 35.0, yag: 0, lif: 0, unhealthy: true },
      { name: 'Diyet kola (1 kutu 330ml)', kcal: 1, prot: 0.1, karb: 0.1, yag: 0, lif: 0 },
      { name: 'Portakal suyu (taze sikma)', kcal: 45, prot: 0.7, karb: 10.4, yag: 0.2, lif: 0.2 },
      { name: 'Elma suyu (%100 dogal)', kcal: 46, prot: 0.1, karb: 11.4, yag: 0.1, lif: 0.2 },
      { name: 'Kahve (filtre, sade)', kcal: 2, prot: 0.3, karb: 0, yag: 0, lif: 0 },
      { name: 'Kahve (latte, %2 sut, ort boy)', kcal: 96, prot: 5.8, karb: 11.0, yag: 3.5, lif: 0 },
      { name: 'Cay (sade, bir bardak)', kcal: 2, prot: 0, karb: 0.4, yag: 0, lif: 0 },
      { name: 'Bitki cayi (papatya, sade)', kcal: 1, prot: 0, karb: 0.2, yag: 0, lif: 0 },
      { name: 'Enerji icecegi (1 kutu 250ml)', kcal: 112, prot: 1.0, karb: 27.0, yag: 0, lif: 0, unhealthy: true },
      { name: 'Meyve suyu (hazir, tatli)', kcal: 113, prot: 0.5, karb: 27.0, yag: 0.3, lif: 0.5, unhealthy: true },
      { name: 'Smoothie (muzlu-sutlu)', kcal: 120, prot: 4.5, karb: 22.0, yag: 2.0, lif: 1.5 },

      // ── TURK MUTFAGI & HAZIR YEMEKLER ──
      { name: 'Corba (kirmizi mercimek)', kcal: 70, prot: 4.5, karb: 11.0, yag: 1.2, lif: 3.0 },
      { name: 'Corba (domates)', kcal: 55, prot: 1.7, karb: 8.3, yag: 1.5, lif: 1.2 },
      { name: 'Ezogelin corbasi', kcal: 78, prot: 4.8, karb: 12.5, yag: 1.5, lif: 3.8 },
      { name: 'Tavuk corbasi (ev yapimi)', kcal: 62, prot: 4.5, karb: 5.8, yag: 2.1, lif: 0.4 },
      { name: 'Zeytinyagli fasulye', kcal: 110, prot: 5.0, karb: 14.0, yag: 4.0, lif: 5.5 },
      { name: 'Zeytinyagli enginar', kcal: 88, prot: 2.5, karb: 11.5, yag: 3.5, lif: 5.0 },
      { name: 'Imam bayildi', kcal: 135, prot: 1.8, karb: 12.0, yag: 9.0, lif: 3.5 },
      { name: 'Dolma (yaprak, zeytinyagli)', kcal: 130, prot: 2.0, karb: 18.0, yag: 5.5, lif: 2.0 },
      { name: 'Dolma (biber, etli)', kcal: 155, prot: 8.5, karb: 15.0, yag: 6.5, lif: 1.8 },
      { name: 'Sarma (yaprak, zeytinyagli)', kcal: 141, prot: 2.2, karb: 18.5, yag: 6.5, lif: 2.5 },
      { name: 'Firinda tavuk but (sezonlu)', kcal: 189, prot: 28.5, karb: 2.0, yag: 7.5, lif: 0.3 },
      { name: 'Peynirli borek (1 dilim)', kcal: 260, prot: 10.0, karb: 28.0, yag: 12.0, lif: 1.0, unhealthy: true },
      { name: 'Ispanakli borek (1 dilim)', kcal: 230, prot: 8.5, karb: 26.5, yag: 10.5, lif: 2.0, unhealthy: true },
      { name: 'Sigara boregi (3 adet)', kcal: 310, prot: 9.5, karb: 32.0, yag: 16.0, lif: 1.5, unhealthy: true },
      { name: 'Musakka (1 porsiyon)', kcal: 210, prot: 11.0, karb: 14.5, yag: 12.0, lif: 3.0 },
      { name: 'Graten (patates, kremali)', kcal: 175, prot: 5.5, karb: 18.0, yag: 9.0, lif: 1.5, unhealthy: true },

      // ── SALATA & MEZELER ──
      { name: 'Cacik (yogurtlu salatalik)', kcal: 47, prot: 3.0, karb: 3.5, yag: 2.0, lif: 0.5 },
      { name: 'Haydari (sarımsakli yogurt)', kcal: 110, prot: 7.0, karb: 5.0, yag: 7.0, lif: 0.5 },
      { name: 'Hummus (nohut ezmesi)', kcal: 166, prot: 7.9, karb: 14.3, yag: 9.6, lif: 6.0 },
      { name: 'Babaganus (patlicanli)', kcal: 55, prot: 2.0, karb: 8.6, yag: 1.5, lif: 3.4 },
      { name: 'Ton balikli salata (zeytinyagli)', kcal: 120, prot: 14.0, karb: 4.0, yag: 5.5, lif: 2.0 },
      { name: 'Avokado-domates salatasi', kcal: 105, prot: 1.5, karb: 7.0, yag: 8.5, lif: 4.5 },

      // ── PROTEIN & SUPPLEMENT ──
      { name: 'Protein bar (20g protein)', kcal: 220, prot: 20.0, karb: 22.0, yag: 7.0, lif: 5.0 },
      { name: 'Protein tozu (whey, 1 olcek ~30g)', kcal: 120, prot: 24.0, karb: 3.0, yag: 1.5, lif: 1.0 },
      { name: 'Protein tozu (bitki bazli, 1 olcek)', kcal: 110, prot: 22.0, karb: 4.0, yag: 2.0, lif: 3.0 },
      { name: 'Gainer (mass, 1 porsiyon ~90g)', kcal: 380, prot: 30.0, karb: 55.0, yag: 4.0, lif: 2.0 },
    ];
  }

  get foods() {
    return this.#foods;
  }

  search(q, limit = 7) {
    if (!q || q.length < 2) return [];
    return this.#foods.filter(f => f.name.toLowerCase().includes(q.toLowerCase())).slice(0, limit);
  }

  getByIndex(i) {
    return this.#foods[i];
  }

  indexOf(f) {
    return this.#foods.indexOf(f);
  }
}

class NutritionCalculator {
  static calcTDEE(p) {
    if (!p) return null;
    let bmr;
    if (p.gender === 'male') bmr = 10 * p.weight + 6.25 * p.height - 5 * p.age + 5;
    else bmr = 10 * p.weight + 6.25 * p.height - 5 * p.age - 161;
    let tdee = bmr * p.activity;
    if (p.goal === 'lose') tdee -= 400;
    if (p.goal === 'gain') tdee += 300;
    return {
      kcal: Math.round(tdee),
      prot: Math.round(p.weight * 2),
      karb: Math.round((tdee * 0.45) / 4),
      yag: Math.round((tdee * 0.25) / 9)
    };
  }

  static rescaleMacros(entry, oldRatio, newRatio) {
    entry.kcal = (entry.kcal / oldRatio) * newRatio;
    entry.prot = (entry.prot / oldRatio) * newRatio;
    entry.karb = (entry.karb / oldRatio) * newRatio;
    entry.yag = (entry.yag / oldRatio) * newRatio;
    entry.lif = (entry.lif / oldRatio) * newRatio;
  }
}

class UIRenderer {
  showTab(name) {
    ['today', 'add', 'profile'].forEach(t => {
      document.getElementById('tab-' + t).style.display = t === name ? 'block' : 'none';
      document.getElementById('tab-btn-' + t).classList.toggle('active', t === name);
    });
  }

  setRing(pct) {
    const circumference = 2 * Math.PI * 35; // ~220
    const offset = circumference - (Math.min(pct, 100) / 100) * circumference;
    document.getElementById('ringFill').style.strokeDashoffset = offset;
    document.getElementById('ringPct').textContent = Math.min(pct, 999) + '%';
  }

  renderToday(entries, targets) {
    const d = new Date();
    document.getElementById('dateDisplay').textContent =
      d.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' });

    let totalKcal = 0, totalProt = 0, totalKarb = 0, totalYag = 0, totalLif = 0;
    entries.forEach(e => {
      totalKcal += e.kcal;
      totalProt += e.prot;
      totalKarb += e.karb;
      totalYag += e.yag;
      totalLif += e.lif;
    });

    const noP = document.getElementById('no-profile-msg');
    const cBlock = document.getElementById('calori-block');
    const mBlock = document.getElementById('macro-block');

    if (!targets) {
      noP.style.display = 'flex';
      cBlock.style.display = 'none';
      mBlock.style.display = 'none';
    } else {
      noP.style.display = 'none';
      cBlock.style.display = 'flex';
      mBlock.style.display = 'grid';

      document.getElementById('consumed').textContent = Math.round(totalKcal);
      document.getElementById('targetKcal').textContent = targets.kcal;
      document.getElementById('burnedDisp').textContent = 0;

      const rem = targets.kcal - Math.round(totalKcal);
      const remEl = document.getElementById('remaining');
      remEl.textContent = Math.abs(rem) + (rem < 0 ? ' fazla' : '');
      remEl.style.color = rem < 0 ? 'var(--red)' : 'var(--green)';

      const pct = Math.round((totalKcal / targets.kcal) * 100);
      this.setRing(pct);

      document.getElementById('p-cur').textContent = Math.round(totalProt);
      document.getElementById('p-goal').textContent = targets.prot;
      document.getElementById('k-cur').textContent = Math.round(totalKarb);
      document.getElementById('k-goal').textContent = targets.karb;
      document.getElementById('y-cur').textContent = Math.round(totalYag);
      document.getElementById('y-goal').textContent = targets.yag;
      document.getElementById('l-cur').textContent = Math.round(totalLif);
      document.getElementById('p-bar').style.width = Math.min(100, Math.round(totalProt / targets.prot * 100)) + '%';
      document.getElementById('k-bar').style.width = Math.min(100, Math.round(totalKarb / targets.karb * 100)) + '%';
      document.getElementById('y-bar').style.width = Math.min(100, Math.round(totalYag / targets.yag * 100)) + '%';
      document.getElementById('l-bar').style.width = Math.min(100, Math.round(totalLif / 25 * 100)) + '%';
    }

    const list = document.getElementById('todayList');
    if (!entries.length) {
      document.getElementById('motivationBanner').style.display = 'none';
      list.innerHTML = `<div class="empty-state">
        <span class="es-icon"><i class="ti ti-bowl-chopsticks"></i></span>
        <div class="es-title">Henüz besin eklenmedi</div>
        <div class="es-sub">Ekle sekmesinden besin ekleyebilirsin</div>
      </div>`;
      return;
    }

    const byMeal = {};
    entries.forEach((e, i) => {
      if (!byMeal[e.meal]) byMeal[e.meal] = [];
      byMeal[e.meal].push({ ...e, idx: i });
    });
    list.innerHTML = '';

    const mealIcons = { Kahvaltı: '☀️', Öğle: '🍽', Akşam: '🌙', 'Ara öğün': '🍎' };
    ['Kahvaltı', 'Öğle', 'Akşam', 'Ara öğün'].forEach(meal => {
      if (!byMeal[meal]) return;
      const mLabel = document.createElement('div');
      mLabel.className = 'meal-group-label';
      mLabel.textContent = (mealIcons[meal] || '') + ' ' + meal;
      list.appendChild(mLabel);

      byMeal[meal].forEach(e => {
        const div = document.createElement('div');
        div.className = 'food-item' + (e.unhealthy ? ' unhealthy' : '');
        div.id = 'fi-' + e.idx;
        const unhealthyBadge = e.unhealthy
          ? '<span class="badge-unhealthy">⚠ Diyete uygun değil</span>'
          : '';
        div.innerHTML = `
          <div style="flex:1;min-width:0">
            <div class="fi-name">${e.name} <span class="fi-amount" id="fi-amt-${e.idx}">${e.amount}g</span>${unhealthyBadge}</div>
            <div class="fi-macros" id="fi-mac-${e.idx}">P: ${Math.round(e.prot)}g &nbsp;·&nbsp; K: ${Math.round(e.karb)}g &nbsp;·&nbsp; Y: ${Math.round(e.yag)}g</div>
            <div class="fi-edit-row" id="fi-erow-${e.idx}" style="display:none">
              <input class="fi-edit-input" id="fi-einp-${e.idx}" type="number" min="1" max="5000" value="${e.amount}" placeholder="gram">
              <button class="fi-save-btn" onclick="saveEdit(${e.idx})">Kaydet</button>
              <button class="fi-cancel-btn" onclick="cancelEdit(${e.idx})">İptal</button>
            </div>
          </div>
          <div class="fi-right">
            <div style="text-align:right">
              <div class="fi-kcal" id="fi-kcal-${e.idx}">${Math.round(e.kcal)}</div>
              <div class="fi-kcal-unit">kcal</div>
            </div>
            <button class="edit-btn" id="fi-ebtn-${e.idx}" onclick="editFood(${e.idx})" aria-label="Düzenle">
              <i class="ti ti-pencil" aria-hidden="true"></i>
            </button>
            <button class="del" onclick="delFood(${e.idx})" aria-label="Sil">
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
    const icon = document.getElementById('motivationIcon');
    const title = document.getElementById('motivationTitle');
    const msg = document.getElementById('motivationMsg');

    const hasUnhealthy = entries.some(e => e.unhealthy);
    const totalKcal = entries.reduce((s, e) => s + e.kcal, 0);
    const isOverCalorie = targets && Math.round(totalKcal) > targets.kcal;

    if (!hasUnhealthy && !isOverCalorie) {
      banner.style.display = 'none';
      return;
    }

    const overMsgs = [
      'Bugün limitini aştın. Yarın yeni bir başlangıç — her gün bir şans!',
      'Kalori hedefini geçtin. Biraz yürüyüş dengeyi geri getirebilir. 💪',
      'Fazla kalori aldın, ama bu seni yıkamaz. Yarın daha güçlü devam!',
      'Bugün biraz kaçtı. Önemli olan uzun oyun — hâlâ yoldasın!',
      'Limitin üzerinde bir gün. Yarın aynı hatayı tekrarlama, yapabilirsin!'
    ];
    const unhealthyMsgs = [
      'Diyete uygun olmayan bir besin yedin. Bir dahaki öğünde dengelemeyi dene!',
      'Bazen canımız istiyor — ama yediklerin takipte. Geri kalan öğünleri sağlıklı tut!',
      'Bu besin seni hedefe götürmez. Ama vazgeçme — bir adım geri, iki adım ileri!',
      'Diyetten sapma? Normal! Önemli olan pişmanlık değil, bir sonraki doğru seçim.',
      'Zaman zaman yasak besinler yiyebiliriz. Onu dengele ve yoluna devam et! 🎯'
    ];
    const bothMsgs = [
      'Hem kalori aştın hem de uygun olmayan besin yedin. Bugün geride bırak, yarın daha iyi!',
      'Zor bir gündü. Ama her gün sıfırlama şansın var — yarın için kendin ol!',
      'Bugün plan dışına çıktın. Suçlama kendini; sadece bir sonraki öğüne odaklan!'
    ];

    const pick = arr => arr[Math.floor(Math.random() * arr.length)];
    let cls, iconTxt, titleTxt, msgTxt;

    if (isOverCalorie && hasUnhealthy) {
      cls = 'warn';
      iconTxt = '🔥';
      titleTxt = 'Dikkat: Kalori fazlası + uygunsuz besin!';
      msgTxt = pick(bothMsgs);
    } else if (isOverCalorie) {
      cls = 'warn';
      iconTxt = '🔥';
      titleTxt = 'Günlük kalori limitini aştın!';
      msgTxt = pick(overMsgs);
    } else {
      cls = 'caution';
      iconTxt = '⚠️';
      titleTxt = 'Diyete uygun olmayan besin tüketildi';
      msgTxt = pick(unhealthyMsgs);
    }

    banner.className = 'motivation-banner ' + cls;
    banner.style.display = 'block';
    icon.textContent = iconTxt;
    title.textContent = titleTxt;
    msg.textContent = msgTxt;
  }

  showAddMsg(msg, isErr) {
    const el = document.getElementById('addMsg');
    el.textContent = msg;
    el.style.display = 'block';
    el.style.color = isErr ? 'var(--red)' : 'var(--green)';
    el.style.background = isErr ? 'rgba(248,113,113,0.08)' : 'rgba(52,211,153,0.08)';
    el.style.borderColor = isErr ? 'rgba(248,113,113,0.2)' : 'rgba(52,211,153,0.2)';
    setTimeout(() => el.style.display = 'none', 2500);
  }
}

class ProfileManager {
  #stateManager;
  #currentGoal;

  constructor(stateManager) {
    this.#stateManager = stateManager;
    this.#currentGoal = this.#stateManager.goal;
  }

  get currentGoal() {
    return this.#currentGoal;
  }

  selectGoal(g) {
    this.#currentGoal = g;
    ['lose', 'maintain', 'gain'].forEach(x =>
      document.getElementById('goal-' + x).classList.toggle('selected', x === g)
    );
  }

  loadIntoForm() {
    const profile = this.#stateManager.profile;
    if (profile) {
      document.getElementById('height').value = profile.height || '';
      document.getElementById('weight').value = profile.weight || '';
      document.getElementById('age').value = profile.age || '';
      document.getElementById('gender').value = profile.gender || 'male';
      document.getElementById('activity').value = profile.activity || '1.55';
      this.selectGoal(profile.goal || 'maintain');
    }
  }

  readFromForm() {
    const h = parseFloat(document.getElementById('height').value);
    const w = parseFloat(document.getElementById('weight').value);
    const a = parseFloat(document.getElementById('age').value);
    const g = document.getElementById('gender').value;
    const act = parseFloat(document.getElementById('activity').value);

    if (!h || !w || !a) {
      return null;
    }

    return {
      height: h,
      weight: w,
      age: a,
      gender: g,
      activity: act,
      goal: this.#currentGoal
    };
  }

  showResult(targets, isError = false, errorMsg = '') {
    const res = document.getElementById('profileResult');
    res.style.display = 'block';
    if (isError) {
      res.style.background = 'rgba(248,113,113,0.07)';
      res.style.borderColor = 'rgba(248,113,113,0.2)';
      res.textContent = errorMsg;
    } else {
      res.style.background = 'rgba(52,211,153,0.07)';
      res.style.borderColor = 'rgba(52,211,153,0.2)';
      res.innerHTML = `<i class="ti ti-check" style="color:var(--green)"></i>&nbsp; Kaydedildi! Günlük hedefin:<br>
        <b>${targets.kcal} kcal</b> &nbsp;·&nbsp; Protein: <b>${targets.prot}g</b> &nbsp;·&nbsp; Karb: <b>${targets.karb}g</b> &nbsp;·&nbsp; Yağ: <b>${targets.yag}g</b>`;
    }
  }
}

class App {
  static #instance = null;
  #stateManager;
  #foodDatabase;
  #ui;
  #profileManager;
  #selectedFood = null;

  constructor() {
    if (App.#instance) {
      return App.#instance;
    }
    this.#stateManager = new StateManager('nutrition_app_v2');
    this.#foodDatabase = new FoodDatabase();
    this.#ui = new UIRenderer();
    this.#profileManager = new ProfileManager(this.#stateManager);
    App.#instance = this;
  }

  static get instance() {
    if (!App.#instance) {
      App.#instance = new App();
    }
    return App.#instance;
  }

  init() {
    this.#stateManager.checkDayReset();
    this.renderToday();

    // Add global click listener to close search results when clicking outside
    document.addEventListener('click', e => {
      const sr = document.getElementById('searchResults');
      if (sr && !sr.contains(e.target) && e.target.id !== 'foodSearch') {
        sr.style.display = 'none';
      }
    });
  }

  showTab(name) {
    this.#ui.showTab(name);
    if (name === 'today') this.renderToday();
    if (name === 'profile') this.#profileManager.loadIntoForm();
  }

  renderToday() {
    this.#stateManager.checkDayReset();
    const today = this.#stateManager.todayKey();
    const entries = this.#stateManager.logs[today] || [];
    const targets = NutritionCalculator.calcTDEE(this.#stateManager.profile);
    this.#ui.renderToday(entries, targets);
  }

  delFood(idx) {
    const today = this.#stateManager.todayKey();
    this.#stateManager.logs[today].splice(idx, 1);
    this.#stateManager.save();
    this.renderToday();
  }

  editFood(idx) {
    document.getElementById('fi-erow-' + idx).style.display = 'flex';
    document.getElementById('fi-mac-' + idx).style.display = 'none';
    const ebtn = document.getElementById('fi-ebtn-' + idx);
    if (ebtn) ebtn.style.display = 'none';
    const inp = document.getElementById('fi-einp-' + idx);
    if (inp) {
      inp.focus();
      inp.select();
    }
  }

  cancelEdit(idx) {
    document.getElementById('fi-erow-' + idx).style.display = 'none';
    document.getElementById('fi-mac-' + idx).style.display = '';
    const ebtn = document.getElementById('fi-ebtn-' + idx);
    if (ebtn) ebtn.style.display = '';
  }

  saveEdit(idx) {
    const inp = document.getElementById('fi-einp-' + idx);
    const newAmount = parseFloat(inp.value);
    if (!newAmount || newAmount <= 0) {
      inp.focus();
      return;
    }

    const today = this.#stateManager.todayKey();
    const entry = this.#stateManager.logs[today][idx];
    if (!entry) return;

    const oldRatio = entry.amount / 100;
    const newRatio = newAmount / 100;

    NutritionCalculator.rescaleMacros(entry, oldRatio, newRatio);
    entry.amount = newAmount;

    this.#stateManager.save();
    this.renderToday();
  }

  searchFood(q) {
    const box = document.getElementById('searchResults');
    const results = this.#foodDatabase.search(q);
    if (!results.length) {
      box.style.display = 'none';
      return;
    }
    box.style.display = 'block';
    box.innerHTML = results.map(f => {
      const idx = this.#foodDatabase.indexOf(f);
      return `
        <div class="search-item${f.unhealthy ? ' unhealthy' : ''}" onclick="selectSearchFood(${idx})">
          <div class="s-name">${f.name}${f.unhealthy ? '<span class="s-unhealthy-tag">⚠ Dikkat</span>' : ''}</div>
          <div class="s-macro">${f.kcal} kcal/100g &nbsp;·&nbsp; P:${f.prot}g &nbsp;K:${f.karb}g &nbsp;Y:${f.yag}g</div>
        </div>`;
    }).join('');
  }

  selectSearchFood(idx) {
    this.#selectedFood = this.#foodDatabase.getByIndex(idx);
    document.getElementById('foodSearch').value = this.#selectedFood.name;
    document.getElementById('searchResults').style.display = 'none';
    document.getElementById('customName').value = this.#selectedFood.name;
    document.getElementById('customKcal').value = this.#selectedFood.kcal;
    document.getElementById('customProt').value = this.#selectedFood.prot;
    document.getElementById('customKarb').value = this.#selectedFood.karb;
    document.getElementById('customYag').value = this.#selectedFood.yag;
    document.getElementById('customLif').value = this.#selectedFood.lif;
  }

  addFood() {
    const name = document.getElementById('customName').value.trim();
    const amount = parseFloat(document.getElementById('foodAmount').value) || 100;
    const kcal100 = parseFloat(document.getElementById('customKcal').value) || 0;
    const prot100 = parseFloat(document.getElementById('customProt').value) || 0;
    const karb100 = parseFloat(document.getElementById('customKarb').value) || 0;
    const yag100 = parseFloat(document.getElementById('customYag').value) || 0;
    const lif100 = parseFloat(document.getElementById('customLif').value) || 0;
    const meal = document.getElementById('mealType').value;

    if (!name) {
      this.#ui.showAddMsg('⚠ Besin adı giriniz!', true);
      return;
    }

    const ratio = amount / 100;
    const today = this.#stateManager.todayKey();
    this.#stateManager.checkDayReset();

    const isUnhealthy = this.#selectedFood ? (this.#selectedFood.unhealthy === true) : false;
    this.#stateManager.logs[today].push({
      name,
      amount,
      meal,
      unhealthy: isUnhealthy,
      kcal: kcal100 * ratio,
      prot: prot100 * ratio,
      karb: karb100 * ratio,
      yag: yag100 * ratio,
      lif: lif100 * ratio
    });

    this.#stateManager.save();
    this.#ui.showAddMsg('✓ ' + name + ' başarıyla eklendi!', false);

    ['customName', 'foodSearch', 'customKcal', 'customProt', 'customKarb', 'customYag', 'customLif'].forEach(id =>
      document.getElementById(id).value = ''
    );
    document.getElementById('foodAmount').value = '100';
    this.#selectedFood = null;
  }

  selectGoal(g) {
    this.#profileManager.selectGoal(g);
  }

  saveProfile() {
    const profile = this.#profileManager.readFromForm();
    if (!profile) {
      this.#profileManager.showResult(null, true, 'Lütfen tüm alanları doldur.');
      return;
    }

    this.#stateManager.profile = profile;
    this.#stateManager.goal = profile.goal;

    const targets = NutritionCalculator.calcTDEE(profile);
    this.#profileManager.showResult(targets);
  }
}

const app = App.instance;
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});

// Global bridge functions for HTML onclick events
function showTab(name) { app.showTab(name); }
function delFood(idx) { app.delFood(idx); }
function editFood(idx) { app.editFood(idx); }
function cancelEdit(idx) { app.cancelEdit(idx); }
function saveEdit(idx) { app.saveEdit(idx); }
function searchFood(q) { app.searchFood(q); }
function selectSearchFood(idx) { app.selectSearchFood(idx); }
function addFood() { app.addFood(); }
function selectGoal(g) { app.selectGoal(g); }
function saveProfile() { app.saveProfile(); }
