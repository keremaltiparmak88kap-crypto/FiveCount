import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRandomPlayer, validateInteraction } from './playerManager';

const CATEGORIES = [
  { id: "MVP", label: "MVP" }, { id: "Champion", label: "CHAMPION" },
  { id: "Center", label: "CENTER" }, { id: "USA", label: "USA" },
  { id: "All-Star", label: "ALL-STAR" }, { id: "3-Point King", label: "3PT KING" },
  { id: "Canada", label: "CANADA" }, { id: "All-Defensive", label: "DEFENSE" },
  { id: "Drafted 1st", label: "1ST PICK" }, { id: "Scoring Champ", label: "SCORER" },
  { id: "Greece", label: "GREECE" }, { id: "Serbia", label: "SERBIA" },
  { id: "Showtime", label: "SHOWTIME" }, { id: "90s Icon", label: "90S ICON" },
  { id: "Point Guard", label: "PG" }, { id: "Slovenia", label: "SLOVENIA" }
];

const BingoGame = () => {
  const [player, setPlayer] = useState(getRandomPlayer());
  const [filled, setFilled] = useState({});
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [skip, setSkip] = useState(5);
  const [gameCount, setGameCount] = useState(1);
  const [gameState, setGameState] = useState('playing');
  const [errorCat, setErrorCat] = useState(null);
  const [hintCat, setHintCat] = useState(null);

  const handleAction = (catId) => {
    if (filled[catId] || gameState !== 'playing') return;

    if (validateInteraction(player, catId)) {
      setFilled(prev => ({ ...prev, [catId]: player.name }));
      setScore(s => s + 250);
      nextTurn();
    } else {
      setErrorCat(catId);
      setTimeout(() => setErrorCat(null), 600);
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) setGameState('gameover');
      else nextTurn();
    }
  };

  const nextTurn = () => {
    if (gameCount >= 30) {
      setGameState('win');
    } else {
      setGameCount(c => c + 1);
      setPlayer(getRandomPlayer());
    }
  };

  const restartGame = () => {
    setFilled({}); setLives(3); setScore(0); setSkip(5);
    setGameCount(1); setGameState('playing'); setPlayer(getRandomPlayer());
  };

  const shareScore = () => {
    const text = `I just finished my NBA Scouting Report with ${score} points! Can you beat me?`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 flex flex-col items-center font-sans">
      
      {/* Oyun Sonu Rapor Ekranı */}
      <AnimatePresence>
        {gameState !== 'playing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-[#050505] flex items-center justify-center p-6">
            <div className="bg-[#111] p-10 rounded-[32px] border border-[#222] w-full max-w-sm text-center">
              <h2 className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 mb-2">Final Scouting Report</h2>
              <h1 className="text-5xl font-black mb-10">{score} PTS</h1>
              <div className="flex flex-col gap-3">
                <button onClick={restartGame} className="w-full py-4 border border-zinc-700 hover:bg-zinc-800 transition font-bold uppercase text-[10px] tracking-widest">Restart Session</button>
                <button onClick={shareScore} className="w-full py-4 bg-[#1DA1F2] hover:bg-blue-600 transition font-bold uppercase text-[10px] tracking-widest">Share on X</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Üst Panel: Can, Progress, Skor */}
      <div className="w-full max-w-md flex justify-between items-center mb-8 px-2">
        <div className="flex gap-2">{[...Array(3)].map((_, i) => <span key={i} className={i < lives ? "opacity-100" : "opacity-10"}>🏀</span>)}</div>
        <div className="text-center"><p className="text-[8px] text-zinc-500 uppercase tracking-widest">Progress</p><h2 className="text-sm font-bold">{gameCount}/30</h2></div>
        <div className="text-right"><p className="text-[8px] text-zinc-500 uppercase tracking-widest">Score</p><h2 className="text-xl font-black">{score}</h2></div>
      </div>

      {/* Oyuncu Kartı */}
      <div className="w-full max-w-md bg-[#111] border border-[#222] p-8 rounded-3xl mb-8 text-center">
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-1">{player.name}</h1>
        <div className="flex gap-3 justify-center mt-6">
          <button onClick={() => { const h = CATEGORIES.find(c => !filled[c.id] && validateInteraction(player, c.id)); if(h) { setHintCat(h.id); setTimeout(()=>setHintCat(null), 2000); }}} className="bg-[#1a1a1a] px-8 py-3 rounded-2xl text-[10px] font-bold uppercase hover:bg-[#222]">Hint</button>
          <button onClick={() => { if(skip > 0) { setSkip(s => s - 1); nextTurn(); }}} className="bg-orange-600 px-8 py-3 rounded-2xl text-[10px] font-bold uppercase">Skip ({skip})</button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 gap-2 w-full max-w-md">
        {CATEGORIES.map((cat) => (
          <motion.button
            key={cat.id}
            whileHover={{ scale: 1.05 }}
            onClick={() => handleAction(cat.id)}
            className={`h-20 rounded-2xl border flex flex-col items-center justify-center p-1 transition-all ${
              filled[cat.id] ? "bg-emerald-900 border-emerald-700" : 
              errorCat === cat.id ? "bg-red-900 border-red-700 animate-pulse" :
              hintCat === cat.id ? "bg-orange-700 border-orange-500" :
              "bg-[#111] border-[#222] hover:border-zinc-700"
            }`}
          >
            {filled[cat.id] ? (
              <span className="text-[8px] font-bold uppercase leading-none">{filled[cat.id].split(' ').pop()}</span>
            ) : (
              <span className="text-[9px] font-black uppercase leading-tight text-zinc-500">{cat.label}</span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default BingoGame;