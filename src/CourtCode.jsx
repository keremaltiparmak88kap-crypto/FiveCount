import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShareButton } from './ShareButton'; // Dosyan aynı klasördeyse böyle
import { useGameStore } from './store';
const CourtCode = () => {
  const addScore = useGameStore((state) => state.addScore);
  const target = "ALPEREN";
  const targetName = "ALPEREN ŞENGÜN";
  
  const [guesses, setGuesses] = useState(Array(5).fill(""));
  const [currentGuess, setCurrentGuess] = useState("");
  const [currentRow, setCurrentRow] = useState(0);
  const [won, setWon] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState("");

  // 24 Saatlik Geri Sayım
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight - now;
      setTimeLeft(`${Math.floor((diff / (1000 * 60 * 60)) % 24)}h ${Math.floor((diff / (1000 * 60)) % 60)}m ${Math.floor((diff / 1000) % 60)}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleKeyDown = (e) => {
    if (won) return;
    if (e.key === 'Enter' && currentGuess.length === 7 && currentRow < 5) {
      const newGuesses = [...guesses];
      newGuesses[currentRow] = currentGuess;
      setGuesses(newGuesses);
      
      if (currentGuess === target) {
        setWon(true);
        const points = (5 - currentRow) * 100; // Satır puanı
        setScore(points);
        addScore(points, "code");
      }
      setCurrentGuess("");
      setCurrentRow(currentRow + 1);
    } else if (e.key === 'Backspace') {
      setCurrentGuess(currentGuess.slice(0, -1));
    } else if (currentGuess.length < 7 && /^[A-ZĞÜŞİÖÇ]$/i.test(e.key)) {
      setCurrentGuess(currentGuess + e.key.toUpperCase());
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 outline-none" onKeyDown={handleKeyDown} tabIndex="0">
      
      {/* BAŞLIK HİYERARŞİSİ */}
      <div className="text-center mb-2">
        <h3 className="text-[9px] font-bold text-white/40 uppercase tracking-[0.3em] mb-1">Daily Challenge</h3>
        <h1 className="text-4xl font-black italic tracking-tighter text-white">COURT<span className="text-orange-500">CODE</span></h1>
        <p className="text-[9px] text-white/20 font-mono mt-2 uppercase tracking-[0.2em]">RESET IN: {timeLeft}</p>
      </div>

      {/* Skor Paneli */}
      <div className="text-center">
         <p className="text-orange-500 font-black text-xs uppercase tracking-widest">Score: {score}</p>
      </div>

      <div className="flex flex-col gap-2">
        {guesses.map((guess, rowIndex) => (
          <div key={rowIndex} className="flex gap-2">
            {[...Array(7)].map((_, i) => {
              const letter = rowIndex === currentRow ? currentGuess[i] : guess[i];
              // Zafer anında kazanan satırı titreterek yeşile çevir
              const isWinRow = won && rowIndex === currentRow - 1;
              return (
                <motion.div 
                  key={i}
                  animate={isWinRow ? { scale: [1, 1.1, 1], backgroundColor: "#059669" } : {}}
                  transition={{ delay: isWinRow ? i * 0.1 : 0 }}
                  className={`w-12 h-14 border flex items-center justify-center text-2xl font-black rounded-lg 
                    ${rowIndex < currentRow && !isWinRow ? (guess[i] === target[i] ? "bg-emerald-600" : target.includes(guess[i]) ? "bg-orange-600" : "bg-zinc-800") : "bg-zinc-900 border-white/10"}`}
                >
                  {letter || ""}
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {won && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-center">
            <h2 className="text-emerald-500 font-black text-lg">CONGRATULATIONS</h2>
            <p className="text-white text-2xl font-black italic">{targetName}</p>
            <p className="text-orange-500 font-bold mt-2">TOTAL SCORE: {score}</p>
            <ShareButton gameName="COURT CODE" score={450} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourtCode;