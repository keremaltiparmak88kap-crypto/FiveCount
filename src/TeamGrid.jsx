import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

const TeamGrid = ({ teamKey, onBack }) => {
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
  const timerRef = useRef(null);

  const initGame = (key) => {
    const fullRoster = ALL_TEAMS[key] || [];
    const shuffled = [...fullRoster].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 12);
    
    setBoxes(selected.map(p => ({ player: p, trait: PLAYER_TRAITS[p] || "N/A", solved: false })));
    setTarget(selected[Math.floor(Math.random() * selected.length)]);
    
    // Reset
    setLives(3); setSkipCount(5); setHintUsed(false); setWrongIdx(null); setHighlightIdx(null);
    setGameStatus("playing");
    setStats({ correct: 0, wrong: 0, hints: 0, time: 0 });
    
    // Zamanlayıcıyı Başlat
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setStats(prev => ({ ...prev, time: prev.time + 1 }));
    }, 1000);
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

  return (
    <div className="max-w-4xl mx-auto p-8 text-white min-h-screen bg-black font-sans relative overflow-hidden">
      
      {/* OYUN SONU PANELİ (Özellik 3) */}
      <AnimatePresence>
        {gameStatus !== "playing" && (
          <motion.div 
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-10 text-center"
          >
            <h2 className={`text-6xl font-black mb-2 ${gameStatus === "winner" ? "text-green-500" : "text-red-500"}`}>
              {gameStatus === "winner" ? "MISSION ACCOMPLISHED" : "MISSION FAILED"}
            </h2>
            <p className="text-neutral-500 uppercase tracking-[0.3em] mb-12">Performance Summary</p>
            
            <div className="grid grid-cols-2 gap-8 mb-16 w-full max-w-md">
              <div className="bg-neutral-900 p-6 rounded-2xl border border-white/5">
                <p className="text-[10px] text-neutral-500 uppercase mb-1">Total Time</p>
                <p className="text-2xl font-bold">{formatTime(stats.time)}</p>
              </div>
              <div className="bg-neutral-900 p-6 rounded-2xl border border-white/5">
                <p className="text-[10px] text-neutral-500 uppercase mb-1">Accuracy</p>
                <p className="text-2xl font-bold">%{Math.round((stats.correct / (stats.correct + stats.wrong || 1)) * 100)}</p>
              </div>
            </div>

            <button 
              onClick={() => initGame(teamKey)}
              className="bg-white text-black px-12 py-4 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform"
            >
              Play Again
            </button>
            <button onClick={onBack} className="mt-6 text-neutral-500 text-xs uppercase tracking-widest hover:text-white transition">Exit to Menu</button>
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