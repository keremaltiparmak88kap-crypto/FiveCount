import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { questionBank } from './data';
import { useGameStore } from './store'; 

function TriviaGame() {
  const [selectedCat, setSelectedCat] = useState(null);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  
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

    if (option === currentQ.answer) {
      setScore((s) => s + 100);
      addScore(100); // Platform puanına ekle
    }

    setTimeout(() => {
      if (qIndex + 1 < questions.length) {
        setQIndex(qIndex + 1);
        setSelectedOption(null);
        setIsLocked(false);
      } else {
        alert(`Oyun Bitti! Toplam Skor: ${score + (option === currentQ.answer ? 100 : 0)}`);
        setSelectedCat(null);
        setQIndex(0);
        setScore(0);
        setIsLocked(false);
      }
    }, 1500);
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