import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { questionBank } from './data';
import { useGameStore } from './store'; 

function TriviaGame() {
  const [selectedCat, setSelectedCat] = useState(null);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [finished, setFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  
  // Store'dan addScore fonksiyonunu çekiyoruz
  const addScore = useGameStore((state) => state.addScore);

  const questions = useMemo(() => {
    if (!selectedCat) return [];
    return [...selectedCat.questions].sort(() => 0.5 - Math.random());
  }, [selectedCat]);

  const currentQ = questions[qIndex];

  const handleAnswer = (option) => {
    if (isLocked) return;
    setIsLocked(true);
    setSelectedOption(option);

    const earnedThisRound = option === currentQ.answer ? 100 : 0;
    if (earnedThisRound > 0) {
      setScore((s) => s + earnedThisRound);
      addScore(100, "trivia"); // Platform puanına ekle
    }

    setTimeout(() => {
      if (qIndex + 1 < questions.length) {
        setQIndex(qIndex + 1);
        setSelectedOption(null);
        setIsLocked(false);
      } else {
        setFinalScore(score + earnedThisRound);
        setFinished(true);
      }
    }, 1500);
  };

  const handlePlayAgain = () => {
    setSelectedCat(null);
    setQIndex(0);
    setScore(0);
    setIsLocked(false);
    setFinished(false);
    setSelectedOption(null);
  };

  if (!selectedCat) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <h2 className="text-3xl font-black text-white mb-8">KATEGORİ SEÇ</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
          {questionBank.map((cat) => (
            <button
              key={cat.category}
              onClick={() => setSelectedCat(cat)}
              className="p-6 bg-slate-900 border border-slate-700 hover:border-orange-500 text-white font-bold rounded-2xl transition-all"
            >
              {cat.category}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 text-white max-w-xl mx-auto">
      <AnimatePresence>
        {finished && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-950 border border-slate-800 rounded-3xl p-10 w-full max-w-sm text-center"
            >
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-2">Oyun Bitti</p>
              <h2 className="text-5xl font-black text-orange-500 mb-1">{finalScore}</h2>
              <p className="text-slate-400 text-xs mb-8">{selectedCat?.category} · Toplam Skor</p>
              <button
                onClick={handlePlayAgain}
                className="w-full bg-orange-500 text-black font-black py-4 rounded-xl uppercase text-xs tracking-widest"
              >
                Başka Kategori Seç
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between mb-8 text-slate-400">
        <span>SKOR: {score}</span>
        <span>{qIndex + 1} / {questions.length}</span>
      </div>

      <h2 className="text-2xl font-bold mb-6">{currentQ.question}</h2>

      <div className="grid grid-cols-1 gap-3">
        {currentQ.options.map((opt) => {
          const isSelected = selectedOption === opt;
          const isCorrect = opt === currentQ.answer;

          let colorClass = "bg-slate-950 border-slate-800 hover:border-orange-500";
          if (isLocked) {
            if (isCorrect) colorClass = "bg-green-600 border-green-500";
            else if (isSelected) colorClass = "bg-red-600 border-red-500";
          }

          return (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              disabled={isLocked}
              className={`p-4 border transition-all rounded-2xl shadow-lg font-medium ${colorClass}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

export default TriviaGame;