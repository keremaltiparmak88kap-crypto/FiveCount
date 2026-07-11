import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Heart } from 'lucide-react';
import { useGameStore } from './store';
import { getTodaysSilhouettes } from './silhouetteData';

const ROUND_LIMIT = 6;
const STARTING_LIVES = 3;

// Basit, stilize insan silüeti — gerçek fotoğraf yerine 4 farklı poz varyasyonu.
// Telif hakkı riski yok, tüm şekiller elle çizilmiş temel path'lerden oluşuyor.
const SilhouetteSVG = ({ color, pose }) => {
  const limbPaths = {
    shoot: (
      <>
        <path d="M100 70 L100 120" stroke={color} strokeWidth="14" strokeLinecap="round" />
        <path d="M100 80 L60 40" stroke={color} strokeWidth="12" strokeLinecap="round" />
        <path d="M100 90 L138 130" stroke={color} strokeWidth="12" strokeLinecap="round" />
        <path d="M100 120 L78 175" stroke={color} strokeWidth="13" strokeLinecap="round" />
        <path d="M100 120 L122 175" stroke={color} strokeWidth="13" strokeLinecap="round" />
        <circle cx="58" cy="30" r="9" fill={color} opacity="0.85" />
      </>
    ),
    dunk: (
      <>
        <path d="M100 75 L95 115" stroke={color} strokeWidth="14" strokeLinecap="round" />
        <path d="M97 82 L60 30" stroke={color} strokeWidth="12" strokeLinecap="round" />
        <path d="M97 82 L134 30" stroke={color} strokeWidth="12" strokeLinecap="round" />
        <path d="M95 115 L70 150 L85 178" stroke={color} strokeWidth="13" strokeLinecap="round" fill="none" />
        <path d="M95 115 L128 140 L118 178" stroke={color} strokeWidth="13" strokeLinecap="round" fill="none" />
        <circle cx="97" cy="18" r="10" fill={color} opacity="0.85" />
      </>
    ),
    dribble: (
      <>
        <path d="M100 70 L100 118" stroke={color} strokeWidth="14" strokeLinecap="round" />
        <path d="M100 82 L70 100" stroke={color} strokeWidth="12" strokeLinecap="round" />
        <path d="M100 90 L128 78" stroke={color} strokeWidth="12" strokeLinecap="round" />
        <path d="M100 118 L82 145 L92 178" stroke={color} strokeWidth="13" strokeLinecap="round" fill="none" />
        <path d="M100 118 L112 150 L106 178" stroke={color} strokeWidth="13" strokeLinecap="round" fill="none" />
        <circle cx="66" cy="112" r="9" fill={color} opacity="0.85" />
      </>
    ),
    block: (
      <>
        <path d="M100 72 L100 118" stroke={color} strokeWidth="14" strokeLinecap="round" />
        <path d="M99 80 L64 34" stroke={color} strokeWidth="12" strokeLinecap="round" />
        <path d="M99 80 L134 34" stroke={color} strokeWidth="12" strokeLinecap="round" />
        <path d="M100 118 L84 178" stroke={color} strokeWidth="13" strokeLinecap="round" />
        <path d="M100 118 L116 178" stroke={color} strokeWidth="13" strokeLinecap="round" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 200 200" className="w-40 h-40 mx-auto">
      <circle cx="100" cy="45" r="24" fill={color} />
      <rect x="82" y="65" width="36" height="55" rx="14" fill={color} />
      {limbPaths[pose] || limbPaths.shoot}
    </svg>
  );
};

const SilhouetteGame = () => {
  const addScore = useGameStore((state) => state.addScore);
  const rounds = useMemo(() => getTodaysSilhouettes(), []);

  const [roundIndex, setRoundIndex] = useState(0);
  const [guess, setGuess] = useState('');
  const [revealed, setRevealed] = useState(false); // takım adı ipucu açıldı mı
  const [lives, setLives] = useState(STARTING_LIVES);
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [finished, setFinished] = useState(false);

  const current = rounds[roundIndex];
  const progress = Math.round((roundIndex / ROUND_LIMIT) * 100);

  const normalize = (v) => v.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

  const suggestions = useMemo(() => {
    const term = normalize(guess);
    if (!term) return [];
    return rounds
      .map((r) => r.name)
      .filter((n, i, arr) => arr.indexOf(n) === i)
      .filter((n) => normalize(n).includes(term))
      .slice(0, 5);
  }, [guess, rounds]);

  const advance = () => {
    const next = roundIndex + 1;
    if (next >= ROUND_LIMIT) {
      setFinished(true);
      setLocked(false);
      return;
    }
    setRoundIndex(next);
    setGuess('');
    setRevealed(false);
    setFeedback(null);
    setLocked(false);
  };

  const submitGuess = (name) => {
    if (locked || finished) return;
    setLocked(true);

    const correct = normalize(name) === normalize(current.name);

    if (correct) {
      const nextCombo = combo + 1;
      const hintPenalty = revealed ? 20 : 0;
      const points = Math.max(20, 90 - hintPenalty + nextCombo * 8);
      setCombo(nextCombo);
      setScore((s) => s + points);
      setFeedback({ type: 'correct', points });
      addScore(points, 'silhouette');
      setTimeout(advance, 900);
    } else {
      const nextLives = lives - 1;
      setLives(nextLives);
      setCombo(0);
      setFeedback({ type: 'wrong' });
      if (nextLives <= 0) {
        setTimeout(() => { setFinished(true); setLocked(false); }, 1100);
      } else {
        setTimeout(advance, 1100);
      }
    }
  };

  const useHint = () => {
    if (revealed || locked) return;
    setRevealed(true);
  };

  const restart = () => {
    setRoundIndex(0);
    setGuess('');
    setRevealed(false);
    setLives(STARTING_LIVES);
    setCombo(0);
    setScore(0);
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
              <p className="text-[10px] uppercase tracking-[0.35em] text-white/35 mb-2">Scouting Report</p>
              <h2 className="text-5xl font-black text-orange-500 mb-2">{score}</h2>
              <p className="text-xs text-white/40 mb-6">Round {roundIndex + 1}/{ROUND_LIMIT} · Combo x{combo}</p>
              <button onClick={restart} className="w-full bg-orange-500 text-black font-black py-4 rounded-2xl uppercase text-[11px] tracking-widest">
                Play Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center mb-5">
        <h1 className="text-3xl font-black italic tracking-tight">
          SIL<span className="text-orange-500">HOUETTE</span>
        </h1>
        <p className="text-[9px] uppercase tracking-[0.3em] text-white/30 mt-1">Daily Puzzle · Guess the player</p>
      </div>

      <div className="mb-5">
        <div className="flex justify-between items-center mb-2 text-[10px] uppercase tracking-widest text-white/35">
          <span>Round {roundIndex + 1}/{ROUND_LIMIT}</span>
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
            {[...Array(STARTING_LIVES)].map((_, i) => (
              <Heart key={i} size={14} fill={i < lives ? 'currentColor' : 'none'} />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1">Combo</p>
          <p className="font-black text-orange-400">x{combo}</p>
        </div>
      </div>

      <motion.div key={current.name} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.015] p-6 mb-5">
        <div className="relative">
          <div className="absolute top-0 right-0 bg-black/30 border border-white/10 rounded-xl px-3 py-1">
            <span className="text-lg font-black text-white/70">#{current.number}</span>
          </div>
          <SilhouetteSVG color={current.color} pose={current.pose} />
        </div>

        {revealed && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-[10px] uppercase tracking-widest text-orange-400 font-black mt-2">
            Team: {current.team}
          </motion.p>
        )}

        <button
          onClick={useHint}
          disabled={revealed || locked}
          className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 py-3 text-[10px] font-black uppercase tracking-widest text-white/60 hover:border-orange-500/40 disabled:opacity-35"
        >
          <span className="inline-flex items-center gap-2"><Lightbulb size={14} /> {revealed ? 'Team Revealed' : 'Reveal Team (-20 pts)'}</span>
        </button>
      </motion.div>

      <div className="relative">
        <input
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          disabled={locked}
          placeholder="Type player name..."
          className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-4 text-center text-white font-black outline-none focus:border-orange-500 mb-2"
        />
        {suggestions.length > 0 && !locked && (
          <div className="space-y-1.5 mb-3">
            {suggestions.map((name) => (
              <button
                key={name}
                onClick={() => submitGuess(name)}
                className="w-full text-left px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-orange-500/40 hover:bg-orange-500/10 transition-colors text-sm font-bold"
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="min-h-8 mt-2 text-center">
        {feedback?.type === 'correct' && <p className="text-[11px] font-bold text-emerald-300 uppercase tracking-widest">+{feedback.points} points</p>}
        {feedback?.type === 'wrong' && <p className="text-[11px] font-bold text-red-300 uppercase tracking-widest">Correct: {current.name} · next round</p>}
      </div>
    </div>
  );
};

export default SilhouetteGame;
