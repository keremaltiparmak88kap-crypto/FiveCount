import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Check, Heart, Lightbulb, X } from 'lucide-react';
import { questionBank } from './data';
import { useGameStore } from './store';

const ROUND_LIMIT = 8;
const STARTING_LIVES = 3;

const shuffle = (items) => {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
};

const getQuestionSet = (category) => {
  if (!category) return [];
  return shuffle(category.questions).slice(0, Math.min(ROUND_LIMIT, category.questions.length));
};

function TriviaGame() {
  const addScore = useGameStore((state) => state.addScore);
  const [selectedCat, setSelectedCat] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(STARTING_LIVES);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const [usedHints, setUsedHints] = useState(0);
  const [finished, setFinished] = useState(false);

  const currentQ = questions[qIndex];
  const progress = questions.length ? Math.round((qIndex / questions.length) * 100) : 0;

  const categoryStats = useMemo(() => {
    return questionBank.map((cat) => ({
      ...cat,
      count: cat.questions.length,
    }));
  }, []);

  const startCategory = (cat) => {
    setSelectedCat(cat);
    setQuestions(getQuestionSet(cat));
    setQIndex(0);
    setScore(0);
    setLives(STARTING_LIVES);
    setStreak(0);
    setBestStreak(0);
    setSelectedOption(null);
    setIsLocked(false);
    setHintVisible(false);
    setUsedHints(0);
    setFinished(false);
  };

  const finishGame = () => {
    setFinished(true);
    setIsLocked(false);
  };

  const nextQuestion = (nextLives) => {
    if (nextLives <= 0 || qIndex + 1 >= questions.length) {
      finishGame();
      return;
    }

    setQIndex((value) => value + 1);
    setSelectedOption(null);
    setHintVisible(false);
    setIsLocked(false);
  };

  const handleAnswer = (option) => {
    if (isLocked || !currentQ) return;
    setIsLocked(true);
    setSelectedOption(option);

    const correct = option === currentQ.answer;
    if (correct) {
      const nextStreak = streak + 1;
      const hintPenalty = hintVisible ? 15 : 0;
      const points = Math.max(35, Math.min(150, 70 + nextStreak * 10 - hintPenalty));

      setScore((value) => value + points);
      setStreak(nextStreak);
      setBestStreak((value) => Math.max(value, nextStreak));
      addScore(points, "trivia");
      setTimeout(() => nextQuestion(lives), 1050);
      return;
    }

    const nextLives = lives - 1;
    setLives(nextLives);
    setStreak(0);
    setTimeout(() => nextQuestion(nextLives), 1250);
  };

  const revealHint = () => {
    if (isLocked || hintVisible || !currentQ?.hints?.length) return;
    setHintVisible(true);
    setUsedHints((value) => value + 1);
  };

  const resetToCategories = () => {
    setSelectedCat(null);
    setQuestions([]);
    setQIndex(0);
    setScore(0);
    setLives(STARTING_LIVES);
    setStreak(0);
    setBestStreak(0);
    setSelectedOption(null);
    setIsLocked(false);
    setHintVisible(false);
    setUsedHints(0);
    setFinished(false);
  };

  if (!selectedCat) {
    return (
      <div className="max-w-md mx-auto text-white px-2 pb-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black italic tracking-tight">
            TRIVIA<span className="text-orange-500">RUN</span>
          </h1>
          <p className="text-[9px] uppercase tracking-[0.3em] text-white/30 mt-1">
            Pick a lane and build a streak
          </p>
        </div>

        <div className="grid gap-3">
          {categoryStats.map((cat) => (
            <button
              key={cat.category}
              onClick={() => startCategory(cat)}
              className="group rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.015] p-5 text-left hover:border-orange-500/45 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 group-hover:bg-orange-500 group-hover:text-black transition-colors">
                  <Brain size={22} />
                </div>
                <div className="min-w-0">
                  <p className="font-black text-lg leading-tight">{cat.category}</p>
                  <p className="text-[10px] uppercase tracking-widest text-white/35 mt-1">
                    {Math.min(ROUND_LIMIT, cat.count)} question run
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto text-white px-2 pb-8">
      <AnimatePresence>
        {finished && (
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
              <p className="text-[10px] uppercase tracking-[0.35em] text-white/35 mb-2">Trivia Report</p>
              <h2 className="text-5xl font-black text-orange-500 mb-2">{score}</h2>
              <p className="text-xs text-white/40 mb-6">
                Best streak x{bestStreak} / Hints {usedHints}
              </p>
              <div className="grid gap-3">
                <button
                  onClick={() => startCategory(selectedCat)}
                  className="w-full bg-orange-500 text-black font-black py-4 rounded-2xl uppercase text-[11px] tracking-widest"
                >
                  Run It Back
                </button>
                <button
                  onClick={resetToCategories}
                  className="w-full border border-white/10 bg-white/5 text-white/60 font-black py-4 rounded-2xl uppercase text-[11px] tracking-widest hover:text-white"
                >
                  Change Category
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center mb-5">
        <h1 className="text-3xl font-black italic tracking-tight">
          TRIVIA<span className="text-orange-500">RUN</span>
        </h1>
        <p className="text-[9px] uppercase tracking-[0.3em] text-white/30 mt-1">{selectedCat.category}</p>
      </div>

      <div className="mb-5">
        <div className="flex justify-between items-center mb-2 text-[10px] uppercase tracking-widest text-white/35">
          <span>Question {qIndex + 1}/{questions.length}</span>
          <span>{score} pts</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div className="h-full bg-orange-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1">Lives</p>
          <div className="flex gap-1 text-red-400">
            {[...Array(STARTING_LIVES)].map((_, index) => (
              <Heart key={index} size={14} fill={index < lives ? "currentColor" : "none"} />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1">Streak</p>
          <p className="font-black text-orange-400">x{streak}</p>
        </div>
        <button
          onClick={revealHint}
          disabled={isLocked || hintVisible || !currentQ?.hints?.length}
          className="rounded-2xl border border-white/10 bg-white/5 p-3 text-left disabled:opacity-35 hover:border-orange-500/40 transition-colors"
        >
          <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1">Hint</p>
          <div className="flex items-center gap-1 text-white font-black">
            <Lightbulb size={14} />
            {hintVisible ? "On" : "Use"}
          </div>
        </button>
      </div>

      <motion.div
        key={currentQ?.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.015] p-6 mb-5"
      >
        <p className="text-[9px] uppercase tracking-[0.3em] text-white/30 mb-3">On The Clock</p>
        <h2 className="text-2xl font-black leading-tight">{currentQ?.question}</h2>
        {hintVisible && (
          <p className="mt-4 rounded-2xl border border-orange-500/25 bg-orange-500/10 p-3 text-sm text-orange-100">
            {currentQ.hints[0]}
          </p>
        )}
      </motion.div>

      <div className="grid gap-3">
        {currentQ?.options.map((option) => {
          const isSelected = selectedOption === option;
          const isCorrect = option === currentQ.answer;
          const showCorrect = isLocked && isCorrect;
          const showWrong = isLocked && isSelected && !isCorrect;

          return (
            <motion.button
              key={option}
              whileTap={isLocked ? {} : { scale: 0.98 }}
              onClick={() => handleAnswer(option)}
              disabled={isLocked}
              className={`min-h-16 rounded-2xl border p-4 text-left font-black text-sm transition-colors ${
                showCorrect
                  ? "bg-emerald-500/20 border-emerald-400/60 text-emerald-100"
                  : showWrong
                    ? "bg-red-500/20 border-red-400/60 text-red-100"
                    : "bg-zinc-950 border-white/10 hover:border-orange-500/45"
              }`}
            >
              <span className="flex items-center justify-between gap-3">
                {option}
                {showCorrect && <Check size={16} className="text-emerald-300 shrink-0" />}
                {showWrong && <X size={16} className="text-red-300 shrink-0" />}
              </span>
            </motion.button>
          );
        })}
      </div>

      <div className="min-h-8 mt-4 text-center">
        {isLocked && selectedOption === currentQ?.answer && (
          <p className="text-[11px] font-bold text-emerald-300 uppercase tracking-widest">
            Correct / streak x{streak + 1}
          </p>
        )}
        {isLocked && selectedOption !== currentQ?.answer && (
          <p className="text-[11px] font-bold text-red-300 uppercase tracking-widest">
            Correct answer: {currentQ?.answer}
          </p>
        )}
      </div>
    </div>
  );
}

export default TriviaGame;
