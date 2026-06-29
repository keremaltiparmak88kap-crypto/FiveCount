import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- MAÇ VERİTABANI (20 MAÇ) ---
const MATCH_POOL = [
  { id: 1, matchup: "GSW vs CLE", date: "2016 FINALS", home: "WARRIORS", away: "CAVALIERS", homePlayers: [{n:"Curry", s:"30", r:"5", a:"6"}, {n:"Klay", s:"22", r:"3", a:"2"}, {n:"Barnes", s:"11", r:"4", a:"1"}, {n:"Draymond", s:"14", r:"9", a:"7"}, {n:"Bogut", s:"5", r:"7", a:"2"}], awayPlayers: ["Irving", "Smith", "James", "Love", "Thompson"], missing: "Bogut", options: ["Bogut", "Ezeli", "Speights", "Livingston"] },
  { id: 2, matchup: "LAL vs BOS", date: "2010 FINALS", home: "LAKERS", away: "CELTICS", homePlayers: [{n:"Fisher", s:"7", r:"2", a:"2"}, {n:"Kobe", s:"28", r:"5", a:"4"}, {n:"Artest", s:"10", r:"4", a:"1"}, {n:"Gasol", s:"18", r:"11", a:"3"}, {n:"Bynum", s:"10", r:"7", a:"1"}], awayPlayers: ["Rondo", "Allen", "Pierce", "KG", "Perkins"], missing: "Gasol", options: ["Gasol", "Odom", "Walton", "Brown"] },
  { id: 3, matchup: "MIA vs SAS", date: "2013 FINALS", home: "HEAT", away: "SPURS", homePlayers: [{n:"Chalmers", s:"8", r:"2", a:"3"}, {n:"Wade", s:"19", r:"5", a:"4"}, {n:"Battier", s:"6", r:"2", a:"0"}, {n:"LeBron", s:"26", r:"8", a:"7"}, {n:"Bosh", s:"11", r:"6", a:"1"}], awayPlayers: ["Parker", "Green", "Leonard", "Duncan", "Splitter"], missing: "Battier", options: ["Battier", "Haslem", "Miller", "Allen"] },
  { id: 4, matchup: "CHI vs UTA", date: "1998 FINALS", home: "BULLS", away: "JAZZ", homePlayers: [{n:"Harper", s:"5", r:"1", a:"1"}, {n:"Jordan", s:"33", r:"4", a:"2"}, {n:"Pippen", s:"15", r:"6", a:"4"}, {n:"Rodman", s:"3", r:"8", a:"1"}, {n:"Longley", s:"6", r:"3", a:"1"}], awayPlayers: ["Stockton", "Hornacek", "Russell", "Malone", "Ostertag"], missing: "Longley", options: ["Longley", "Kerr", "Kukoc", "Wennington"] },
  { id: 5, matchup: "DET vs LAL", date: "2004 FINALS", home: "PISTONS", away: "LAKERS", homePlayers: [{n:"Billups", s:"21", r:"3", a:"5"}, {n:"Hamilton", s:"21", r:"3", a:"4"}, {n:"Prince", s:"10", r:"6", a:"1"}, {n:"Wallace", s:"13", r:"7", a:"1"}, {n:"Wallace", s:"10", r:"9", a:"1"}], awayPlayers: ["Payton", "Kobe", "George", "Malone", "Shaq"], missing: "Prince", options: ["Prince", "Okur", "Campbell", "Hunter"] },
  { id: 6, matchup: "SAS vs DET", date: "2005 FINALS", home: "SPURS", away: "PISTONS", homePlayers: [{n:"Parker", s:"13", r:"2", a:"4"}, {n:"Ginobili", s:"18", r:"5", a:"3"}, {n:"Bowen", s:"8", r:"2", a:"1"}, {n:"Duncan", s:"20", r:"14", a:"2"}, {n:"Mohammed", s:"7", r:"5", a:"0"}], awayPlayers: ["Billups", "Hamilton", "Prince", "Wallace", "Wallace"], missing: "Mohammed", options: ["Mohammed", "Barry", "Udrih", "Horry"] },
  { id: 7, matchup: "DAL vs MIA", date: "2011 FINALS", home: "MAVS", away: "HEAT", homePlayers: [{n:"Kidd", s:"7", r:"4", a:"6"}, {n:"Stevenson", s:"7", r:"1", a:"0"}, {n:"Marion", s:"13", r:"6", a:"2"}, {n:"Nowitzki", s:"26", r:"9", a:"2"}, {n:"Chandler", s:"9", r:"9", a:"0"}], awayPlayers: ["Bibby", "Wade", "James", "Bosh", "Anthony"], missing: "Stevenson", options: ["Stevenson", "Terry", "Barea", "Haywood"] },
  { id: 8, matchup: "BOS vs LAL", date: "2008 FINALS", home: "CELTICS", away: "LAKERS", homePlayers: [{n:"Rondo", s:"9", r:"3", a:"6"}, {n:"Allen", s:"20", r:"4", a:"2"}, {n:"Pierce", s:"21", r:"4", a:"6"}, {n:"Garnett", s:"18", r:"13", a:"3"}, {n:"Perkins", s:"6", r:"6", a:"0"}], awayPlayers: ["Fisher", "Kobe", "Radmanovic", "Odom", "Gasol"], missing: "Perkins", options: ["Perkins", "Powe", "House", "Posey"] },
  { id: 9, matchup: "HOU vs NYK", date: "1994 FINALS", home: "ROCKETS", away: "KNICKS", homePlayers: [{n:"Smith", s:"9", r:"2", a:"3"}, {n:"Maxwell", s:"13", r:"3", a:"2"}, {n:"Horry", s:"10", r:"5", a:"3"}, {n:"Thorpe", s:"9", r:"9", a:"1"}, {n:"Olajuwon", s:"26", r:"9", a:"3"}], awayPlayers: ["Harper", "Starks", "Oakley", "Williams", "Ewing"], missing: "Thorpe", options: ["Thorpe", "Cassell", "Bullard", "Herrera"] },
  { id: 10, matchup: "LAL vs PHI", date: "2001 FINALS", home: "LAKERS", away: "76ERS", homePlayers: [{n:"Fisher", s:"10", r:"3", a:"2"}, {n:"Kobe", s:"24", r:"7", a:"5"}, {n:"Fox", s:"8", r:"4", a:"2"}, {n:"Grant", s:"6", r:"7", a:"1"}, {n:"Shaq", s:"33", r:"15", a:"4"}], awayPlayers: ["Iverson", "McKie", "Lynch", "Hill", "Mutombo"], missing: "Fox", options: ["Fox", "Horry", "Shaw", "Madsen"] },
  { id: 11, matchup: "CLE vs GSW", date: "2016 FINALS", home: "CAVALIERS", away: "WARRIORS", homePlayers: [{n:"Irving", s:"27", r:"3", a:"3"}, {n:"Smith", s:"10", r:"2", a:"1"}, {n:"James", s:"29", r:"11", a:"8"}, {n:"Love", s:"8", r:"6", a:"1"}, {n:"Thompson", s:"10", r:"10", a:"0"}], awayPlayers: ["Curry", "Klay", "Barnes", "Draymond", "Bogut"], missing: "Smith", options: ["Smith", "Jefferson", "Frye", "Dellavedova"] },
  { id: 12, matchup: "TOR vs GSW", date: "2019 FINALS", home: "RAPTORS", away: "WARRIORS", homePlayers: [{n:"Lowry", s:"16", r:"4", a:"7"}, {n:"VanVleet", s:"14", r:"2", a:"2"}, {n:"Green", s:"7", r:"3", a:"1"}, {n:"Leonard", s:"28", r:"9", a:"4"}, {n:"Siakam", s:"19", r:"7", a:"3"}], awayPlayers: ["Curry", "Thompson", "Iguodala", "Green", "Looney"], missing: "Siakam", options: ["Siakam", "Ibaka", "Powell", "Gasol"] },
  { id: 13, matchup: "MIL vs PHX", date: "2021 FINALS", home: "BUCKS", away: "SUNS", homePlayers: [{n:"Holiday", s:"16", r:"6", a:"9"}, {n:"Middleton", s:"24", r:"6", a:"5"}, {n:"Tucker", s:"4", r:"3", a:"1"}, {n:"Giannis", s:"35", r:"13", a:"5"}, {n:"Lopez", s:"13", r:"5", a:"0"}], awayPlayers: ["Paul", "Booker", "Bridges", "Crowder", "Ayton"], missing: "Tucker", options: ["Tucker", "Portis", "Connaughton", "Forbes"] },
  { id: 14, matchup: "LAL vs ORL", date: "2009 FINALS", home: "LAKERS", away: "MAGIC", homePlayers: [{n:"Fisher", s:"11", r:"2", a:"2"}, {n:"Kobe", s:"32", r:"5", a:"7"}, {n:"Ariza", s:"11", r:"6", a:"1"}, {n:"Gasol", s:"18", r:"9", a:"2"}, {n:"Bynum", s:"6", r:"4", a:"0"}], awayPlayers: ["Nelson", "Lee", "Turkoglu", "Lewis", "Howard"], missing: "Ariza", options: ["Ariza", "Odom", "Vujacic", "Farmar"] },
  { id: 15, matchup: "SAS vs MIA", date: "2014 FINALS", home: "SPURS", away: "HEAT", homePlayers: [{n:"Parker", s:"18", r:"2", a:"4"}, {n:"Green", s:"9", r:"3", a:"1"}, {n:"Leonard", s:"17", r:"6", a:"2"}, {n:"Duncan", s:"15", r:"10", a:"2"}, {n:"Splitter", s:"5", r:"3", a:"1"}], awayPlayers: ["Chalmers", "Wade", "James", "Lewis", "Bosh"], missing: "Splitter", options: ["Splitter", "Diaw", "Mills", "Belinelli"] },
  { id: 16, matchup: "PHX vs CHI", date: "1993 FINALS", home: "SUNS", away: "BULLS", homePlayers: [{n:"Johnson", s:"20", r:"5", a:"6"}, {n:"Ainge", s:"7", r:"2", a:"2"}, {n:"Dumas", s:"15", r:"4", a:"1"}, {n:"Chambers", s:"10", r:"4", a:"1"}, {n:"West", s:"9", r:"5", a:"1"}], awayPlayers: ["Harper", "Jordan", "Pippen", "Grant", "Cartwright"], missing: "Dumas", options: ["Dumas", "Majerle", "Ceballos", "Williams"] },
  { id: 17, matchup: "UTA vs CHI", date: "1997 FINALS", home: "JAZZ", away: "BULLS", homePlayers: [{n:"Stockton", s:"15", r:"2", a:"8"}, {n:"Hornacek", s:"12", r:"3", a:"2"}, {n:"Russell", s:"10", r:"4", a:"1"}, {n:"Malone", s:"23", r:"10", a:"3"}, {n:"Ostertag", s:"4", r:"6", a:"0"}], awayPlayers: ["Harper", "Jordan", "Pippen", "Rodman", "Longley"], missing: "Ostertag", options: ["Ostertag", "Morris", "Carr", "Anderson"] },
  { id: 18, matchup: "GSW vs BOS", date: "2022 FINALS", home: "WARRIORS", away: "CELTICS", homePlayers: [{n:"Curry", s:"31", r:"6", a:"5"}, {n:"Thompson", s:"17", r:"3", a:"2"}, {n:"Wiggins", s:"18", r:"8", a:"2"}, {n:"Green", s:"6", r:"8", a:"6"}, {n:"Looney", s:"5", r:"7", a:"2"}], awayPlayers: ["Smart", "Brown", "Tatum", "Williams", "Horford"], missing: "Looney", options: ["Looney", "Porter", "Payton", "Bjelica"] },
  { id: 19, matchup: "DEN vs MIA", date: "2023 FINALS", home: "NUGGETS", away: "HEAT", homePlayers: [{n:"Murray", s:"21", r:"6", a:"10"}, {n:"Pope", s:"7", r:"3", a:"1"}, {n:"Porter", s:"9", r:"8", a:"0"}, {n:"Gordon", s:"14", r:"7", a:"2"}, {n:"Jokic", s:"30", r:"14", a:"7"}], awayPlayers: ["Vincent", "Strus", "Butler", "Love", "Adebayo"], missing: "Pope", options: ["Pope", "Brown", "Braun", "Green"] },
  { id: 20, matchup: "BOS vs DAL", date: "2024 FINALS", home: "CELTICS", away: "MAVS", homePlayers: [{n:"Holiday", s:"14", r:"7", a:"3"}, {n:"White", s:"13", r:"4", a:"3"}, {n:"Brown", s:"20", r:"5", a:"5"}, {n:"Tatum", s:"22", r:"7", a:"7"}, {n:"Porzingis", s:"12", r:"4", a:"1"}], awayPlayers: ["Doncic", "Irving", "Jones", "Washington", "Gafford"], missing: "Porzingis", options: ["Porzingis", "Horford", "Pritchard", "Hauser"] }
];

