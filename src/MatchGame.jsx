import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Flame, Heart, SkipForward, Tags, X } from 'lucide-react';
import { playerPool } from './data';
import { useGameStore } from './store';

const ROUND_LIMIT = 10;
const OPTION_COUNT = 4;
const STARTING_LIVES = 3;
const STARTING_PASSES = 2;

const shuffle = (items) => {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
};

const pickOne = (items) => items[Math.floor(Math.random() * items.length)];

const buildRound = (usedPlayerIds, allTags) => {
  const availablePlayers = playerPool.filter((player) => !usedPlayerIds.includes(player.id));
  const player = pickOne(availablePlayers.length ? availablePlayers : playerPool);
  const answer = pickOne(player.tags);
  const decoys = shuffle(allTags.filter((tag) => !player.tags.includes(tag))).slice(0, OPTION_COUNT - 1);

  return {
    player,
    answer,
    options: shuffle([answer, ...decoys]),
  };
};

const getTagTone = (tag) => {
  if (tag.includes("Ring") || tag.includes("Champion")) return "text-amber-300";
  if (tag.includes("MVP") || tag.includes("GOAT")) return "text-orange-300";
  if (tag.includes("Lakers") || tag.includes("Celtics") || tag.includes("Bulls")) return "text-sky-300";
  return "text-white";
};

