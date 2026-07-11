import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from './store';
import { db } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

// Each player's trait / defining characteristic
const PLAYER_TRAITS = {
  // LAL
  "Kobe": "81 Point Game", "Shaq": "The Diesel", "Magic": "Showtime", "LeBron": "King",
  "Kareem": "Skyhook", "Worthy": "Finals MVP", "West": "The Logo", "Baylor": "Acrobatic",
  "Fisher": "Clutch", "Gasol": "High IQ", "Odom": "Versatile", "Horry": "Big Shot",
  "Howard": "Superman", "Davis": "AD", "Westbrook": "Triple-Double", "Vujacic": "The Machine",
  "Mihm": "Big Man", "Walton": "Luke", "Divac": "Vlade", "Green": "Iron Man",

  // GSW
  "Curry": "Chef", "Klay": "Game 6", "Draymond": "DPOY", "Durant": "Slim Reaper",
  "Iguodala": "Finals MVP", "Livingston": "Mid-Range", "Looney": "Loon", "Wiggins": "Maple Jordan",
  "Barry": "Underhand King", "Mullin": "Sharpshooter", "Hardaway": "Killer Crossover", "Richardson": "High Flyer",
  "Ellis": "Microwave", "Jamison": "Off the Glass", "Richmond": "Rock", "Sprewell": "Spree",
  "Webber": "C-Webb", "Bol": "Shot Blocker", "Thurmond": "Double-Double", "Barnes": "Sniper",

  // BOS
  "Bird": "Legend", "Russell": "Captain", "Pierce": "The Truth", "Garnett": "Big Ticket",
  "Allen": "Jesus", "Rondo": "Triple-Double King", "Tatum": "Elite Wing", "Brown": "Jaylen",
  "Havlicek": "Hondo", "Cousy": "Houdini", "McHale": "Low Post", "Parish": "Chief",
  "Maxwell": "Cornbread", "Ainge": "Sharpshooter", "Walker": "Cardiac Kemba", "Smart": "DPOY",
  "Horford": "Big Al", "White": "Iceman", "Sharman": "Sharpshooter", "Heinsohn": "Tommy Gun",

  // CHI
  "Jordan": "Air", "Pippen": "Pip", "Rodman": "The Worm", "Rose": "D-Rose",
  "Noah": "Energy Big", "Harper": "Ron", "Kukoc": "European Magic", "Longley": "Luc",
  "Grant": "Horace", "Paxson": "Clutch Shooter", "LaVine": "Zach", "DeRozan": "Mid-Range King",
  "Cartwright": "Big Bill", "Armstrong": "BJ", "Perdue": "Will", "Wennington": "Sharpshooting Big",
  "Kerr": "Three Point Ace", "Buechler": "Energy", "Simpkins": "Role Player", "Caruso": "Bald Mamba",

  // MIA
  "Wade": "Flash", "Bosh": "CB4", "Haslem": "Heart and Hustle", "Mourning": "Zo",
  "Butler": "Buckets", "Adebayo": "Bam", "Dragic": "Dragon", "Battier": "Glue Guy",
  "Chalmers": "Rio", "Robinson": "3pt Sniper", "Herro": "Sixth Man", "Lowry": "Steady Eddie",
  "Oladipo": "Victor", "Jones": "3pt Specialist", "Mashburn": "Monster Mash", "Seikaly": "Rony",
  "Smith": "Steve"
};

