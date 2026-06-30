import React, { useState,useEffect } from 'react';
import MainLayout from './MainLayout'; // Az önce oluşturduğumuz layout
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from './store';
import { Search, Key, Brain, Clipboard, TrendingUp, BarChart3, Target, LayoutGrid, Eye, Trophy, Shirt, Tags  } from 'lucide-react';
import ManagerGame from './ManagerGame';
import CareerGame from './CareerGame';
import TriviaGame from './TriviaGame';
import BingoGame from './BingoGame';
import MissingGame from './MissingGame';
import TeamGrid from './TeamGrid';
import CourtCode from './CourtCode';
import FindTeam from './FindTeam';
import Footer from './Footer'; 
import DraftRoulette from './DraftRoulette';
import JerseyGuess from './JerseyGuess';
import MatchGame from './MatchGame';
import { PLAYERS } from './nbaData';// Yeni bileşeni import et
// --- SABİT TANIMLAMALAR ---
const DAILY_PLAYER = {
  name: "Marcus 'The Flash' Jaxon",
  image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=300&auto=format&fit=crop"
};

const ALL_TEAMS = {
  ATL: { name: "HAWKS", color: "from-red-600 to-yellow-400", logo: "https://a.espncdn.com/i/teamlogos/nba/500/atl.png" },
  BOS: { name: "CELTICS", color: "from-green-700 to-green-900", logo: "https://a.espncdn.com/i/teamlogos/nba/500/bos.png" },
  BKN: { name: "NETS", color: "from-gray-700 to-black", logo: "https://a.espncdn.com/i/teamlogos/nba/500/bkn.png" },
  CHA: { name: "HORNETS", color: "from-teal-600 to-purple-800", logo: "https://a.espncdn.com/i/teamlogos/nba/500/cha.png" },
  CHI: { name: "BULLS", color: "from-red-700 to-red-900", logo: "https://a.espncdn.com/i/teamlogos/nba/500/chi.png" },
  CLE: { name: "CAVALIERS", color: "from-red-700 to-yellow-600", logo: "https://a.espncdn.com/i/teamlogos/nba/500/cle.png" },
  DAL: { name: "MAVERICKS", color: "from-blue-700 to-blue-900", logo: "https://a.espncdn.com/i/teamlogos/nba/500/dal.png" },
  DEN: { name: "NUGGETS", color: "from-blue-600 to-yellow-500", logo: "https://a.espncdn.com/i/teamlogos/nba/500/den.png" },
  DET: { name: "PISTONS", color: "from-blue-700 to-red-600", logo: "https://a.espncdn.com/i/teamlogos/nba/500/det.png" },
  GSW: { name: "WARRIORS", color: "from-blue-600 to-yellow-500", logo: "https://a.espncdn.com/i/teamlogos/nba/500/gs.png" },
  HOU: { name: "ROCKETS", color: "from-red-600 to-red-800", logo: "https://a.espncdn.com/i/teamlogos/nba/500/hou.png" },
  IND: { name: "PACERS", color: "from-blue-700 to-yellow-500", logo: "https://a.espncdn.com/i/teamlogos/nba/500/ind.png" },
  LAC: { name: "CLIPPERS", color: "from-red-600 to-blue-700", logo: "https://a.espncdn.com/i/teamlogos/nba/500/lac.png" },
  LAL: { name: "LAKERS", color: "from-yellow-500 to-purple-800", logo: "https://a.espncdn.com/i/teamlogos/nba/500/lal.png" },
  MEM: { name: "GRIZZLIES", color: "from-blue-400 to-blue-800", logo: "https://a.espncdn.com/i/teamlogos/nba/500/mem.png" },
  MIA: { name: "HEAT", color: "from-red-600 to-orange-500", logo: "https://a.espncdn.com/i/teamlogos/nba/500/mia.png" },
  MIL: { name: "BUCKS", color: "from-green-600 to-neutral-800", logo: "https://a.espncdn.com/i/teamlogos/nba/500/mil.png" },
  MIN: { name: "TIMBERWOLVES", color: "from-blue-700 to-gray-500", logo: "https://a.espncdn.com/i/teamlogos/nba/500/min.png" },
  NOP: { name: "PELICANS", color: "from-blue-900 to-gold-500", logo: "https://a.espncdn.com/i/teamlogos/nba/500/no.png" },
  NYK: { name: "KNICKS", color: "from-blue-600 to-orange-500", logo: "https://a.espncdn.com/i/teamlogos/nba/500/ny.png" },
  OKC: { name: "THUNDER", color: "from-blue-500 to-orange-500", logo: "https://a.espncdn.com/i/teamlogos/nba/500/okc.png" },
  ORL: { name: "MAGIC", color: "from-blue-700 to-black", logo: "https://a.espncdn.com/i/teamlogos/nba/500/orl.png" },
  PHI: { name: "76ERS", color: "from-red-600 to-blue-700", logo: "https://a.espncdn.com/i/teamlogos/nba/500/phi.png" },
  PHX: { name: "SUNS", color: "from-orange-500 to-purple-700", logo: "https://a.espncdn.com/i/teamlogos/nba/500/phx.png" },
  POR: { name: "TRAIL BLAZERS", color: "from-red-600 to-gray-800", logo: "https://a.espncdn.com/i/teamlogos/nba/500/por.png" },
  SAC: { name: "KINGS", color: "from-purple-700 to-gray-400", logo: "https://a.espncdn.com/i/teamlogos/nba/500/sac.png" },
  SAS: { name: "SPURS", color: "from-gray-400 to-black", logo: "https://a.espncdn.com/i/teamlogos/nba/500/sa.png" },
  TOR: { name: "RAPTORS", color: "from-red-700 to-black", logo: "https://a.espncdn.com/i/teamlogos/nba/500/tor.png" },
  UTA: { name: "JAZZ", color: "from-yellow-400 to-blue-700", logo: "https://a.espncdn.com/i/teamlogos/nba/500/utah.png" },
  WAS: { name: "WIZARDS", color: "from-blue-700 to-red-600", logo: "https://a.espncdn.com/i/teamlogos/nba/500/wsh.png" }
};

// --- YARDIMCI FONKSİYONLAR ---
const playSound = (type) => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(type === 'click' ? 400 : 880, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.2);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
  } catch (e) {}
};

const BasketballAtmosphere = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-[#060608]" />
    <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: `linear-gradient(90deg, #f97316 1px, transparent 1px), linear-gradient(#f97316 1px, transparent 1px)`, backgroundSize: '120px 120px', transform: 'perspective(500px) rotateX(60deg)', transformOrigin: 'top', marginTop: '100px' }} />
  </div>
);

const NBA_TEAMS = [
  "CELTICS", "NETS", "KNICKS", "76ERS", "RAPTORS",
  "BULLS", "CAVALIERS", "PISTONS", "PACERS", "BUCKS",
  "HAWKS", "HORNETS", "HEAT", "MAGIC", "WIZARDS",
  "NUGGETS", "TIMBERWOLVES", "THUNDER", "BLAZERS", "JAZZ",
  "WARRIORS", "CLIPPERS", "LAKERS", "SUNS", "KINGS",
  "MAVERICKS", "ROCKETS", "GRIZZLIES", "PELICANS", "SPURS"
];

const ArenaDoor = ({ isOpen }) => (
  <motion.div className="fixed inset-0 z-[200] flex pointer-events-none">
    {/* SOL KAPI */}
    <motion.div className="w-1/2 h-full bg-[#060608] border-r-2 border-orange-500 flex items-center justify-end pr-4 relative overflow-hidden" 
            animate={{ x: isOpen ? "-100%" : "0%" }} transition={{ duration: 0.8 }}>
  
  <motion.div 
    className="absolute inset-0 flex items-center whitespace-nowrap opacity-[0.05] w-max"
    animate={{ x: ["0%", "-50%"] }} 
    transition={{ repeat: Infinity, ease: "linear", duration: 40 }}
  >
     {[...NBA_TEAMS, ...NBA_TEAMS].map((team, i) => (
       <span key={i} className="text-[60px] font-black italic uppercase mx-8 shrink-0">{team}</span>
     ))}
  </motion.div>

  <span className="text-6xl font-black italic tracking-tighter text-white z-10">FIVE</span>
</motion.div>

{/* SAĞ KAPI */}
    <motion.div 
      className="w-1/2 h-full bg-[#060608] border-l-2 border-orange-500 flex items-center justify-start pl-4 relative overflow-hidden" 
      animate={{ x: isOpen ? "100%" : "0%" }} 
      transition={{ duration: 0.8 }}
    >
      <motion.div 
        className="absolute flex items-center whitespace-nowrap opacity-[0.05] left-0"
        animate={{ x: ["0%", "-50%"] }} 
        transition={{ repeat: Infinity, ease: "linear", duration: 40 }}
      >
         {[...NBA_TEAMS, ...NBA_TEAMS].map((team, i) => (
           <span key={i} className="text-[60px] font-black italic uppercase mx-8 shrink-0">{team}</span>
         ))}
      </motion.div>
      <span className="text-6xl font-black italic tracking-tighter text-orange-500 z-10">COURT</span>
    </motion.div>
  </motion.div>
);

// --- OYUN LİSTESİ (merkezi tanım — kart, rozet ve "son oynananlar" için ortak kullanılır) ---
const GAMES = [
  { id: "missing", label: "MISSING 5", desc: "Name the 5 players missing from a classic lineup", icon: "Search" },
  { id: "code", label: "COURT CODE", desc: "Crack the hidden team from a string of clues", icon: "Key" },
  { id: "trivia", label: "TRIVIA", desc: "Rapid-fire questions on NBA history and stats", icon: "Brain" },
  { id: "manager", label: "MANAGER", desc: "Build and run your own dream roster", icon: "Clipboard" },
  { id: "career", label: "CAREER", desc: "Trace a player's stat line through their career", icon: "BarChart3" },
  { id: "bingo", label: "BINGO", desc: "Mark off live moments as the action unfolds", icon: "Target" },
  { id: "grid", label: "TEAM GRID", desc: "Place players into the right team squares", icon: "LayoutGrid" },
  { id: "find", label: "FIND TEAM", desc: "Spot the team behind a set of visual clues", icon: "Eye" },
  { id: "draft", label: "DRAFT ROUL.", desc: "Spin the wheel for a random draft pick", icon: "Trophy", isNew: true },
  { id: "jersey", label: "JERSEY #", desc: "Identify the player from their jersey number", icon: "Shirt", isNew: true },
  { id: "match", label: "TAG MATCH", desc: "Tag each player with the trait that fits them", icon: "Tags" }
];

const GAME_ICONS = { Search, Key, Brain, Clipboard, BarChart3, Target, LayoutGrid, Eye, Trophy, Shirt, Tags };