const MissingGame = () => {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [highScore, setHighScore] = useState(parseInt(localStorage.getItem('fc_high_score')) || 0);
  const [status, setStatus] = useState('playing'); // playing, correct, wrong
  const timerRef = useRef(null);
  const match = MATCH_POOL[idx];

  // Zamanlayıcıyı Başlat
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTime(t => t + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // Rekor Güncelleme
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('fc_high_score', score);
    }
  }, [score]);

  const handleGuess = (opt) => {
    if (status !== 'playing') return;
    
    if (opt === match.missing) {
      setScore(s => s + 100);
      setStatus('correct');
    } else {
      setStatus('wrong');
    }
    
    setTimeout(() => { 
        setIdx((i) => (i + 1) % MATCH_POOL.length); 
        setStatus('playing'); 
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-black min-h-screen text-white font-sans">
      
      {/* HEADER: STATS VE TIMER */}
      <div className="flex justify-between items-center mb-12 border-b border-white/10 pb-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">MISSING PLAYER</h1>
          <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest mt-1">{match.date} · {match.matchup}</p>
        </div>
        
        <div className="flex gap-10 items-center">
            <div className="text-right">
                <div className="text-[9px] uppercase tracking-widest opacity-50 text-white">Elapsed Time</div>
                <div className="text-3xl font-mono font-bold text-white tracking-widest">{formatTime(time)}</div>
            </div>
            <div className="text-right">
                <div className="text-[9px] uppercase tracking-widest opacity-50 text-white">Score</div>
                <div className="text-3xl font-black text-white">{score}</div>
                <div className="text-[9px] uppercase text-amber-500 font-bold">BEST: {highScore}</div>
            </div>
        </div>
      </div>

      {/* GAME AREA */}
      <div className="space-y-12">
        <div className="flex justify-center gap-2">
            {match.awayPlayers.map((name, i) => (
                <div key={i} className="px-4 py-2 bg-neutral-900/50 rounded-lg text-[10px] uppercase tracking-wider font-bold border border-white/5 text-neutral-400">
                    {name}
                </div>
            ))}
        </div>

        <div className="grid grid-cols-5 gap-4">
            <AnimatePresence mode="wait">
                {match.homePlayers.map((p, i) => (
                    <motion.div 
                        key={`${match.id}-${i}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`h-40 rounded-2xl border-2 flex flex-col items-center justify-center p-4 transition-all duration-300 ${
                            p.n === match.missing && status === 'correct' ? 'border-green-500 bg-green-900/20' : 
                            p.n === match.missing && status === 'wrong' ? 'border-red-600 bg-red-900/20' : 
                            'border-white/5 bg-zinc-900/30'
                        }`}
                    >
                        <span className="text-xs font-black uppercase opacity-60">
                            {p.n === match.missing && status !== 'correct' ? "???" : p.n}
                        </span>
                        {p.n !== match.missing && (
                            <div className="mt-4 grid grid-cols-3 gap-2 w-full text-center">
                                <span className="text-[8px] font-bold text-orange-500">P:{p.s}</span>
                                <span className="text-[8px] font-bold text-orange-500">R:{p.r}</span>
                                <span className="text-[8px] font-bold text-orange-500">A:{p.a}</span>
                            </div>
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>

        <div className="grid grid-cols-4 gap-4">
            {match.options.map((opt) => (
                <button 
                    key={opt}
                    onClick={() => handleGuess(opt)}
                    className={`py-6 rounded-xl font-black text-sm uppercase tracking-widest border transition-all ${
                        status === 'playing' ? 'bg-zinc-800 hover:bg-zinc-700 border-white/10' :
                        opt === match.missing ? 'bg-green-600 border-green-400' : 'bg-zinc-900 opacity-50 border-transparent'
                    }`}
                >
                    {opt}
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default MissingGame;