// Each team has a 20-player roster
const ALL_TEAMS = {
  LAL: ["Kobe", "Shaq", "Magic", "LeBron", "Kareem", "Worthy", "West", "Baylor", "Fisher", "Gasol",
        "Odom", "Horry", "Howard", "Davis", "Westbrook", "Vujacic", "Mihm", "Walton", "Divac", "Green"],
  GSW: ["Curry", "Klay", "Draymond", "Durant", "Iguodala", "Livingston", "Looney", "Wiggins", "Barry", "Mullin",
        "Hardaway", "Richardson", "Ellis", "Jamison", "Richmond", "Sprewell", "Webber", "Bol", "Thurmond", "Barnes"],
  BOS: ["Bird", "Russell", "Pierce", "Garnett", "Allen", "Rondo", "Tatum", "Brown", "Havlicek", "Cousy",
        "McHale", "Parish", "Maxwell", "Ainge", "Walker", "Smart", "Horford", "White", "Sharman", "Heinsohn"],
  CHI: ["Jordan", "Pippen", "Rodman", "Rose", "Noah", "Harper", "Kukoc", "Longley", "Grant", "Paxson",
        "LaVine", "DeRozan", "Cartwright", "Armstrong", "Perdue", "Wennington", "Kerr", "Buechler", "Simpkins", "Caruso"],
  MIA: ["Wade", "LeBron", "Bosh", "Haslem", "Mourning", "Hardaway", "Butler", "Adebayo", "Dragic", "Battier",
        "Allen", "Chalmers", "Robinson", "Herro", "Lowry", "Oladipo", "Jones", "Mashburn", "Seikaly", "Smith"]
};

const BOX_COUNT = 12; // Number of trait boxes shown at the bottom (the real targets)

// Picks 'count' random elements from an array (Fisher-Yates shuffle)
const pickRandom = (arr, count) => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
};

// Bu 5 takımın elle yazılmış, zengin lakapları var (aşağıdaki PLAYER_TRAITS).
// Diğer 25 takım için Cloud Function'ın her gün çektiği canlı kadro kullanılıyor
// (pozisyon + forma numarası bazlı etiketlerle).
const CURATED_TEAM_KEYS = ["LAL", "GSW", "BOS", "CHI", "MIA"];

const todayStr = () => new Date().toISOString().slice(0, 10);

const TeamGrid = ({ teamKey, onBack }) => {
  const addScore = useGameStore((state) => state.addScore);
  // Oyun State'leri
  const [boxes, setBoxes] = useState([]);
  const [target, setTarget] = useState(null);
  const [lives, setLives] = useState(3);
  const [skipCount, setSkipCount] = useState(5);
  const [hintUsed, setHintUsed] = useState(false);
  const [wrongIdx, setWrongIdx] = useState(null);
  const [highlightIdx, setHighlightIdx] = useState(null);
  const [gameStatus, setGameStatus] = useState("playing");

  // İstatistik State'leri (Özellik 3)
  const [stats, setStats] = useState({ correct: 0, wrong: 0, hints: 0, time: 0 });
  const [score, setScore] = useState(0);
  const timerRef = useRef(null);

  const [loadingRoster, setLoadingRoster] = useState(false);
  const [rosterError, setRosterError] = useState(null);

  const startRoundTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setStats(prev => ({ ...prev, time: prev.time + 1 }));
    }, 1000);
  };

  const resetRoundState = () => {
    setLives(3); setSkipCount(5); setHintUsed(false); setWrongIdx(null); setHighlightIdx(null);
    setGameStatus("playing");
    setStats({ correct: 0, wrong: 0, hints: 0, time: 0 });
    setScore(0);
    startRoundTimer();
  };

  const initGame = async (key) => {
    setRosterError(null);

    // --- CURATED TAKIM (LAL/GSW/BOS/CHI/MIA) — elle yazılmış lakaplarla, senkron ---
    if (CURATED_TEAM_KEYS.includes(key)) {
      const fullRoster = ALL_TEAMS[key] || [];
      const shuffled = [...fullRoster].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 12);

      setBoxes(selected.map(p => ({ player: p, trait: PLAYER_TRAITS[p] || "N/A", solved: false })));
      setTarget(selected[Math.floor(Math.random() * selected.length)]);
      resetRoundState();
      return;
    }

    // --- CANLI TAKIM (diğer 25) — Cloud Function'ın her gün çektiği gerçek kadro ---
    setLoadingRoster(true);
    try {
      const snap = await getDoc(doc(db, "dailyTeamRosters", todayStr()));
      const roster = snap.exists() ? (snap.data().teams?.[key] || []) : [];

      if (roster.length === 0) {
        setRosterError("Bu takım için bugün canlı kadro verisi henüz gelmedi. Az sonra tekrar dene.");
        setLoadingRoster(false);
        return;
      }

      const shuffled = [...roster].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, Math.min(12, shuffled.length));

      setBoxes(selected.map(p => ({ player: p.name, trait: p.trait, solved: false })));
      setTarget(selected[Math.floor(Math.random() * selected.length)].name);
      resetRoundState();
    } catch (e) {
      setRosterError("Kadro yüklenirken bir hata oluştu. Tekrar dene.");
    } finally {
      setLoadingRoster(false);
    }
  };

  useEffect(() => { 
    if (teamKey) initGame(teamKey); 
    return () => clearInterval(timerRef.current);
  }, [teamKey]);

  useEffect(() => {
    if (gameStatus !== "playing") clearInterval(timerRef.current);
  }, [gameStatus]);

  const handleBoxClick = (idx) => {
    if (boxes[idx].solved || gameStatus !== "playing") return;

    if (boxes[idx].player === target) {
      setStats(prev => ({ ...prev, correct: prev.correct + 1 }));
      addScore(50, "grid");
      setScore(s => s + 50);
      const newBoxes = [...boxes];
      newBoxes[idx].solved = true;
      setBoxes(newBoxes);
      setHighlightIdx(null);
      
      const remaining = newBoxes.filter(b => !b.solved);
      if (remaining.length === 0) setGameStatus("winner");
      else setTarget(remaining[Math.floor(Math.random() * remaining.length)].player);
    } else {
      setStats(prev => ({ ...prev, wrong: prev.wrong + 1 }));
      setWrongIdx(idx);
      setTimeout(() => setWrongIdx(null), 500);
      setLives(l => {
        if (l - 1 <= 0) { setGameStatus("gameover"); return 0; }
        return l - 1;
      });
    }
  };

  // Zaman Formatlayıcı (00:00)
  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (loadingRoster) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-white min-h-screen bg-black flex items-center justify-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">Loading today's roster…</p>
      </div>
    );
  }

  if (rosterError) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-white min-h-screen bg-black flex flex-col items-center justify-center text-center gap-6">
        <p className="text-sm text-white/50 max-w-xs">{rosterError}</p>
        <div className="flex gap-3">
          <button onClick={() => initGame(teamKey)} className="bg-orange-500 text-black px-8 py-3 rounded-full font-black uppercase text-xs tracking-widest">Try Again</button>
          <button onClick={onBack} className="border border-white/20 px-8 py-3 rounded-full font-black uppercase text-xs tracking-widest hover:bg-white/5">Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 text-white min-h-screen bg-black font-sans relative overflow-hidden">
      
      {/* OYUN SONU PANELİ */}
      <AnimatePresence>
        {gameStatus !== "playing" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#060608]/95 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-full max-w-sm rounded-[32px] p-10 text-center overflow-hidden
                         bg-gradient-to-b from-white/[0.06] to-white/[0.015] border border-white/10
                         shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)]"
            >
              <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full bg-orange-500/10 blur-3xl" />

              <p className="relative text-[10px] uppercase tracking-[0.4em] text-white/40 mb-2">
                {gameStatus === "winner" ? "Roster Complete" : "Session Ended"}
              </p>
              <h1 className="relative text-5xl font-black mb-1 text-orange-500">
                {score} <span className="text-white text-2xl align-top">PTS</span>
              </h1>
              <p className="relative text-[11px] text-white/30 uppercase tracking-widest mb-8">
                {teamKey} · Team Grid
              </p>

              <div className="relative grid grid-cols-2 gap-3 mb-8">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="text-[9px] text-white/35 uppercase tracking-widest mb-1">Time</p>
                  <p className="text-xl font-black">{formatTime(stats.time)}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="text-[9px] text-white/35 uppercase tracking-widest mb-1">Accuracy</p>
                  <p className="text-xl font-black">{Math.round((stats.correct / (stats.correct + stats.wrong || 1)) * 100)}%</p>
                </div>
              </div>

              <div className="relative flex flex-col gap-3">
                <button
                  onClick={() => {
                    const text = `I just scored ${score} points in FiveCourt's Team Grid! Can you beat me?`;
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="w-full py-4 rounded-2xl bg-[#1DA1F2] hover:bg-blue-500 transition-colors text-white font-black uppercase text-[10px] tracking-widest"
                >
                  Share on X
                </button>
                <button
                  onClick={() => initGame(teamKey)}
                  className="w-full py-4 rounded-2xl border border-white/15 hover:bg-white/5 transition-colors font-black uppercase text-[10px] tracking-widest"
                >
                  Play Again
                </button>
                <button onClick={onBack} className="text-white/30 hover:text-white text-[10px] uppercase tracking-widest transition-colors mt-1">
                  Exit to Menu
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ÜST PANEL */}
      <div className="flex justify-between items-start mb-12">
        <div className="flex flex-col gap-4">
          <button onClick={onBack} className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition w-fit">← BACK</button>
          <div className="bg-neutral-900 px-4 py-2 rounded-full border border-white/5">
            <p className="text-[10px] font-mono text-orange-500">{formatTime(stats.time)}</p>
          </div>
        </div>
        
        <div className="text-center relative h-20 flex flex-col justify-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-600 mb-2">Current Target</p>
          <div className="relative">
            {/* HEDEF GEÇİŞ ANİMASYONU (Özellik 4) */}
            <AnimatePresence mode="wait">
              <motion.h1 
                key={target}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.3, ease: "circOut" }}
                className="text-5xl font-extrabold text-white tracking-tighter"
              >
                {target}
              </motion.h1>
            </AnimatePresence>
          </div>
        </div>

        <div className="flex gap-2">
            {[1, 2, 3].map(i => <div key={i} className={`w-3 h-3 rounded-full transition-colors duration-500 ${i > lives ? "bg-neutral-800" : "bg-orange-500"}`}/>)}
        </div>
      </div>

      {/* BUTONLAR */}
      <div className="flex justify-center gap-4 mb-12">
        <button 
          onClick={() => { setHighlightIdx(boxes.findIndex(b => b.player === target && !b.solved)); setHintUsed(true); setStats(s => ({...s, hints: s.hints + 1})) }} 
          disabled={hintUsed || gameStatus !== "playing"} 
          className="px-10 py-3 border border-neutral-700 rounded-lg text-[10px] font-black uppercase hover:bg-white hover:text-black transition-all disabled:opacity-20"
        >HINT</button>
        <button 
          onClick={() => { setSkipCount(s => s - 1); setTarget(boxes.filter(b => !b.solved)[0]?.player); }} 
          disabled={skipCount <= 0 || gameStatus !== "playing"} 
          className="px-10 py-3 border border-neutral-700 rounded-lg text-[10px] font-black uppercase hover:bg-white hover:text-black transition-all disabled:opacity-20"
        >SKIP ({skipCount})</button>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-4 gap-4">
        {boxes.map((box, i) => (
          <motion.button 
            key={i} 
            onClick={() => handleBoxClick(i)}
            animate={{
              borderColor: wrongIdx === i ? "#f97316" : (highlightIdx === i ? "#ffffff" : "#262626"),
              backgroundColor: box.solved ? "#171717" : "#0a0a0a"
            }}
            whileHover={gameStatus === "playing" ? { scale: 1.02 } : {}}
            className={`h-36 border-2 rounded-xl p-4 flex flex-col items-center justify-center text-center transition-colors`}
          >
            <span className={`block font-black uppercase tracking-tight ${box.solved ? 'text-xs text-neutral-600' : 'text-sm text-white'}`}>
              {box.trait}
            </span>
            {box.solved && (
              <motion.span 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="block mt-2 text-[10px] font-bold tracking-widest text-orange-500 uppercase"
              >
                {box.player}
              </motion.span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};
export default TeamGrid;