import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NBA_DATABASE } from './nbaData';

const BINGO_CATEGORIES = [
  "Turkish Player", "Lakers Legend", "3-Point King", "6 Rings", "MVP",
  "Greek Freak", "Center", "Hall of Fame", "Drafted 1st", "90s Icon",
  "Point Guard", "Champion", "All-Star", "Foreign", "Scoring Champ",
  "Defensive POY", "Skyhook", "Showtime", "King James", "Black Mamba",
  "Rookie", "Olympian", "Double Double", "Fadeaway", "All-Defensive"
];

const CATEGORY_ICONS = {
  "Turkish Player": "🇹🇷", "Lakers Legend": "💜", "3-Point King": "🎯",
  "6 Rings": "💍", "MVP": "🏆", "Greek Freak": "🇬🇷",
  "Center": "🏀", "Hall of Fame": "🏛️", "Drafted 1st": "🥇",
  "90s Icon": "📺", "Point Guard": "🕹️", "Champion": "👑",
  "All-Star": "⭐", "Foreign": "🌎", "Scoring Champ": "📊",
  "Defensive POY": "🛡️", "Skyhook": "🪝", "Showtime": "🔥",
  "King James": "👑", "Black Mamba": "🐍", "Rookie": "👶",
  "Olympian": "🏅", "Double Double": "➕", "Fadeaway": "💫", "All-Defensive": "🧱"
};

const BingoGame = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(NBA_DATABASE[0]);
  const [filledCells, setFilledCells] = useState({});
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [highlightedCategory, setHighlightedCategory] = useState(null);

  const getPlayerCategory = (player) => player.category || (player.pos === 'C' ? 'Center' : player.pos === 'PG' ? 'Point Guard' : 'All-Star');

  const nextPlayer = () => {
    setCurrentPlayer(NBA_DATABASE[Math.floor(Math.random() * NBA_DATABASE.length)]);
    setHighlightedCategory(null);
  };

  const handleCategoryClick = (cat) => {
    if (cat === getPlayerCategory(currentPlayer)) {
      setScore(s => s + (currentPlayer.ovr || 80));
      setFilledCells(prev => ({ ...prev, [cat]: currentPlayer }));
      nextPlayer();
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) {
        alert(`OYUN BİTTİ! Toplam Skor: ${score}`);
        setScore(0);
        setLives(3);
        setFilledCells({});
      }
      nextPlayer();
    }
  };

  const useHint = () => {
    setHighlightedCategory(getPlayerCategory(currentPlayer));
    setTimeout(() => setHighlightedCategory(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white font-sans p-4 flex flex-col items-center">
      
      {!gameStarted ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-screen text-center">
          <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">NBA BINGO</h1>
          <p className="text-slate-400 mb-8 max-w-sm">Efsane oyuncuları kategorilerine yerleştir, 3 canını koru ve zirveye çık!</p>
          <button onClick={() => setGameStarted(true)} className="px-10 py-4 bg-orange-600 rounded-full font-black text-lg hover:scale-105 transition shadow-[0_0_20px_rgba(234,88,12,0.4)]">OYUNA BAŞLA</button>
        </motion.div>
      ) : (
        <div className="w-full max-w-md mt-6">
          {/* Üst Panel */}
          <div className="flex justify-between items-center mb-6 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <div className="flex gap-1">
              {[1, 2, 3].map(i => <span key={i} className={`text-xl ${i <= lives ? "text-red-500" : "text-slate-700"}`}>{i <= lives ? "❤" : "🖤"}</span>)}
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 tracking-widest">SKOR</p>
              <p className="font-black text-2xl text-emerald-400">{score}</p>
            </div>
          </div>

          {/* Oyuncu Kartı */}
          <div className="text-center mb-8 p-6 bg-slate-900 rounded-xl border border-slate-800 shadow-2xl">
            <img src={currentPlayer.photo} className="w-28 h-28 rounded-full mx-auto border-4 border-orange-500 mb-4 object-cover bg-slate-800" />
            <h1 className="text-2xl font-black">{currentPlayer.name}</h1>
            <p className="text-xs text-slate-400 mt-1 uppercase">{currentPlayer.team} | {currentPlayer.pos}</p>
            <div className="flex gap-3 mt-6 justify-center">
              <button onClick={useHint} className="text-[11px] bg-slate-800 px-5 py-2 rounded-lg hover:bg-slate-700 transition font-bold uppercase">İPUCU</button>
              <button onClick={nextPlayer} className="text-[11px] bg-orange-600 px-5 py-2 rounded-lg hover:bg-orange-700 transition font-bold uppercase">PAS GEÇ</button>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-5 gap-2">
            {BINGO_CATEGORIES.map((cat, index) => {
              const filledPlayer = filledCells[cat];
              const isHighlighted = highlightedCategory === cat;
              return (
                <motion.button
                  key={index}
                  onClick={() => !filledPlayer && handleCategoryClick(cat)}
                  className={`aspect-square p-1 border-2 text-[8px] font-bold rounded-xl flex flex-col items-center justify-center transition-all ${filledPlayer ? "bg-emerald-900 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : isHighlighted ? "bg-orange-600 border-orange-400 animate-pulse scale-105 shadow-[0_0_20px_rgba(234,88,12,0.6)]" : "bg-slate-950 border-slate-800 hover:border-slate-700"}`}>
                  {filledPlayer ? <img src={filledPlayer.photo} className="w-9 h-9 rounded-full mb-1 object-cover" /> : <><span className="text-xl mb-1">{CATEGORY_ICONS[cat] || "🏀"}</span><span className="truncate w-full uppercase">{cat}</span></>}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BingoGame;