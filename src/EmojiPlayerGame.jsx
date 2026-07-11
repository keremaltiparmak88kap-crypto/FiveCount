import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Heart } from 'lucide-react';
import { useGameStore } from './store';
import { getTodaysEmojiRounds } from './emojiPlayerData';

const ROUND_LIMIT = 6;
const STARTING_LIVES = 3;

const normalize = (v) => v.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

const EmojiPlayerGame = () => {
  const addScore = useGameStore((state) => state.addScore);
  const rounds = useMemo(() => getTodaysEmojiRounds(), []);

  const [roundIndex, setRoundIndex] = useState(0);
  const [guess, setGuess] = useState('');
  const [clueUsed, setClueUsed] = useState(false);
  const [lives, setLives] = useState(STARTING_LIVES);
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [finished, setFinished] = useState(false);

  const current = rounds[roundIndex];
  const progress = Math.round((roundIndex / ROUND_LIMIT) * 100);

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
    setClueUsed(false);
    setFeedback(null);
    setLocked(false);
  };

  const submitGuess = (name) => {
    if (locked || finished) return;
    setLocked(true);

    const correct = normalize(name) === normalize(current.name);

    if (correct) {
      const nextCombo = combo + 1;
      const cluePenalty = clueUsed ? 15 : 0;
      const points = Math.max(20, 80 - cluePenalty + nextCombo * 8);
      setCombo(nextCombo);
      setScore((s) => s + points);
      setFeedback({ type: 'correct', points });
      addScore(points, 'emojiplayer');
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

  const useClue = () => {
    if (clueUsed || locked) return;
    setClueUsed(true);
  };

  const restart = () => {
    setRoundIndex(0);
    setGuess('');
    setClueUsed(false);
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
              <p className="text-[10px] uppercase tracking-[0.35em] text-white/35 mb-2">Decoded</p>
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
          EMOJI<span className="text-orange-500">PLAYER</span>
        </h1>
        <p className="text-[9px] uppercase tracking-[0.3em] text-white/30 mt-1">Daily Puzzle · Decode the emojis</p>
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

      <motion.div key={current.name} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.015] p-8 mb-5 text-center">
        <p className="text-[9px] uppercase tracking-[0.3em] text-white/30 mb-6">Who Is This?</p>
        <div className="text-6xl flex justify-center gap-4 mb-4">
          {current.emojis.map((e, i) => <span key={i}>{e}</span>)}
        </div>

        {clueUsed && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] text-orange-300 mt-4">
            {current.clue}
          </motion.p>
        )}

        <button
          onClick={useClue}
          disabled={clueUsed || locked}
          className="mt-5 w-full rounded-2xl border border-white/10 bg-white/5 py-3 text-[10px] font-black uppercase tracking-widest text-white/60 hover:border-orange-500/40 disabled:opacity-35"
        >
          <span className="inline-flex items-center gap-2"><Lightbulb size={14} /> {clueUsed ? 'Clue Revealed' : 'Reveal Clue (-15 pts)'}</span>
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

export default EmojiPlayerGame;
