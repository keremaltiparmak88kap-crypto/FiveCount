import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PLAYERS } from './nbaData';

const JerseyGuess = () => {
  const [mode, setMode] = useState('NUMBER_MODE'); 
  const [current, setCurrent] = useState(PLAYERS[Math.floor(Math.random() * PLAYERS.length)]);
  const [guess, setGuess] = useState("");
  const [status, setStatus] = useState(null); 
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [streak, setStreak] = useState(0); 
  const inputRef = useRef(null);

  // Logo URL'sini en garantili NBA CDN formatına çeviriyoruz
  const getTeamLogoUrl = (team) => {
  const rawUrl = `https://cdn.nba.com/logos/nba/primary/L/${team.toUpperCase()}.svg`;
  // Proxy servisi üzerinden resmi çağırıyoruz
  return `https://images.weserv.nl/?url=${encodeURIComponent(rawUrl)}`;
};

  const getNewPlayer = () => PLAYERS[Math.floor(Math.random() * PLAYERS.length)];

  const handleVerify = (e) => {
    e.preventDefault();
    if (isTransitioning) return;

    const isCorrect = mode === 'NUMBER_MODE' 
      ? parseInt(guess) === parseInt(current.jersey) 
      : guess.trim().toUpperCase() === current.name.toUpperCase();

    if (isCorrect) {
      setStatus("correct");
      setStreak(prev => prev + 1);
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrent(getNewPlayer());
        setGuess("");
        setStatus(null);
        setIsTransitioning(false);
      }, 1500);
    } else {
      setStatus("wrong");
      setStreak(0);
      setTimeout(() => setStatus(null), 1000);
    }
  };

  const toggleMode = () => {
    setMode(prev => prev === 'NUMBER_MODE' ? 'NAME_MODE' : 'NUMBER_MODE');
    setCurrent(getNewPlayer());
    setGuess("");
    setStatus(null);
  };

  return (
    <div className="relative p-8 bg-zinc-950 rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.9)] min-h-[620px] flex flex-col items-center overflow-hidden">
      
      {/* Üst Panel: Değişmedi */}
      <div className="w-full flex justify-between items-start mb-8 pb-4 border-b border-white/5 z-20">
        <div className="flex flex-col gap-1">
          <h2 className="text-[10px] font-black tracking-[0.3em] text-white/30 uppercase italic">
            FiveCourt {mode === 'NUMBER_MODE' ? 'Jersey Hunter' : 'Identity Finder'}
          </h2>
          <span className="text-[9px] text-orange-500 font-bold tracking-widest">STREAK: {streak}</span>
        </div>
        <button 
          onClick={toggleMode}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold text-white/60 hover:bg-orange-600 hover:text-white transition-all active:scale-95"
        >
          SWITCH TO {mode === 'NUMBER_MODE' ? 'NAME MODE' : 'NUMBER MODE'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!isTransitioning ? (
          <motion.div key="game" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full z-10">
            
            {/* OYUNCU KARTI ALANI */}
            <div className="mb-10 w-full h-48 flex items-center justify-center relative">
              
              {mode === 'NUMBER_MODE' ? (
                // 1. MOD: İsim arkasında logo (z-index ile geriye attık)
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                   {/* Logo burada: En arka katman (z-0), hafif şeffaf */}
                   <motion.img 
                      key={current.team}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.15 }}
                      src={getTeamLogoUrl(current.team)}
                      alt="Logo"
                      className="absolute z-0 w-64 h-64 object-contain grayscale"
                   />
                   
                   <div className="z-10 text-center">
                      <h3 className="text-4xl font-black text-white uppercase tracking-tighter drop-shadow-[0_2px_10px_rgba(0,0,0,1)]">
                        {current.name}
                      </h3>
                      <p className="text-[11px] text-white/40 mt-3 tracking-[0.5em] uppercase font-bold">
                        {current.team} | OVR {current.ovr}
                      </p>
                   </div>
                </div>
              ) : (
                // 2. MOD: Numara kutusu (Aynı bıraktım)
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-36 h-48 rounded-3xl flex items-center justify-center shadow-2xl relative overflow-hidden"
                  style={{ 
                    backgroundColor: current.color, 
                    boxShadow: `0 20px 40px ${current.color}30` 
                  }}
                >
                  <span className="text-7xl font-black text-white italic drop-shadow-2xl z-10">
                    #{current.jersey}
                  </span>
                </motion.div>
              )}
            </div>

            {/* Giriş Formu: Aynı bıraktım */}
            <form onSubmit={handleVerify} className="w-full max-w-xs flex flex-col gap-5">
              <div className="relative">
                <input
                  ref={inputRef}
                  type={mode === 'NUMBER_MODE' ? 'number' : 'text'}
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  placeholder={mode === 'NUMBER_MODE' ? "Guess Jersey #..." : "Enter Player Name..."}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-center font-bold text-xl text-white
                            focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all
                            placeholder:text-white/10"
                />
                {status === 'wrong' && (
                  <motion.div initial={{ x: -10 }} animate={{ x: 0 }} className="absolute -bottom-7 inset-x-0 text-center">
                    <span className="text-red-500 text-[10px] font-black uppercase tracking-widest">Data Mismatch</span>
                  </motion.div>
                )}
              </div>
              <button className="p-4 bg-orange-600 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] text-white 
                                hover:bg-orange-500 active:scale-95 transition-all duration-300">
                VERIFY MATCH
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div key="transition" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[400px]">
            <h3 className="text-4xl font-black text-white mb-4 italic tracking-widest">SUCCESS</h3>
            <div className="w-64 h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
              <motion.div 
                className="h-full rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)]" 
                style={{ backgroundColor: current.color }}
                initial={{ width: 0 }}
                animate={{ width: "100%" }} 
                transition={{ duration: 1.2, ease: "circOut" }} 
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JerseyGuess;