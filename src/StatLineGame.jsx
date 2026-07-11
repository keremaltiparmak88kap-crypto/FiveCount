import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Check, Heart, X } from 'lucide-react';
import { useGameStore } from './store';
import { getDailySubset } from './dailyRotation';

const ROUND_LIMIT = 8;
const STARTING_LIVES = 3;
const OPTION_COUNT = 4;

const STAT_LINES = [
  {
    player: "Wilt Chamberlain",
    line: { pts: 100, reb: 25, ast: 2, blk: null, stl: null },
    context: "1962 regular season",
    note: "The most famous scoring night in basketball history.",
  },
  {
    player: "Kobe Bryant",
    line: { pts: 81, reb: 6, ast: 2, blk: 1, stl: 3 },
    context: "2006 vs Toronto",
    note: "Second-highest scoring game ever.",
  },
  {
    player: "Michael Jordan",
    line: { pts: 63, reb: 5, ast: 6, blk: 3, stl: 3 },
    context: "1986 playoffs at Boston",
    note: "A young superstar announcing himself.",
  },
  {
    player: "LeBron James",
    line: { pts: 51, reb: 8, ast: 8, blk: 1, stl: 1 },
    context: "2018 Finals Game 1",
    note: "A masterpiece in a brutal loss.",
  },
  {
    player: "Stephen Curry",
    line: { pts: 50, reb: 5, ast: 6, blk: 0, stl: 1 },
    context: "2022 Finals closeout run",
    note: "Deep range, quick release, total control.",
  },
  {
    player: "Nikola Jokic",
    line: { pts: 30, reb: 21, ast: 10, blk: 0, stl: 2 },
    context: "2023 playoff triple-double",
    note: "A center running the entire offense.",
  },
  {
    player: "Luka Doncic",
    line: { pts: 60, reb: 21, ast: 10, blk: 0, stl: 2 },
    context: "2022 comeback classic",
    note: "A huge triple-double from a heliocentric guard.",
  },
  {
    player: "Russell Westbrook",
    line: { pts: 20, reb: 20, ast: 21, blk: 0, stl: 3 },
    context: "2019 historic triple-double",
    note: "A stat line built from pure pressure.",
  },
  {
    player: "James Harden",
    line: { pts: 60, reb: 10, ast: 11, blk: 0, stl: 4 },
    context: "2018 triple-double explosion",
    note: "Scoring and playmaking turned all the way up.",
  },
  {
    player: "Giannis Antetokounmpo",
    line: { pts: 50, reb: 14, ast: 2, blk: 5, stl: 0 },
    context: "2021 Finals Game 6",
    note: "A title-clinching two-way avalanche.",
  },
  {
    player: "Damian Lillard",
    line: { pts: 71, reb: 6, ast: 6, blk: 0, stl: 0 },
    context: "2023 scoring eruption",
    note: "Logo range and free throws all night.",
  },
  {
    player: "Jayson Tatum",
    line: { pts: 51, reb: 13, ast: 5, blk: 0, stl: 2 },
    context: "2023 Game 7",
    note: "A record Game 7 scoring performance.",
  },
  {
    player: "Devin Booker",
    line: { pts: 70, reb: 8, ast: 6, blk: 0, stl: 0 },
    context: "2017 vs Boston",
    note: "One of the youngest players ever to reach 70.",
  },
  {
    player: "Klay Thompson",
    line: { pts: 60, reb: 4, ast: 2, blk: 0, stl: 0 },
    context: "2016 in 29 minutes",
    note: "60 points without needing the fourth quarter.",
  },
  {
    player: "Shaquille O'Neal",
    line: { pts: 61, reb: 23, ast: 0, blk: 0, stl: 0 },
    context: "2000 vs LA Clippers",
    note: "A career-high scoring night from the Diesel.",
  },
  {
    player: "Elgin Baylor",
    line: { pts: 71, reb: 25, ast: 4, blk: null, stl: null },
    context: "1960 vs New York",
    note: "An NBA record that stood for years.",
  },
  {
    player: "David Thompson",
    line: { pts: 73, reb: 3, ast: 3, blk: 0, stl: 1 },
    context: "1978 season finale",
    note: "One of the greatest scoring outbursts in league history.",
  },
  {
    player: "Karl Malone",
    line: { pts: 61, reb: 18, ast: 5, blk: 1, stl: 2 },
    context: "1990 vs Milwaukee",
    note: "The Mailman delivering a career night.",
  },
  {
    player: "Hakeem Olajuwon",
    line: { pts: 44, reb: 22, ast: 5, blk: 5, stl: 5 },
    context: "1990 quintuple-double watch",
    note: "One of the rarest stat-stuffing nights ever recorded.",
  },
  {
    player: "Kevin Garnett",
    line: { pts: 32, reb: 21, ast: 5, blk: 3, stl: 3 },
    context: "2004 MVP season peak",
    note: "A defensive anchor who filled every column.",
  },
  {
    player: "Wilt Chamberlain",
    line: { pts: 22, reb: 25, ast: 21, blk: null, stl: null },
    context: "1968 assist showcase",
    note: "Wilt proving he could dominate as a passer too.",
  },
  {
    player: "Magic Johnson",
    line: { pts: 42, reb: 15, ast: 7, blk: 0, stl: 3 },
    context: "1980 Finals Game 6",
    note: "A rookie center-for-a-night sealing a title.",
  },
  {
    player: "Larry Bird",
    line: { pts: 60, reb: 15, ast: 2, blk: 0, stl: 3 },
    context: "1985 vs Atlanta",
    note: "A career-high explosion from Larry Legend.",
  },
  {
    player: "Allen Iverson",
    line: { pts: 55, reb: 4, ast: 4, blk: 0, stl: 3 },
    context: "2005 vs Charlotte",
    note: "Pure scoring shiftiness from The Answer.",
  },
  {
    player: "Tracy McGrady",
    line: { pts: 62, reb: 8, ast: 3, blk: 1, stl: 3 },
    context: "2004 vs Washington in three quarters",
    note: "T-Mac's ceiling on full display.",
  },
  {
    player: "Kobe Bryant",
    line: { pts: 62, reb: 4, ast: 3, blk: 0, stl: 1 },
    context: "2005 through three quarters vs Dallas",
    note: "Sat the entire fourth and still nearly hit 63.",
  },
  {
    player: "Anthony Davis",
    line: { pts: 59, reb: 20, ast: 2, blk: 3, stl: 2 },
    context: "2017 vs Detroit",
    note: "A dominant two-way stat line for a franchise big man.",
  },
  {
    player: "Joel Embiid",
    line: { pts: 70, reb: 18, ast: 5, blk: 2, stl: 1 },
    context: "2024 vs San Antonio",
    note: "A career-high scoring night for the MVP center.",
  },
  {
    player: "Kevin Durant",
    line: { pts: 54, reb: 12, ast: 5, blk: 3, stl: 1 },
    context: "2016 vs San Antonio",
    note: "A near stat-line masterpiece from the Slim Reaper.",
  },
  {
    player: "Giannis Antetokounmpo",
    line: { pts: 64, reb: 14, ast: 3, blk: 3, stl: 1 },
    context: "2023 vs Indiana",
    note: "A franchise-record scoring night with elite two-way impact.",
  },
];

// Basit seed'lenmiş karıştırma — dailyRotation.js'teki mantığın aynısı (tamamen deterministik,
// Math.random() KULLANMIYOR ki herkes o gün aynı bulmacayı, aynı seçeneklerle görsün).
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

const todaySeed = () => Math.floor(Date.now() / 86400000);

// Bugünün 8 turu — büyük havuzdan HER GÜN farklı bir 8'lik alt küme (herkese aynı).
const getTodaysRounds = () => getDailySubset(STAT_LINES, ROUND_LIMIT);

// roundIndex'e göre deterministik decoy seçimi — Math.random yerine gün+tur bazlı seed.
const buildRound = (statLine, roundIndex) => {
  const decoys = seededShuffle(
    STAT_LINES.filter((item) => item.player !== statLine.player),
    todaySeed() + roundIndex * 977 + 1
  )
    .slice(0, OPTION_COUNT - 1)
    .map((item) => item.player);

  return {
    ...statLine,
    options: seededShuffle([statLine.player, ...decoys], todaySeed() + roundIndex * 977 + 2),
  };
};

const statItems = [
  ["PTS", "pts"],
  ["REB", "reb"],
  ["AST", "ast"],
  ["STL", "stl"],
  ["BLK", "blk"],
];

const StatLineGame = () => {
  const addScore = useGameStore((state) => state.addScore);
  const todaysRounds = useMemo(() => getTodaysRounds(), []);
  const [current, setCurrent] = useState(() => buildRound(todaysRounds[0], 0));
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(STARTING_LIVES);
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [finished, setFinished] = useState(false);

  const progress = useMemo(() => Math.round(((round - 1) / ROUND_LIMIT) * 100), [round]);

  const advanceRound = () => {
    if (round >= ROUND_LIMIT) {
      setFinished(true);
      setLocked(false);
      return;
    }

    setCurrent(buildRound(todaysRounds[round], round));
    setRound((value) => value + 1);
    setFeedback(null);
    setLocked(false);
  };

  const handlePick = (playerName) => {
    if (locked || finished) return;

    const correct = playerName === current.player;
    setLocked(true);

    if (correct) {
      const nextCombo = combo + 1;
      const points = Math.min(100, 35 + nextCombo * 10);
      setCombo(nextCombo);
      setScore((value) => value + points);
      setFeedback({ type: "correct", picked: playerName, points });
      addScore(points, "statline");
      setTimeout(() => advanceRound(), 850);
      return;
    }

    const nextLives = lives - 1;
    setLives(nextLives);
    setCombo(0);
    setFeedback({ type: "wrong", picked: playerName });

    if (nextLives <= 0) {
      setTimeout(() => {
        setFinished(true);
        setLocked(false);
      }, 1050);
    } else {
      setTimeout(() => advanceRound(), 1050);
    }
  };

  const restart = () => {
    setCurrent(buildRound(todaysRounds[0], 0));
    setRound(1);
    setScore(0);
    setCombo(0);
    setLives(STARTING_LIVES);
    setLocked(false);
    setFeedback(null);
    setFinished(false);
  };

  return (
    <div className="max-w-md mx-auto text-white px-2 pb-8">
      <AnimatePresence>
        {finished && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-[#060608]/95 flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm text-center rounded-3xl p-8 bg-gradient-to-b from-white/[0.06] to-white/[0.015] border border-white/10">
              <p className="text-[10px] uppercase tracking-[0.35em] text-white/35 mb-2">Final Box Score</p>
              <h2 className="text-5xl font-black text-orange-500 mb-2">{score}</h2>
              <p className="text-xs text-white/40 mb-6">Round {round}/{ROUND_LIMIT} · Combo x{combo}</p>
              <button onClick={restart} className="w-full bg-orange-500 text-black font-black py-4 rounded-2xl uppercase text-[11px] tracking-widest">
                Play Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center mb-5">
        <h1 className="text-3xl font-black italic tracking-tight">
          STAT<span className="text-orange-500">LINE</span>
        </h1>
        <p className="text-[9px] uppercase tracking-[0.3em] text-white/30 mt-1">Daily Puzzle · Same 8 rounds for everyone</p>
      </div>

      <div className="mb-5">
        <div className="flex justify-between items-center mb-2 text-[10px] uppercase tracking-widest text-white/35">
          <span>Round {round}/{ROUND_LIMIT}</span>
          <span>{score} pts</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div className="h-full bg-orange-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-5">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1">Lives</p>
          <div className="flex gap-1 text-red-400">
            {[...Array(STARTING_LIVES)].map((_, index) => (
              <Heart key={index} size={15} fill={index < lives ? "currentColor" : "none"} />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1">Combo</p>
          <p className="font-black text-orange-400">x{combo}</p>
        </div>
      </div>

      <motion.div key={current.player} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.015] p-6 mb-5">
        <div className="w-14 h-14 rounded-2xl mx-auto mb-4 bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
          <BarChart3 size={25} />
        </div>
        <p className="text-center text-[9px] uppercase tracking-[0.3em] text-white/30 mb-4">{current.context}</p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {statItems.map(([label, key]) => (
            current.line[key] !== null && (
              <div key={key} className="rounded-2xl bg-black/25 border border-white/10 p-3 text-center">
                <p className="text-[9px] text-white/30 font-black">{label}</p>
                <p className="text-2xl font-black text-white">{current.line[key]}</p>
              </div>
            )
          ))}
        </div>
        <p className="text-center text-[11px] text-white/35 leading-relaxed">{current.note}</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        {current.options.map((playerName) => {
          const isPicked = feedback?.picked === playerName;
          const isAnswer = current.player === playerName;
          const showCorrect = feedback && isAnswer;
          const showWrong = feedback?.type === "wrong" && isPicked;

          return (
            <motion.button
              key={playerName}
              whileTap={locked ? {} : { scale: 0.97 }}
              onClick={() => handlePick(playerName)}
              disabled={locked}
              className={`min-h-20 rounded-2xl border p-3 text-center font-black text-[12px] leading-tight transition-colors ${
                showCorrect
                  ? "bg-emerald-500/20 border-emerald-400/60 text-emerald-100"
                  : showWrong
                    ? "bg-red-500/20 border-red-400/60 text-red-100"
                    : "bg-zinc-950 border-white/10 hover:border-orange-500/45"
              }`}
            >
              {playerName}
              {showCorrect && <Check size={15} className="mx-auto mt-2 text-emerald-300" />}
              {showWrong && <X size={15} className="mx-auto mt-2 text-red-300" />}
            </motion.button>
          );
        })}
      </div>

      <div className="min-h-8 mt-4 text-center">
        {feedback?.type === "correct" && <p className="text-[11px] font-bold text-emerald-300 uppercase tracking-widest">+{feedback.points} points</p>}
        {feedback?.type === "wrong" && <p className="text-[11px] font-bold text-red-300 uppercase tracking-widest">Correct: {current.player} · next round</p>}
      </div>
    </div>
  );
};

export default StatLineGame;
