// Günlük görev havuzu. calc(gameBreakdown) -> ilerleme sayısı döner, target'a ulaşınca görev tamamlanmış sayılır.
// gameBreakdown, o günkü dailyScores dokümanındaki { gameId: puan } haritasıdır.
 
export const QUEST_POOL = [
  { id: "triple_threat", label: "Score in 3 different games today", target: 3, reward: 100, calc: (gb) => Object.keys(gb || {}).length },
  { id: "high_five", label: "Score in 5 different games today", target: 5, reward: 200, calc: (gb) => Object.keys(gb || {}).length },
  { id: "daily_grind", label: "Earn 300 points today (any game)", target: 300, reward: 150, calc: (gb) => Object.values(gb || {}).reduce((a, b) => a + b, 0) },
  { id: "go_big", label: "Earn 600 points today (any game)", target: 600, reward: 250, calc: (gb) => Object.values(gb || {}).reduce((a, b) => a + b, 0) },
  { id: "trivia_fan", label: "Score 200+ in Trivia today", target: 200, reward: 100, calc: (gb) => gb?.trivia || 0 },
  { id: "baller", label: "Score in 3PT Legend today", target: 1, reward: 80, calc: (gb) => (gb?.threes ? 1 : 0) },
  { id: "sharp_eye", label: "Score in Find Team today", target: 1, reward: 60, calc: (gb) => (gb?.find ? 1 : 0) },
  { id: "bingo_night", label: "Score in Bingo today", target: 1, reward: 60, calc: (gb) => (gb?.bingo ? 1 : 0) },
  { id: "gm_grind", label: "Score in Manager today", target: 1, reward: 80, calc: (gb) => (gb?.manager ? 1 : 0) },
  { id: "code_cracker", label: "Score in Court Code today", target: 1, reward: 60, calc: (gb) => (gb?.code ? 1 : 0) },
  { id: "team_grid_run", label: "Score in Team Grid today", target: 1, reward: 60, calc: (gb) => (gb?.grid ? 1 : 0) },
  { id: "draft_day", label: "Score in Draft Roulette today", target: 1, reward: 60, calc: (gb) => (gb?.draft ? 1 : 0) }
];
 
// Basit deterministik hash — verilen tarih string'inden aynı gün için herkese aynı 3 görevi seçer.
export const getTodaysQuests = (dateStr) => {
  let seed = 0;
  for (let i = 0; i < dateStr.length; i++) {
    seed = (seed * 31 + dateStr.charCodeAt(i)) >>> 0;
  }
  const indices = [];
  let s = seed || 1;
  while (indices.length < 3) {
    s = (s * 9301 + 49297) % 233280;
    const idx = Math.floor((s / 233280) * QUEST_POOL.length);
    if (!indices.includes(idx)) indices.push(idx);
  }
  return indices.map((i) => QUEST_POOL[i]);
};
 