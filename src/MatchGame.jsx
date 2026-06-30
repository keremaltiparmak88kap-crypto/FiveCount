import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playerPool } from './data';
import { useGameStore } from './store';

const MatchGame = () => {
  const addScore = useGameStore((state) => state.addScore);
  const [usedPlayerIds, setUsedPlayerIds] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [feedback, setFeedback] = useState(null); // 'correct' veya 'wrong'

  const getNextPlayer = () => {
    const available = playerPool.filter(p => !usedPlayerIds.includes(p.id));
    if (available.length === 0) return null;
    const randomPlayer = available[Math.floor(Math.random() * available.length)];
    setUsedPlayerIds(prev => [...prev, randomPlayer.id]);
    return randomPlayer;
  };

  const [player, setPlayer] = useState(getNextPlayer());
  const allTags = useMemo(() => [...new Set(playerPool.flatMap(p => p.tags))].sort(() => Math.random() - 0.5), []);

  const handleTagClick = (tag) => {
    if (player.tags.includes(tag)) {
      setFeedback('correct');
      setScore(s => s + 10);
      addScore(10, "match");
      setTimeout(() => {
        setFeedback(null);
        const next = getNextPlayer();
        setPlayer(next);
      }, 500);
    } else {
      setFeedback('wrong');
      if (lives > 1) setLives(l => l - 1);
      else {
        alert("Game Over! Score: " + score);
        setUsedPlayerIds([]);
        setLives(3);
        setScore(0);
        setPlayer(getNextPlayer());
      }
      setTimeout(() => setFeedback(null), 500);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto text-white">
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