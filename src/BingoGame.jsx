import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Award, Shield, Star, Target, Lock, Hash, Flame, Sparkles,
  Radio, Compass, ShieldCheck, Globe, Repeat, RotateCw, Swords, Crown, Zap
} from 'lucide-react';
import { getRandomPlayer, validateInteraction, getDailyPlayerSequence, PLAYERS } from './playerManager';
import { getDailySubset } from './dailyRotation';
import { useGameStore } from './store';
import { db } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const ICON_MAP = {
  Trophy, Award, Shield, Star, Target, Lock, Hash, Flame, Sparkles,
  Radio, Compass, ShieldCheck, Globe, Repeat, RotateCw, Swords, Crown, Zap
};

// Genisletilmis kategori havuzu - hepsi playerManager.js'teki PLAYERS verisinde en az bir
// oyuncuyla dogrulanmis (category / traits / nationality alanlarindan). Her gun bunlardan
// rastgele 16'si seciliyor, bu yuzden hem kategoriler hem oyuncular her gun degisiyor.
const CATEGORY_POOL = [
  { id: "MVP", label: "MVP", icon: "Trophy" }, { id: "Champion", label: "CHAMPION", icon: "Award" },
  { id: "Center", label: "CENTER", icon: "Shield" }, { id: "USA", label: "USA", emoji: "🇺🇸" },
  { id: "All-Star", label: "ALL-STAR", icon: "Star" }, { id: "3-Point King", label: "3PT KING", icon: "Target" },
  { id: "Canada", label: "CANADA", emoji: "🇨🇦" }, { id: "All-Defensive", label: "DEFENSE", icon: "Lock" },
  { id: "Drafted 1st", label: "1ST PICK", icon: "Hash" }, { id: "Scoring Champ", label: "SCORER", icon: "Flame" },
  { id: "Greece", label: "GREECE", emoji: "🇬🇷" }, { id: "Serbia", label: "SERBIA", emoji: "🇷🇸" },
  { id: "Showtime", label: "SHOWTIME", icon: "Sparkles" }, { id: "90s Icon", label: "90S ICON", icon: "Radio" },
  { id: "Point Guard", label: "PG", icon: "Compass" }, { id: "Slovenia", label: "SLOVENIA", emoji: "🇸🇮" },
  { id: "Defensive POY", label: "DPOY", icon: "ShieldCheck" }, { id: "Foreign", label: "FOREIGN", icon: "Globe" },
  { id: "Double Double", label: "2X2", icon: "Repeat" }, { id: "Triple Double", label: "3X3", icon: "RotateCw" },
  { id: "Black Mamba", label: "MAMBA", icon: "Swords" }, { id: "King James", label: "KING JAMES", icon: "Crown" },
  { id: "Greek Freak", label: "GREEK FREAK", icon: "Zap" }, { id: "France", label: "FRANCE", emoji: "🇫🇷" },
  { id: "Cameroon", label: "CAMEROON", emoji: "🇨🇲" }, { id: "Switzerland", label: "SWISS", emoji: "🇨🇭" },
  { id: "Finland", label: "FINLAND", emoji: "🇫🇮" }, { id: "Dominican Republic", label: "DOM. REP.", emoji: "🇩🇴" },
  { id: "Spain", label: "SPAIN", emoji: "🇪🇸" }, { id: "New Zealand", label: "NEW ZEALAND", emoji: "🇳🇿" },
  { id: "Czech Republic", label: "CZECHIA", emoji: "🇨🇿" }, { id: "Germany", label: "GERMANY", emoji: "🇩🇪" }
];

// Gunun 16 kategorisi - 32'lik havuzdan her gun farkli bir 16'lik kombinasyon.
const CATEGORIES = getDailySubset(CATEGORY_POOL, 16);

const todayStr = () => new Date().toISOString().slice(0, 10);

