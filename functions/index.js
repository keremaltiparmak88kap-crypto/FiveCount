const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
 
initializeApp();
const db = getFirestore();
 
// Firebase Console'da "BALLDONTLIE_API_KEY" adıyla secret olarak tanımlanacak (aşağıdaki
// kurulum adımlarına bak). Kodun içine asla API key yazma.
const BALLDONTLIE_API_KEY = defineSecret("BALLDONTLIE_API_KEY");
 
const todayStr = () => new Date().toISOString().slice(0, 10);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
 
// BALLDONTLIE'nin pozisyon kodunu bizim Bingo kategori sistemimize çeviriyor.
const mapPositionToTrait = (position) => {
  if (!position) return null;
  if (position.includes("C")) return "Center";
  if (position.includes("G")) return "Point Guard";
  return null;
};
 
// BALLDONTLIE'den ham oyuncu listesini çekip bizim Bingo formatımıza çeviren ortak fonksiyon.
const fetchAndStorePlayers = async (apiKey) => {
  const response = await fetch("https://api.balldontlie.io/nba/v1/players?per_page=100", {
    headers: { Authorization: apiKey },
  });
 
  if (!response.ok) {
    throw new Error(`BALLDONTLIE isteği başarısız: ${response.status} ${response.statusText}`);
  }
 
  const json = await response.json();
  const rawPlayers = json.data || [];
 
  const players = rawPlayers
    .filter((p) => p.first_name && p.last_name)
    .map((p) => {
      const traits = [];
      const trait = mapPositionToTrait(p.position);
      if (trait) traits.push(trait);
      if (p.draft_number === 1) traits.push("Drafted 1st");
 
      return {
        id: `api-${p.id}`,
        name: `${p.first_name} ${p.last_name}`,
        team: p.team?.abbreviation || null,
        category: null,          // MVP/Champion gibi ödül verisi API'de yok, bilerek boş
        nationality: p.country || null,
        traits,
        pastTeams: [],
        mentor: null,             // gerçek bir "mentor" verisi hiçbir API'de yok
        ovr: null,
      };
    });
 
  const today = todayStr();
  await db.collection("dailyApiPlayers").doc(today).set({
    date: today,
    players,
    fetchedAt: new Date().toISOString(),
  });
 
  return players.length;
};
 
// ---------- TEAM GRID İÇİN: 30 TAKIMIN TAMAMININ KADROSU ----------
 
const POSITION_LABELS = { G: "Guard", F: "Forward", C: "Center" };
 
const formatPosition = (position) => {
  if (!position) return "Player";
  const primary = position.split("-")[0];
  return POSITION_LABELS[primary] || "Player";
};
 
// BALLDONTLIE sayfalama (cursor) kullanıyor — dakikada 5 istek limitine takılmamak için
// sayfalar arasında bekliyoruz. ~500 aktif oyuncuyu kapsamak için birkaç sayfa yeterli.
const fetchAllActivePlayers = async (apiKey, maxPages = 6) => {
  let all = [];
  let cursor = null;
 
  for (let i = 0; i < maxPages; i++) {
    const url = new URL("https://api.balldontlie.io/nba/v1/players");
    url.searchParams.set("per_page", "100");
    if (cursor) url.searchParams.set("cursor", cursor);
 
    const res = await fetch(url.toString(), { headers: { Authorization: apiKey } });
    if (!res.ok) throw new Error(`BALLDONTLIE isteği başarısız (sayfa ${i + 1}): ${res.status}`);
 
    const json = await res.json();
    all = all.concat(json.data || []);
 
    cursor = json.meta?.next_cursor;
    if (!cursor) break;
    if (i < maxPages - 1) await sleep(13000); // dakikada 5 istek limitine uymak için bekle
  }
 
  return all;
};
 
const fetchAndStoreTeamRosters = async (apiKey) => {
  const rawPlayers = await fetchAllActivePlayers(apiKey);
 
  const teams = {};
  rawPlayers
    .filter((p) => p.first_name && p.last_name && p.team?.abbreviation)
    .forEach((p) => {
      const abbr = p.team.abbreviation;
      if (!teams[abbr]) teams[abbr] = [];
      const posLabel = formatPosition(p.position).toUpperCase();
      const jersey = p.jersey_number ? `#${p.jersey_number}` : `#${String(p.id).slice(-2)}`;
      teams[abbr].push({
        name: `${p.first_name} ${p.last_name}`,
        trait: `${posLabel} ${jersey}`, // pozisyon + forma no -> takım içinde her zaman benzersiz
      });
    });
 
  const today = todayStr();
  await db.collection("dailyTeamRosters").doc(today).set({
    date: today,
    teams,
    fetchedAt: new Date().toISOString(),
  });
 
  return Object.keys(teams).length;
};
 
// Her gün UTC gece yarısı otomatik çalışır.
exports.fetchDailyBingoPlayers = onSchedule(
  {
    schedule: "0 0 * * *",
    timeZone: "UTC",
    secrets: [BALLDONTLIE_API_KEY],
  },
  async () => {
    try {
      const count = await fetchAndStorePlayers(BALLDONTLIE_API_KEY.value());
      console.log(`${todayStr()} için ${count} oyuncu kaydedildi.`);
    } catch (e) {
      console.error("Günlük oyuncu çekme başarısız:", e);
    }
  }
);
 
// Her gün UTC 00:10'da çalışır (Bingo'nun hemen ardından, API'ye aynı anda yüklenmesin diye).
exports.fetchDailyTeamRosters = onSchedule(
  {
    schedule: "10 0 * * *",
    timeZone: "UTC",
    secrets: [BALLDONTLIE_API_KEY],
    timeoutSeconds: 300,
  },
  async () => {
    try {
      const count = await fetchAndStoreTeamRosters(BALLDONTLIE_API_KEY.value());
      console.log(`${todayStr()} için ${count} takımın kadrosu kaydedildi.`);
    } catch (e) {
      console.error("Günlük kadro çekme başarısız:", e);
    }
  }
);
 
// Test/manuel tetikleme için: deploy sonrası ilk veriyi hemen çekmek üzere tarayıcıdan
// bir kere bu URL'yi ziyaret edebilirsin. (Kurulum adımlarında linki bulacaksın.)
exports.manualFetchBingoPlayers = onRequest(
  { secrets: [BALLDONTLIE_API_KEY] },
  async (req, res) => {
    try {
      const count = await fetchAndStorePlayers(BALLDONTLIE_API_KEY.value());
      res.status(200).send(`OK — ${count} oyuncu kaydedildi (${todayStr()}).`);
    } catch (e) {
      res.status(500).send(`Hata: ${e.message}`);
    }
  }
);
 
exports.manualFetchTeamRosters = onRequest(
  { secrets: [BALLDONTLIE_API_KEY], timeoutSeconds: 300 },
  async (req, res) => {
    try {
      const count = await fetchAndStoreTeamRosters(BALLDONTLIE_API_KEY.value());
      res.status(200).send(`OK — ${count} takımın kadrosu kaydedildi (${todayStr()}).`);
    } catch (e) {
      res.status(500).send(`Hata: ${e.message}`);
    }
  }
);
 