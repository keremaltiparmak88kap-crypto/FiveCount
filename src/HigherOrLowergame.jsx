import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowDown, Flame } from 'lucide-react';
import { useGameStore } from './store';
import { getTodaysCategory, getTodaysSequence } from './higherLowerData';

const HigherOrLowerGame = () => {
  const addScore = useGameStore((state) => state.addScore);
  const category = useMemo(() => getTodaysCategory(), []);
  const sequence = useMemo(() => getTodaysSequence(), []);

  const [index, setIndex] = useState(1); // sequence[0] = başlangıç şampiyonu, sequence[1] = ilk rakip
  const [champion, setChampion] = useState(sequence[0]);
  const [challenger, setChallenger] = useState(sequence[1]);
  const [revealed, setRevealed] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(null);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [scoredThisRun, setScoredThisRun] = useState(0);

  const handleGuess = (guessHigher) => {
    if (revealed || gameOver) return;

    const champVal = champion[category.id];
    const challVal = challenger[category.id];
    const isHigher = challVal >= champVal;
    const correct = guessHigher === isHigher;

    setRevealed(true);
    setLastCorrect(correct);

    if (correct) {
      const newStreak = streak + 1;
      const points = 20 + newStreak * 10;
      setStreak(newStreak);
      setBestStreak((b) => Math.max(b, newStreak));
      setScoredThisRun((s) => s + points);
      addScore(points, "higherlower");

      setTimeout(() => {
        const nextIndex = index + 1;
        if (nextIndex >= sequence.length) {
          setGameOver(true);
          return;
        }
        setChampion(challenger);
        setChallenger(sequence[nextIndex]);
        setIndex(nextIndex);
        setRevealed(false);
        setLastCorrect(null);
      }, 1100);
    } else {
      setTimeout(() => setGameOver(true), 1100);
    }
  };

  const restart = () => {
    setIndex(1);
    setChampion(sequence[0]);
    setChallenger(sequence[1]);
    setRevealed(false);
    setLastCorrect(null);
    setStreak(0);
    setGameOver(false);
    setScoredThisRun(0);
  };

  const renderCard = (player, isChallenger) => {
    const showValue = !isChallenger || revealed;
    return (
      <div className={`relative flex-1 rounded-3xl p-6 text-center border overflow-hidden transition-colors ${
        revealed && isChallenger
          ? lastCorrect ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-red-500/10 border-red-500/40'
          : 'bg-gradient-to-b from-white/[0.06] to-white/[0.015] border-white/10'
      }`}>
        <div className="pointer-events-none absolute -top-8 -right-8 w-24 h-24 rounded-full bg-orange-500/10 blur-2xl" />
        <p className="relative text-[9px] uppercase tracking-[0.3em] text-white/30 mb-3">
          {isChallenger ? 'Challenger' : 'Champion'}
        </p>
        <h2 className="relative text-lg font-black uppercase tracking-tight leading-snug mb-4 min-h-[3.5rem] flex items-center justify-center">
          {player.name}
        </h2>
        <div className="relative">
          {showValue ? (
            <>
              <p className="text-3xl font-black text-orange-400">{category.format(player[category.id])}</p>
              <p className="text-[9px] uppercase tracking-widest text-white/30 mt-1">{category.suffix}</p>
            </>
          ) : (
            <p className="text-3xl font-black text-white/15">???</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto text-white px-2 pb-8">
      <AnimatePresence>
        {gameOver && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-[#060608]/95 flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm text-center rounded-3xl p-8 bg-gradient-to-b from-white/[0.06] to-white/[0.015] border border-white/10">
              <p className="text-[10px] uppercase tracking-[0.35em] text-white/35 mb-2">Chain Ended</p>
              <h2 className="text-5xl font-black text-orange-500 mb-2">{scoredThisRun}</h2>
              <p className="text-xs text-white/40 mb-6">Best streak this run: {bestStreak}</p>
              <button onClick={restart} className="w-full bg-orange-500 text-black font-black py-4 rounded-2xl uppercase text-[11px] tracking-widest">
                Play Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center mb-5">
        <h1 className="text-3xl font-black italic tracking-tight">
          HIGHER<span className="text-orange-500">/LOWER</span>
        </h1>
        <p className="text-[9px] uppercase tracking-[0.3em] text-white/30 mt-1">
          Today's Category: {category.label}
        </p>
      </div>

      <div className="flex items-center justify-between mb-5 px-1">
        <div className="flex items-center gap-1.5 text-orange-400">
          <Flame size={14} />
          <span className="text-sm font-black">{streak}</span>
          <span className="text-[9px] text-white/30 uppercase tracking-widest ml-1">streak</span>
        </div>
        <p className="text-sm font-black text-orange-400">{scoredThisRun.toLocaleString()} pts</p>
      </div>

      <div className="flex gap-3 mb-6">
        {renderCard(champion, false)}
        {renderCard(challenger, true)}
      </div>

      {!revealed && !gameOver && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleGuess(true)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/10 py-5 font-black uppercase text-xs tracking-widest transition-colors"
          >
            <ArrowUp size={16} className="text-emerald-400" /> Higher
          </button>
          <button
            onClick={() => handleGuess(false)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-white/5 border border-white/10 hover:border-red-500/40 hover:bg-red-500/10 py-5 font-black uppercase text-xs tracking-widest transition-colors"
          >
            <ArrowDown size={16} className="text-red-400" /> Lower
          </button>
        </div>
      )}

      {revealed && (
        <p className={`text-center text-[11px] font-bold uppercase tracking-widest ${lastCorrect ? 'text-emerald-300' : 'text-red-300'}`}>
          {lastCorrect ? 'Correct! Next matchup…' : 'Chain broken'}
        </p>
      )}
    </div>
  );
};

export default HigherOrLowerGame;