const BingoGame = () => {
  const addScore = useGameStore((state) => state.addScore);
  const [filled, setFilled] = useState({});
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [skip, setSkip] = useState(5);
  const [gameCount, setGameCount] = useState(1);
  const [gameState, setGameState] = useState('playing');
  const [errorCat, setErrorCat] = useState(null);
  const [hintCat, setHintCat] = useState(null);
  const [hintUsed, setHintUsed] = useState(false); // hint artik oyun basina sadece 1 kez kullanilabiliyor

  const [dailyPlayers, setDailyPlayers] = useState(null); // null = henuz yuklenmedi
  const [loadingPlayers, setLoadingPlayers] = useState(true);

  // Acilista: Firestore'daki gunun canli (API'den cekilmis) oyuncularini yerel havuzla
  // birlestirip gunun sabit sirasini olusturuyoruz. API verisi yoksa/hata olursa sessizce
  // sadece yerel havuzla devam ediyor — oyun asla bu yuzden kirilmiyor.
  useEffect(() => {
    let cancelled = false;
    const loadPlayers = async () => {
      let apiPlayers = [];
      try {
        const snap = await getDoc(doc(db, "dailyApiPlayers", todayStr()));
        if (snap.exists()) apiPlayers = snap.data().players || [];
      } catch (e) {
        console.warn("Canlı oyuncu verisi çekilemedi, yerel havuzla devam ediliyor:", e);
      }
      if (!cancelled) {
        // ONEMLI: sadece gunun 16 kategorisinden EN AZ BIRINE uyan oyunculari havuza al.
        // API'den gelen oyuncularin cogu bos alanlara sahip (category/mentor/pastTeams yok),
        // bu filtre olmadan bazi turlarda "dogru cevabi olmayan" cozulmez durumlar cikabiliyordu.
        const combined = [...PLAYERS, ...apiPlayers];
        const solvable = combined.filter((p) => CATEGORIES.some((c) => validateInteraction(p, c.id)));
        const finalPool = solvable.length > 0 ? solvable : PLAYERS; // guvenlik agi
        setDailyPlayers(getDailyPlayerSequence(finalPool));
        setLoadingPlayers(false);
      }
    };
    loadPlayers();
    return () => { cancelled = true; };
  }, []);

  const handleAction = (catId) => {
    if (filled[catId] || gameState !== 'playing') return;

    if (validateInteraction(player, catId)) {
      setFilled(prev => ({ ...prev, [catId]: player.name }));
      setScore(s => s + 250);
      addScore(250, "bingo");
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

  // Gunun sirasindan mevcut oyuncuyu turacaya gore turetiyoruz (rastgele degil, herkese ayni sira)
  const player = dailyPlayers ? dailyPlayers[(gameCount - 1) % dailyPlayers.length] : null;

  // Bu oyuncuya uyan HİÇ açık kategori kalmadıysa (hepsi doldurulmuşsa), bu turun
  // objektif olarak çözümü yok demektir — kullanıcıya net şekilde gösterip Skip'e yönlendiriyoruz.
  const hasValidMove = player ? CATEGORIES.some((c) => !filled[c.id] && validateInteraction(player, c.id)) : true;

  const nextTurn = () => {
    if (gameCount >= 30) {
      setGameState('win');
    } else {
      setGameCount(c => c + 1);
    }
  };

  const restartGame = () => {
    setFilled({}); setLives(3); setScore(0); setSkip(5);
    setGameCount(1); setGameState('playing'); setHintUsed(false);
  };

  const shareScore = () => {
    const text = `I just finished my NBA Scouting Report with ${score} points! Can you beat me?`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loadingPlayers || !player) {
    return (
      <div className="min-h-screen bg-[#060608] text-white flex items-center justify-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">Loading today's players…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060608] text-white p-4 flex flex-col items-center font-sans">

      <div className="text-center mb-5">
        <h1 className="text-2xl font-black italic tracking-tighter">SCOUTING<span className="text-orange-500">BINGO</span></h1>
        <p className="text-[9px] text-white/25 uppercase tracking-[0.3em] mt-0.5">Daily Roster · Resets Every 24H</p>
      </div>

      {/* Oyun Sonu Rapor Ekranı */}
      <AnimatePresence>
        {gameState !== 'playing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-[#060608]/95 flex items-center justify-center p-6">
            <div className="bg-gradient-to-b from-white/[0.06] to-white/[0.015] border border-white/10 p-10 rounded-[32px] w-full max-w-sm text-center shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)]">
              <h2 className="text-[10px] uppercase tracking-[0.4em] text-white/40 mb-2">Final Scouting Report</h2>
              <h1 className="text-5xl font-black mb-10 text-orange-500">{score} <span className="text-white text-2xl align-top">PTS</span></h1>
              <div className="flex flex-col gap-3">
                <button onClick={restartGame} className="w-full py-4 rounded-2xl border border-white/15 hover:bg-white/5 transition-colors font-bold uppercase text-[10px] tracking-widest">Restart Session</button>
                <button onClick={shareScore} className="w-full py-4 rounded-2xl bg-orange-500 hover:bg-orange-400 transition-colors text-black font-bold uppercase text-[10px] tracking-widest">Share on X</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Üst Panel: Can, Progress, Skor */}
      <div className="w-full max-w-md mb-6">
        <div className="flex justify-between items-center mb-2 px-0.5">
          <div className="flex items-center gap-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i < lives ? "bg-orange-500" : "bg-white/10"}`} />
            ))}
          </div>
          <p className="text-[9px] uppercase tracking-[0.25em] text-white/30 font-bold">Round {gameCount} <span className="text-white/15">/ 30</span></p>
          <p className="text-sm font-black text-orange-400">{score.toLocaleString()} <span className="text-[9px] text-white/30 font-bold uppercase">pts</span></p>
        </div>
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-500" style={{ width: `${(gameCount / 30) * 100}%` }} />
        </div>
      </div>

      {/* Oyuncu Kartı */}
      <div className="relative w-full max-w-md rounded-3xl p-8 mb-6 text-center overflow-hidden
                      bg-gradient-to-b from-white/[0.06] to-white/[0.015] border border-white/10
                      shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)]">
        <div className="pointer-events-none absolute -top-10 -right-10 w-32 h-32 rounded-full bg-orange-500/10 blur-3xl" />
        <p className="relative text-[9px] uppercase tracking-[0.3em] text-white/30 mb-4">Scout This Player</p>

        <div className="relative flex flex-col items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/30 flex items-center justify-center">
            <span className="text-lg font-black text-orange-400">
              {player.name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight leading-snug break-words px-2 max-w-full">
            {player.name}
          </h1>
          {player.team && (
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/40 bg-white/5 border border-white/10 rounded-full px-3 py-1">
              {player.team}
            </span>
          )}
        </div>

        <div className="relative flex gap-3 justify-center">
          <button
            onClick={() => {
              if (hintUsed || !hasValidMove) return;
              const h = CATEGORIES.find(c => !filled[c.id] && validateInteraction(player, c.id));
              if(h) { setHintCat(h.id); setHintUsed(true); setTimeout(()=>setHintCat(null), 2000); }
            }}
            disabled={hintUsed || !hasValidMove}
            className="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
          >
            {hintUsed ? "Hint Used" : "💡 Hint"}
          </button>
          <button
            onClick={() => { if(skip > 0) { setSkip(s => s - 1); nextTurn(); }}}
            disabled={skip <= 0}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors disabled:opacity-25 disabled:cursor-not-allowed ${
              !hasValidMove ? "bg-red-500 hover:bg-red-400 text-white animate-pulse" : "bg-orange-500 hover:bg-orange-400 text-black"
            }`}
          >
            Skip ({skip})
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 gap-2.5 w-full max-w-md">
        {CATEGORIES.map((cat) => {
          const isFilled = !!filled[cat.id];
          const isError = errorCat === cat.id;
          const isHint = hintCat === cat.id;
          const IconComp = cat.icon ? ICON_MAP[cat.icon] : null;
          return (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleAction(cat.id)}
              className={`relative h-20 rounded-2xl border flex flex-col items-center justify-center p-1 overflow-hidden transition-colors duration-200 ${
                isFilled ? "bg-emerald-500/15 border-emerald-500/40" :
                isError ? "bg-red-500/15 border-red-500/50 animate-pulse" :
                isHint ? "bg-orange-500/20 border-orange-500/60" :
                "bg-white/5 border-white/10 hover:border-orange-500/40 hover:bg-orange-500/5"
              }`}
            >
              {isFilled ? (
                <>
                  <span className="text-emerald-400 text-sm leading-none mb-1">✓</span>
                  <span className="text-[8px] font-bold uppercase leading-none text-emerald-300/80 px-1 text-center">{filled[cat.id].split(' ').pop()}</span>
                </>
              ) : (
                <>
                  {IconComp ? (
                    <IconComp size={18} className="mb-1 text-white/60" strokeWidth={2} />
                  ) : (
                    <span className="text-lg leading-none mb-1">{cat.emoji}</span>
                  )}
                  <span className="text-[9px] font-black uppercase leading-tight text-white/50">{cat.label}</span>
                </>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default BingoGame;