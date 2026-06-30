import React, { useState,useEffect } from 'react';
import MainLayout from './MainLayout'; // Az önce oluşturduğumuz layout
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from './store';
import { Search, Key, Brain, Clipboard, TrendingUp, BarChart3, Target, LayoutGrid, Eye, Trophy, Shirt  } from 'lucide-react';
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

// --- ANA BİLEŞEN ---
function App() {
  const { username, setUsername } = useGameStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentGame, setCurrentGame] = useState("hub");
  const [doorOpen, setDoorOpen] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);

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
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#060608] text-white relative font-sans">
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
                <motion.div key="hub" className="p-8 pt-12 flex flex-col gap-8">
                  {/* ... Hub içeriğin ... */}
                  <div className="text-center py-12 px-6">
                    <h1 className="text-6xl font-black italic tracking-tighter mb-2">FIVE<span className="text-orange-500">COURT</span></h1>
                    <p className="text-[10px] text-white/30 uppercase tracking-[0.4em] mb-10">PROFESSIONAL BASKETBALL ANALYTICS ENGINE</p>

                    <div className="w-full overflow-hidden bg-zinc-900 border-y border-white/5 py-2 mb-10">
                      <motion.div 
                        className="whitespace-nowrap flex gap-10 text-[9px] font-mono text-orange-500/80 uppercase"
                        animate={{ x: ["100%", "-100%"] }}
                        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                      >
                        <span>LAKERS CLINCH WESTERN CONFERENCE FINALS SEED</span>
                        <span>DATA SYNC COMPLETE: 2024 FINALS ARCHIVE LOADED</span>
                        <span>NEW ANALYTICAL MODULES ONLINE</span>
                      </motion.div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {[ 
                      {id:"missing", label:"MISSING 5", icon:<Search />},
                      {id:"code", label:"COURT CODE", icon:<Key />}, 
                      {id:"trivia", label:"TRIVIA", icon:<Brain />}, 
                      {id:"manager", label:"MANAGER", icon:<Clipboard />}, 
                      {id:"career", label:"CAREER", icon:<BarChart3 />}, 
                      {id:"bingo", label:"BINGO", icon:<Target />}, 
                      {id:"grid", label:"TEAM GRID", icon:<LayoutGrid />},
                      {id:"find", label:"FIND TEAM", icon:<Eye />},
                      {id:"draft", label:"DRAFT ROUL.", icon:<Trophy />},
                      {id:"jersey", label:"JERSEY #", icon:<Shirt />}
                    ].map((item) => (
                      <button 
                        key={item.id} 
                        onClick={() => handleGameSelect(item.id)} 
                        className="h-32 rounded-3xl bg-white/5 border border-white/10 p-6 flex flex-col justify-between hover:bg-orange-600/20 hover:border-orange-500/50 transition-all text-left group"
                      >
                        <div className="text-2xl text-white/70 group-hover:text-orange-500 transition-colors">
                          {item.icon}
                        </div>
                        <span className="font-black tracking-tighter text-white/90">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="game" className="p-6">
                  <div className="mb-8 border-b border-white/10 pb-4">
                    <h1 onClick={() => handleGameSelect("hub")} className="text-xl font-black italic tracking-tighter cursor-pointer hover:text-orange-500">
                      <span className="text-orange-500">FIVE</span>COURT
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