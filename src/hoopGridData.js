import { PLAYERS } from './playerManager';
 
// Kriter havuzunu playerManager.js'teki gerçek veriden OTOMATIK türetiyoruz.
// Elle bir liste tutmuyoruz — oyuncu veritabanı büyüdükçe kriter çeşitliliği de büyür.
const buildCriteriaPool = () => {
  const teamCounts = {};
  const categoryCounts = {};
  const traitCounts = {};
  const nationalityCounts = {};
 
  PLAYERS.forEach((p) => {
    const teams = new Set([p.team, ...(p.pastTeams || [])].filter(Boolean));
    teams.forEach((t) => {
      if (t.length <= 3) { // NBA takım kodları 3 harfli; "Real Madrid" gibi kulüpleri eler
        teamCounts[t] = (teamCounts[t] || 0) + 1;
      }
    });
    if (p.category) categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    (p.traits || []).forEach((t) => { traitCounts[t] = (traitCounts[t] || 0) + 1; });
    if (p.nationality) nationalityCounts[p.nationality] = (nationalityCounts[p.nationality] || 0) + 1;
  });
 
  const pool = [];
  Object.entries(teamCounts).forEach(([team, count]) => {
    if (count >= 2) pool.push({ id: `team-${team}`, label: team, type: 'team', value: team });
  });
  Object.entries(categoryCounts).forEach(([cat, count]) => {
    if (count >= 1) pool.push({ id: `category-${cat}`, label: cat, type: 'category', value: cat });
  });
  Object.entries(traitCounts).forEach(([trait, count]) => {
    if (count >= 2) pool.push({ id: `trait-${trait}`, label: trait, type: 'trait', value: trait });
  });
  Object.entries(nationalityCounts).forEach(([nat, count]) => {
    if (count >= 1) pool.push({ id: `nat-${nat}`, label: nat, type: 'nationality', value: nat });
  });
 
  return pool;
};
 
export const CRITERIA_POOL = buildCriteriaPool();
 
export const checkCriterion = (player, criterion) => {
  switch (criterion.type) {
    case 'team':
      return player.team === criterion.value || (player.pastTeams || []).includes(criterion.value);
    case 'category':
      return player.category === criterion.value;
    case 'trait':
      return (player.traits || []).includes(criterion.value);
    case 'nationality':
      return player.nationality === criterion.value;
    default:
      return false;
  }
};
 
const seededShuffle = (array, seed) => {
  const arr = [...array];
  let s = seed || 1;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};
 
// Bugünün 3x3 grid'i: herkese aynı gün aynı grid gelir VE 9 hücrenin de en az 1 oyuncuyla
// çözülebilir olduğu garanti edilir (rastgele denemelerle, bulamazsa sabit bir yedek grid döner).
export const getTodaysGrid = () => {
  const daysSinceEpoch = Math.floor(Date.now() / 86400000);
 
  for (let attempt = 0; attempt < 40; attempt++) {
    const shuffled = seededShuffle(CRITERIA_POOL, daysSinceEpoch + 1 + attempt * 977);
    const rows = shuffled.slice(0, 3);
    const cols = shuffled.slice(3, 6);
    if (rows.length < 3 || cols.length < 3) continue;
 
    let solvable = true;
    for (const row of rows) {
      for (const col of cols) {
        const hasMatch = PLAYERS.some((p) => checkCriterion(p, row) && checkCriterion(p, col));
        if (!hasMatch) { solvable = false; break; }
      }
      if (!solvable) break;
    }
 
    if (solvable) return { rows, cols };
  }
 
  // Güvenlik ağı — çok geniş, neredeyse her zaman çözülebilir sabit bir grid
  return {
    rows: [
      { id: 'nat-USA', label: 'USA', type: 'nationality', value: 'USA' },
      { id: 'category-All-Star', label: 'ALL-STAR', type: 'category', value: 'All-Star' },
      { id: 'category-Champion', label: 'CHAMPION', type: 'category', value: 'Champion' },
    ],
    cols: [
      { id: 'trait-All-Star', label: 'ALL-STAR', type: 'trait', value: 'All-Star' },
      { id: 'trait-Champion', label: 'CHAMPION', type: 'trait', value: 'Champion' },
      { id: 'category-Center', label: 'CENTER', type: 'category', value: 'Center' },
    ],
  };
};
 