const MatchGame = () => {
  const addScore = useGameStore((state) => state.addScore);
  const allTags = useMemo(() => [...new Set(playerPool.flatMap((player) => player.tags))], []);

  const [round, setRound] = useState(1);
  const [usedPlayerIds, setUsedPlayerIds] = useState([]);
  const [current, setCurrent] = useState(() => buildRound([], allTags));
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [lives, setLives] = useState(STARTING_LIVES);
  const [passes, setPasses] = useState(STARTING_PASSES);
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showGameOver, setShowGameOver] = useState(false);

  const progress = Math.round(((round - 1) / ROUND_LIMIT) * 100);

  const advanceRound = (nextUsedIds) => {
    if (round >= ROUND_LIMIT) {
      setShowGameOver(true);
      setLocked(false);
      return;
    }

    setRound((value) => value + 1);
    setCurrent(buildRound(nextUsedIds, allTags));
    setUsedPlayerIds(nextUsedIds);
    setFeedback(null);
    setLocked(false);
  };

  const handleTagClick = (tag) => {
    if (locked || showGameOver) return;

    const correct = tag === current.answer;
    setLocked(true);

    if (correct) {
      const nextCombo = combo + 1;
      const points = Math.min(50, 25 + nextCombo * 5);
      const nextUsedIds = [...usedPlayerIds, current.player.id];

      setCombo(nextCombo);
      setBestCombo((value) => Math.max(value, nextCombo));
      setScore((value) => value + points);
      setFeedback({ type: "correct", picked: tag, points });
      addScore(points, "match");

      setTimeout(() => advanceRound(nextUsedIds), 750);
      return;
    }

    const nextLives = lives - 1;
    setLives(nextLives);
    setCombo(0);
    setFeedback({ type: "wrong", picked: tag, points: 0 });

    if (nextLives <= 0) {
      setTimeout(() => {
        setShowGameOver(true);
        setLocked(false);
      }, 900);
    } else {
      setTimeout(() => {
        setFeedback(null);
        setLocked(false);
      }, 900);
    }
  };

  const handlePass = () => {
    if (locked || passes <= 0 || showGameOver) return;
    const nextUsedIds = [...usedPlayerIds, current.player.id];
    setLocked(true);
    setPasses((value) => value - 1);
    setCombo(0);
    setFeedback({ type: "pass", picked: null, points: 0 });
    setTimeout(() => advanceRound(nextUsedIds), 650);
  };

  const handleRestart = () => {
    const next = buildRound([], allTags);
    setRound(1);
    setUsedPlayerIds([]);
    setCurrent(next);
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setLives(STARTING_LIVES);
    setPasses(STARTING_PASSES);
    setLocked(false);
    setFeedback(null);
    setShowGameOver(false);
  };

  return (
    <div className="max-w-md mx-auto text-white relative px-2 pb-8">
      <AnimatePresence>
        {showGameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#060608]/95 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-sm text-center rounded-3xl p-8 bg-gradient-to-b from-white/[0.06] to-white/[0.015] border border-white/10"
            >
              <p className="text-[10px] uppercase tracking-[0.35em] text-white/35 mb-2">
                Tag Report
              </p>
              <h2 className="text-5xl font-black text-orange-500 mb-2">{score}</h2>
              <p className="text-xs text-white/40 mb-6">
                Round {round}/{ROUND_LIMIT} · Best combo x{bestCombo}
              </p>
              <button
                onClick={handleRestart}
                className="w-full bg-orange-500 text-black font-black py-4 rounded-2xl uppercase text-[11px] tracking-widest"
              >
                Play Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center mb-5">
        <h1 className="text-3xl font-black italic tracking-tight">
          TAG<span className="text-orange-500">MATCH</span>
        </h1>
        <p className="text-[9px] uppercase tracking-[0.3em] text-white/30 mt-1">
          Pick the tag that fits the player
        </p>
      </div>

      <div className="mb-5">
        <div className="flex justify-between items-center mb-2 text-[10px] uppercase tracking-widest text-white/35">
          <span>Round {round}/{ROUND_LIMIT}</span>
          <span>{score} pts</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full bg-orange-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-5">
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
          <div className="flex items-center gap-1 text-orange-400 font-black">
            <Flame size={15} />
            x{combo}
          </div>
        </div>
        <button
          onClick={handlePass}
          disabled={locked || passes <= 0}
          className="rounded-2xl border border-white/10 bg-white/5 p-3 text-left disabled:opacity-35 hover:border-orange-500/40 transition-colors"
        >
          <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1">Pass</p>
          <div className="flex items-center gap-1 text-white font-black">
            <SkipForward size={15} />
            {passes}
          </div>
        </button>
      </div>

      <motion.div
        key={current.player.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.015] p-7 text-center mb-5"
      >
        <div className="w-14 h-14 rounded-2xl mx-auto mb-4 bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
          <Tags size={24} />
        </div>
        <p className="text-[9px] uppercase tracking-[0.3em] text-white/30 mb-2">
          Match This Player
        </p>
        <h2 className="text-3xl font-black tracking-tight leading-tight">
          {current.player.name}
        </h2>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        {current.options.map((tag) => {
          const isPicked = feedback?.picked === tag;
          const isAnswer = tag === current.answer;
          const showCorrect = feedback && isAnswer;
          const showWrong = feedback?.type === "wrong" && isPicked;

          return (
            <motion.button
              key={tag}
              whileTap={locked ? {} : { scale: 0.97 }}
              onClick={() => handleTagClick(tag)}
              disabled={locked}
              className={`min-h-20 rounded-2xl border p-3 text-center font-black text-[12px] leading-tight transition-colors ${
                showCorrect
                  ? "bg-emerald-500/20 border-emerald-400/60 text-emerald-100"
                  : showWrong
                    ? "bg-red-500/20 border-red-400/60 text-red-100"
                    : "bg-zinc-950 border-white/10 hover:border-orange-500/45"
              }`}
            >
              <span className={getTagTone(tag)}>{tag}</span>
              {showCorrect && <Check size={15} className="mx-auto mt-2 text-emerald-300" />}
              {showWrong && <X size={15} className="mx-auto mt-2 text-red-300" />}
            </motion.button>
          );
        })}
      </div>

      <div className="min-h-8 mt-4 text-center">
        {feedback?.type === "correct" && (
          <p className="text-[11px] font-bold text-emerald-300 uppercase tracking-widest">
            +{feedback.points} points
          </p>
        )}
        {feedback?.type === "wrong" && (
          <p className="text-[11px] font-bold text-red-300 uppercase tracking-widest">
            Correct tag: {current.answer}
          </p>
        )}
        {feedback?.type === "pass" && (
          <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest">
            Passed · combo reset
          </p>
        )}
      </div>
    </div>
  );
};

export default MatchGame;
