import { create } from 'zustand';
import { db } from './firebaseConfig';
import { doc, setDoc, getDoc, increment, serverTimestamp } from 'firebase/firestore';
 
const todayStr = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD, günlük skor bunun üzerinden ayrışıyor
 
// Takvim haftası (Pazar başlangıçlı) — örn "2026-W27". Yeni hafta gelince otomatik yeni doküman açılır, reset gerekmez.
const weekStr = (d = new Date()) => {
  const onejan = new Date(d.getFullYear(), 0, 1);
  const weekNum = Math.ceil((((d - onejan) / 86400000) + onejan.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
};
 
// Ay — örn "2026-07"
const monthStr = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
 
// Her oyunun mantıken ulaşabileceği en yüksek tek seferlik puanın biraz üzerinde bir "makul üst sınır".
// Bunun üzerindeki addScore çağrıları (devtools'tan elle tetiklenen sahte puanlar gibi) sessizce reddedilir.
// Not: Bu sofistike bir hileyi durdurmaz (gerçek koruma sunucu tarafı doğrulama ister), ama kaba/bariz
// hileleri (örn. konsoldan addScore(999999) çağırmak) anında engeller.
const MAX_POINTS_PER_EVENT = {
  bingo: 300,
  code: 600,
  career: 250,
  draft: 250,
  find: 600,     // yüksek combo ihtimaline karşı geniş tutuldu
  missing: 150,
  grid: 100,
  trivia: 150,
  match: 50,
  manager: 1200,
  threes: 5200,  // GOAT (final boss) bonusu dahil en yüksek meşru tek seferlik puan
  jersey: 300,
  hoopgrid: 1200, // 9 hücrenin tamamı en nadir cevaplarla doldurulursa bile ~1030 civarı, pay bırakıldı
  box2box: 1000,  // 9 kutu x 100 puan = 900, pay bırakıldı
  statline: 960,  // 8 round x 120 (max combo bonus) = 960
  whoami: 840,    // 7 round x 120 (max clue+combo bonus) = 840
  sneaker: 60,    // tek seferlik tasarım ödülü (50), pay bırakıldı
  higherlower: 800, // uzun bir zincirde streak arttıkça puan katlanır, pay bırakıldı
  silhouette: 700,  // 6 round x en yüksek olası puan (~110) civarı, pay bırakıldı
  emojiplayer: 600  // 6 round x en yüksek olası puan (~120) civarı, pay bırakıldı
};
const DEFAULT_MAX_POINTS = 500; // gameId'siz (örn. görev ödülü) veya listede olmayan olaylar için
 
// Her oyuncunun uid'sinden deterministik, 4 haneli bir #etiket üretir (örn. "3384").
// Aynı uid her zaman aynı etiketi üretir — ekstra bir "benzersizlik" kontrolüne gerek yok,
// ve isim çakışmalarında (iki kişi "Ice" seçerse) birbirinden ayırt etmeyi sağlar.
export const generateTag = (uid) => {
  if (!uid) return "0000";
  let hash = 0;
  for (let i = 0; i < uid.length; i++) {
    hash = (hash * 31 + uid.charCodeAt(i)) >>> 0;
  }
  return String(hash % 10000).padStart(4, '0');
};
 
export const useGameStore = create((set, get) => ({
  uid: null, // Firebase anonim kimlik doğrulamadan gelen benzersiz ID
  username: "",
  usernameHydrated: false, // localStorage kontrolü tamamlandı mı (onboarding ekranını flash'lamamak için)
  totalScore: 0,
  rank: "Rookie",
  bestScores: {}, // örn: { missing: 80, trivia: 120, manager: 340 }
  character: null, // { name, nickname, team, skills: {accuracy,range,speed,consistency,clutch}, level }
  streak: 0,
  longestStreak: 0,
 
  setUid: (uid) => set({ uid }),
 
  // Uygulama açılışında localStorage'dan kayıtlı kullanıcı adını okur.
  hydrateUsername: () => {
    try {
      const saved = localStorage.getItem('fc_username');
      set({ username: saved || "", usernameHydrated: true });
    } catch (e) {
      set({ usernameHydrated: true });
    }
  },
 
  // Kullanıcı adını hem local'de hem Firestore'daki profil dokümanında kalıcı yapar.
  setUsername: (name) => {
    const trimmed = (name || "").trim();
    set({ username: trimmed });
    try { localStorage.setItem('fc_username', trimmed); } catch (e) {}
 
    const { uid } = get();
    if (uid && trimmed) {
      setDoc(doc(db, "players", uid), {
        username: trimmed,
        usernameLower: trimmed.toLowerCase(), // arkadaş aramasında büyük/küçük harf duyarsız eşleşme için
        tag: generateTag(uid),
        updatedAt: serverTimestamp()
      }, { merge: true }).catch((e) => console.warn("Firebase sync (username) failed:", e));
    }
  },
 
  createCharacter: (name, nickname, team, skills) => set({
    character: { name, nickname, team, skills, level: 0 }
  }),
 
  advanceCharacterLevel: () => set((state) => ({
    character: state.character ? { ...state.character, level: state.character.level + 1 } : null
  })),
 
  addSkillPoint: (skillKey) => set((state) => {
    if (!state.character) return {};
    return {
      character: {
        ...state.character,
        skills: { ...state.character.skills, [skillKey]: (state.character.skills[skillKey] || 0) + 1 }
      }
    };
  }),
 
  resetCharacter: () => set({ character: null }),
 
  // Uygulama açılışında (uid hazır olduğunda) bir kez çağrılır.
  // Bugün ilk giriş mi, dün de giriş yapılmış mı, yoksa seri bozulmuş mu kontrol edip günceller.
  checkAndUpdateStreak: async () => {
    const { uid } = get();
    if (!uid) return;
    const today = todayStr();
    try {
      const ref = doc(db, "players", uid);
      const snap = await getDoc(ref);
      const data = snap.exists() ? snap.data() : {};
 
      if (data.lastLoginDate === today) {
        // Bugün zaten sayılmış, sadece local state'i eşitle
        set({ streak: data.streak || 1, longestStreak: data.longestStreak || data.streak || 1 });
        return;
      }
 
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const newStreak = data.lastLoginDate === yesterday ? (data.streak || 0) + 1 : 1;
      const newLongest = Math.max(newStreak, data.longestStreak || 0);
 
      await setDoc(ref, {
        lastLoginDate: today,
        streak: newStreak,
        longestStreak: newLongest,
        updatedAt: serverTimestamp()
      }, { merge: true });
 
      set({ streak: newStreak, longestStreak: newLongest });
    } catch (e) {
      console.warn("Streak check failed:", e);
    }
  },
 
  // gameId opsiyonel: belirtilirse o oyunun en iyi skoru da güncellenir + global leaderboard'a senkronize edilir
  addScore: (points, gameId) => {
    // --- BASİT SINIR KONTROLÜ (anti-cheat) ---
    const cap = gameId ? (MAX_POINTS_PER_EVENT[gameId] ?? DEFAULT_MAX_POINTS) : DEFAULT_MAX_POINTS;
    if (typeof points !== 'number' || !isFinite(points) || points <= 0 || points > cap) {
      console.warn(`addScore reddedildi — şüpheli değer: gameId=${gameId}, points=${points} (izin verilen üst sınır: ${cap})`);
      return;
    }
 
    set((state) => {
      const newScore = state.totalScore + points;
 
      let newRank = "Rookie";
      if (newScore > 500) newRank = "Pro";
      if (newScore > 1500) newRank = "All-Star";
      if (newScore > 3000) newRank = "Legend";
 
      const newBestScores = { ...state.bestScores };
      if (gameId && (!newBestScores[gameId] || points > newBestScores[gameId])) {
        newBestScores[gameId] = points;
      }
 
      return { totalScore: newScore, rank: newRank, bestScores: newBestScores };
    });
 
    // --- FIREBASE SENKRONİZASYONU (arka planda, sonucu beklemeden) ---
    const { uid, username, bestScores } = get();
    if (!uid) return; // auth henüz hazır değilse senkronize etme
    const safeUsername = username?.trim() || "Anonymous";
    const today = todayStr();
    const week = weekStr();
    const month = monthStr();
 
    // 1) Toplam skor — players koleksiyonu (all-time leaderboard)
    setDoc(doc(db, "players", uid), {
      username: safeUsername,
      usernameLower: safeUsername.toLowerCase(),
      tag: generateTag(uid),
      totalScore: increment(points),
      updatedAt: serverTimestamp()
    }, { merge: true }).catch((e) => console.warn("Firebase sync (players) failed:", e));
 
    // 2) Günlük skor — dailyScores koleksiyonu (doc id: uid_tarih, otomatik günlük reset)
    const dailyUpdate = {
      uid,
      username: safeUsername,
      date: today,
      dailyTotal: increment(points),
      updatedAt: serverTimestamp()
    };
    if (gameId) {
      dailyUpdate[`gameBreakdown.${gameId}`] = increment(points); // günlük görevler bunu okuyor
    }
    setDoc(doc(db, "dailyScores", `${uid}_${today}`), dailyUpdate, { merge: true })
      .catch((e) => console.warn("Firebase sync (daily) failed:", e));
 
    // 3) Haftalık skor — weeklyScores koleksiyonu (doc id: uid_hafta, otomatik haftalık reset)
    setDoc(doc(db, "weeklyScores", `${uid}_${week}`), {
      uid,
      username: safeUsername,
      week,
      weeklyTotal: increment(points),
      updatedAt: serverTimestamp()
    }, { merge: true }).catch((e) => console.warn("Firebase sync (weekly) failed:", e));
 
    // 4) Aylık skor — monthlyScores koleksiyonu (doc id: uid_ay, otomatik aylık reset)
    setDoc(doc(db, "monthlyScores", `${uid}_${month}`), {
      uid,
      username: safeUsername,
      month,
      monthlyTotal: increment(points),
      updatedAt: serverTimestamp()
    }, { merge: true }).catch((e) => console.warn("Firebase sync (monthly) failed:", e));
 
    // 5) Oyun bazlı en iyi skor — gameScores koleksiyonu (doc id: gameId_uid)
    if (gameId) {
      const updatedBest = bestScores[gameId] || points;
      setDoc(doc(db, "gameScores", `${gameId}_${uid}`), {
        uid,
        gameId,
        username: safeUsername,
        bestScore: updatedBest,
        updatedAt: serverTimestamp()
      }, { merge: true }).catch((e) => console.warn("Firebase sync (game) failed:", e));
    }
  },
}));
 