// --- ANA BİLEŞEN ---
function App() {
  const { username, setUsername, totalScore, rank, bestScores } = useGameStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentGame, setCurrentGame] = useState("hub");
  const [doorOpen, setDoorOpen] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [recentGames, setRecentGames] = useState([]);

  // "Son oynananlar" için localStorage'dan oku
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('fc_recent') || '[]');
      setRecentGames(Array.isArray(saved) ? saved : []);
    } catch (e) {}
  }, []);

  // Bugünün öne çıkan oyunu (gün bazlı sabit, her gün değişir)
  const todaysPickId = GAMES[new Date().getDate() % GAMES.length].id;

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleGameSelect = (gameId) => {
    playSound('click');
    setDoorOpen(false);
    setTimeout(() => {
      setCurrentGame(gameId);
      setDoorOpen(true);
      if (gameId !== "hub") {
        setRecentGames(prev => {
          const updated = [gameId, ...prev.filter(id => id !== gameId)].slice(0, 4);
          try { localStorage.setItem('fc_recent', JSON.stringify(updated)); } catch (e) {}
          return updated;
        });
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#060608] text-white relative font-sans">
      <style>{`
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #060608; }
        ::-webkit-scrollbar-thumb { background: rgba(249,115,22,0.35); border-radius: 9999px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(249,115,22,0.6); }
        * { scrollbar-width: thin; scrollbar-color: rgba(249,115,22,0.35) #060608; }
      `}</style>
      <BasketballAtmosphere />
      <ArenaDoor isOpen={doorOpen} />
      
      <div className="relative z-10 max-w-3xl mx-auto min-h-screen flex flex-col pb-10">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loader"
              className="fixed inset-0 flex flex-col items-center justify-center bg-black z-50"
              exit={{ opacity: 0 }}
            >
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: 200 }} 
                transition={{ duration: 1.5 }}
                className="h-1 bg-orange-500"
              />
              <p className="mt-4 text-[10px] tracking-[0.5em] text-white/50 font-mono">INITIALIZING FIVECOURT_OS...</p>
            </motion.div>
          ) : (
            <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-grow">
              {currentGame === "hub" ? (
                <motion.div key="hub" className="p-8 pt-12 flex flex-col gap-3">
                  {/* ... Hub içeriğin ... */}
                  <div className="text-center py-12 px-6">
                    <img 
                      src="/logo.png" 
                      alt="FiveCourt - Build Your Legacy" 
                      className="mx-auto w-32 sm:w-40 mb-4 rounded-3xl drop-shadow-[0_0_25px_rgba(249,115,22,0.25)]"
                    />

                    <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                      <span className="text-[9px] uppercase tracking-[0.2em] text-orange-400 font-bold">{rank}</span>
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                      <span className="text-[9px] uppercase tracking-[0.2em] text-white/50">{totalScore.toLocaleString()} PTS</span>
                    </div>

                    <div className="w-full overflow-hidden bg-zinc-900 border-y border-white/5 py-2 mb-4">
                      <motion.div 
                        className="whitespace-nowrap flex gap-10 text-[9px] font-mono text-orange-500/80 uppercase"
                        animate={{ x: ["100%", "-100%"] }}
                        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                      >
                        <span>10 GAMES LIVE — PICK YOUR COURT</span>
                        <span>BINGO: 5 NEW LEGEND CARDS UNLOCKED</span>
                        <span>3,204 PLAYERS ONLINE RIGHT NOW</span>
                        <span>NEW MODE LOADING — COMING SOON</span>
                        <span>12,480 GAMES PLAYED TODAY</span>
                        <span>TOP TRIVIA STREAK: 47 IN A ROW</span>
                        <span>DRAFT ROULETTE: 1,022 SPINS TODAY</span>
                      </motion.div>
                    </div>
                  </div>
                  
                  {recentGames.length > 0 && (
                    <div className="px-2 mb-1">
                      <p className="text-[9px] uppercase tracking-[0.3em] text-white/30 mb-2">Recently played</p>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {recentGames.map((gid) => {
                          const g = GAMES.find(g => g.id === gid);
                          if (!g) return null;
                          const Icon = GAME_ICONS[g.icon];
                          return (
                            <button
                              key={gid}
                              onClick={() => handleGameSelect(gid)}
                              className="shrink-0 flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 hover:border-orange-500/40 hover:text-orange-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/70"
                            >
                              <Icon size={12} />
                              <span className="text-[10px] font-bold tracking-tight">{g.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {GAMES.map((item) => {
                      const Icon = GAME_ICONS[item.icon];
                      const isTodaysPick = item.id === todaysPickId;
                      return (
                        <button 
                          key={item.id} 
                          onClick={() => handleGameSelect(item.id)} 
                          className={`relative h-40 rounded-2xl p-5 flex flex-col justify-between text-left group overflow-hidden
                                     bg-gradient-to-b from-white/[0.06] to-white/[0.015] 
                                     border ${isTodaysPick ? 'border-orange-500/50' : 'border-white/10'}
                                     shadow-[0_8px_24px_-12px_rgba(0,0,0,0.6)]
                                     transition-all duration-300
                                     hover:border-orange-500/40 hover:from-orange-500/[0.08] hover:to-white/[0.02]
                                     hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-10px_rgba(249,115,22,0.25)]
                                     focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060608]`}
                        >
                          {/* ambient corner glow */}
                          <div className="pointer-events-none absolute -top-10 -right-10 w-24 h-24 rounded-full bg-orange-500/0 group-hover:bg-orange-500/10 blur-2xl transition-all duration-300" />

                          {/* rozetler */}
                          {item.isNew && (
                            <span className="absolute top-3 right-3 text-[8px] font-black tracking-wider px-1.5 py-0.5 rounded-full bg-orange-500 text-black">NEW</span>
                          )}
                          {isTodaysPick && !item.isNew && (
                            <span className="absolute top-3 right-3 text-[8px] font-black tracking-wider px-1.5 py-0.5 rounded-full bg-white/10 text-orange-400 border border-orange-500/40">TODAY'S PICK</span>
                          )}

                          <div className="w-10 h-10 rounded-xl flex items-center justify-center
                                           bg-white/5 border border-white/10 text-white/60
                                           group-hover:bg-orange-500/15 group-hover:border-orange-500/40 group-hover:text-orange-400
                                           transition-all duration-300">
                            <Icon size={20} />
                          </div>

                          <div className="relative flex items-end justify-between">
                            <div>
                              <span className="block font-black tracking-tighter text-white/90 group-hover:text-white">{item.label}</span>
                              <span className="block mt-1 text-[11px] leading-snug text-white/35 group-hover:text-white/55 transition-colors">{item.desc}</span>
                            </div>
                            {bestScores?.[item.id] > 0 && (
                              <span className="shrink-0 text-[9px] font-bold text-orange-400/80 whitespace-nowrap ml-2">
                                BEST {bestScores[item.id]}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="game" className="p-6">
                  <div className="mb-8 border-b border-white/10 pb-4">
                    <h1 onClick={() => handleGameSelect("hub")} className="group text-xl font-black italic tracking-tighter cursor-pointer">
                      <span className="text-orange-500">FIVE</span>
                      <span className="text-white transition-colors duration-200 group-hover:text-orange-500">COURT</span>
                    </h1>
                  </div>
                  
                  {currentGame === "trivia" && <TriviaGame />}
                  {currentGame === "manager" && <ManagerGame />}
                  {currentGame === "career" && <CareerGame />}
                  {currentGame === "missing" && <MissingGame />}
                  {currentGame === "bingo" && <BingoGame />}
                  {currentGame === "code" && <CourtCode />}
                  {currentGame === "grid" && selectedTeam && <TeamGrid teamKey={selectedTeam} onBack={() => setSelectedTeam(null)} />}
                  {currentGame === "find" && <FindTeam teams={ALL_TEAMS} />}
                  {currentGame === "draft" && <DraftRoulette />}
                  {currentGame === "jersey" && <JerseyGuess />}
                  {currentGame === "match" && <MatchGame />}
                  {/* Grid mantığın */}
                  {currentGame === "grid" && !selectedTeam && (
                    <div className="text-center"><h2 className="text-2xl font-black mb-8 uppercase">TAKIMINI SEÇ</h2>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.keys(ALL_TEAMS).map(key => <button key={key} onClick={() => setSelectedTeam(key)} className="h-24 bg-zinc-900 rounded-2xl font-black hover:bg-orange-600">{ALL_TEAMS[key].name}</button>)}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Buraya Eklendi */}
        <Footer />
      </div>
    </div>
  );
};
export default App;