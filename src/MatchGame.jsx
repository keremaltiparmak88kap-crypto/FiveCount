import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playerPool } from './data';
import { useGameStore } from './store';

// Havuzdan, verilen ID'leri hariç tutarak rastgele bir oyuncu seçer.
// Havuz tükenirse (herkes kullanıldıysa) sıfırdan rastgele seçer.
const pickPlayer = (excludeIds) => {
  const available = playerPool.filter(p => !excludeIds.includes(p.id));
  if (available.length === 0) {
    return playerPool[Math.floor(Math.random() * playerPool.length)];
  }
  return available[Math.floor(Math.random() * available.length)];
};

const MatchGame = () => {
  const addScore = useGameStore((state) => state.addScore);

  const [player, setPlayer] = useState(() => pickPlayer([]));
  const [usedPlayerIds, setUsedPlayerIds] = useState(() => (player ? [player.id] : []));
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [feedback, setFeedback] = useState(null); // 'correct' veya 'wrong'
  const [showGameOver, setShowGameOver] = useState(false);
  const [gameOverScore, setGameOverScore] = useState(0);

  const allTags = useMemo(() => [...new Set(playerPool.flatMap(p => p.tags))].sort(() => Math.random() - 0.5), []);

  const advancePlayer = (currentUsedIds) => {
    const next = pickPlayer(currentUsedIds);
    setUsedPlayerIds(next ? [...currentUsedIds, next.id] : []);
    setPlayer(next);
  };

  const handleTagClick = (tag) => {
    if (feedback) return; // geri bildirim gösterilirken tıklamayı kilitle

    if (player.tags.includes(tag)) {
      setFeedback('correct');
      const newScore = score + 10;
      setScore(newScore);
      addScore(10, "match");
      setTimeout(() => {
        setFeedback(null);
        advancePlayer(usedPlayerIds);
      }, 500);
    } else {
      setFeedback('wrong');
      if (lives > 1) {
        setLives((l) => l - 1);
        setTimeout(() => setFeedback(null), 500);
      } else {
        setTimeout(() => {
          setGameOverScore(score);
          setShowGameOver(true);
          setFeedback(null);
        }, 500);
      }
    }
  };

  const handleRestart = () => {
    setLives(3);
    setScore(0);
    setShowGameOver(false);
    const next = pickPlayer([]);
    setUsedPlayerIds(next ? [next.id] : []);
    setPlayer(next);
  };

  return (
    <div className="p-6 max-w-lg mx-auto text-white relative">
      <AnimatePresence>
        {showGameOver && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-950 border border-slate-800 rounded-3xl p-10 w-full max-w-sm text-center"
            >
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-2">Game Over</p>
              <h2 className="text-5xl font-black text-orange-500 mb-1">{gameOverScore}</h2>
              <p className="text-slate-400 text-xs mb-8">Final Score</p>
              <button
                onClick={handleRestart}
                className="w-full bg-orange-500 text-black font-black py-4 rounded-xl uppercase text-xs tracking-widest"
              >
                Play Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skor ve Can Göstergesi */}
      <div className="flex justify-between items-center mb-8 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
        <span className="font-black text-orange-500 text-xl">{score} PTS</span>
        <div className="flex gap-1 text-red-500">
          {[...Array(lives)].map((_, i) => <span key={i}>❤</span>)}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.h2 key={player?.id} className="text-4xl font-black text-center mb-10 tracking-tighter">
          {player?.name}
        </motion.h2>
      </AnimatePresence>

      <div className="grid grid-cols-4 gap-2">
        {allTags.map(tag => (
          <motion.button 
            key={tag}
            onClick={() => handleTagClick(tag)}
            className={`p-3 rounded-xl text-[10px] font-bold border transition-all ${
              feedback === 'correct' && player.tags.includes(tag) ? "bg-green-600 border-green-500" :
              feedback === 'wrong' && player.tags.includes(tag) ? "bg-yellow-500 border-yellow-400" :
              "bg-slate-950 border-slate-800 hover:border-slate-600"
            }`}
          >
            {tag}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default MatchGame;
