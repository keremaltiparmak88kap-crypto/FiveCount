import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from './store';
import { getDailyItem } from './dailyRotation';

// 40 yıllık gerçek NBA draft 1 numara seçimleri (1985-2024)
const DRAFT_DATA = [
  { year: 2024, pick: 1, name: "ZACCHARIE RISACHER", team: "atl" },
  { year: 2023, pick: 1, name: "VICTOR WEMBANYAMA", team: "sas" },
  { year: 2022, pick: 1, name: "PAOLO BANCHERO", team: "orl" },
  { year: 2021, pick: 1, name: "CADE CUNNINGHAM", team: "det" },
  { year: 2020, pick: 1, name: "ANTHONY EDWARDS", team: "min" },
  { year: 2019, pick: 1, name: "ZION WILLIAMSON", team: "nop" },
  { year: 2018, pick: 1, name: "DEANDRE AYTON", team: "phx" },
  { year: 2017, pick: 1, name: "MARKELLE FULTZ", team: "phi" },
  { year: 2016, pick: 1, name: "BEN SIMMONS", team: "phi" },
  { year: 2015, pick: 1, name: "KARL-ANTHONY TOWNS", team: "min" },
  { year: 2014, pick: 1, name: "ANDREW WIGGINS", team: "cle" },
  { year: 2013, pick: 1, name: "ANTHONY BENNETT", team: "cle" },
  { year: 2012, pick: 1, name: "ANTHONY DAVIS", team: "nop" },
  { year: 2011, pick: 1, name: "KYRIE IRVING", team: "cle" },
  { year: 2010, pick: 1, name: "JOHN WALL", team: "was" },
  { year: 2009, pick: 1, name: "BLAKE GRIFFIN", team: "lac" },
  { year: 2008, pick: 1, name: "DERRICK ROSE", team: "chi" },
  { year: 2007, pick: 1, name: "GREG ODEN", team: "por" },
  { year: 2006, pick: 1, name: "ANDREA BARGNANI", team: "tor" },
  { year: 2005, pick: 1, name: "ANDREW BOGUT", team: "mil" },
  { year: 2004, pick: 1, name: "DWIGHT HOWARD", team: "orl" },
  { year: 2003, pick: 1, name: "LEBRON JAMES", team: "cle" },
  { year: 2002, pick: 1, name: "YAO MING", team: "hou" },
  { year: 2001, pick: 1, name: "KWAME BROWN", team: "was" },
  { year: 2000, pick: 1, name: "KENYON MARTIN", team: "bkn" },
  { year: 1999, pick: 1, name: "ELTON BRAND", team: "chi" },
  { year: 1998, pick: 1, name: "MICHAEL OLOWOKANDI", team: "lac" },
  { year: 1997, pick: 1, name: "TIM DUNCAN", team: "sas" },
  { year: 1996, pick: 1, name: "ALLEN IVERSON", team: "phi" },
  { year: 1995, pick: 1, name: "JOE SMITH", team: "gsw" },
  { year: 1994, pick: 1, name: "GLENN ROBINSON", team: "mil" },
  { year: 1993, pick: 1, name: "CHRIS WEBBER", team: "orl" },
  { year: 1992, pick: 1, name: "SHAQUILLE ONEAL", team: "orl" },
  { year: 1991, pick: 1, name: "LARRY JOHNSON", team: "cha" },
  { year: 1990, pick: 1, name: "DERRICK COLEMAN", team: "bkn" },
  { year: 1989, pick: 1, name: "PERVIS ELLISON", team: "sac" },
  { year: 1988, pick: 1, name: "DANNY MANNING", team: "lac" },
  { year: 1987, pick: 1, name: "DAVID ROBINSON", team: "sas" },
  { year: 1986, pick: 1, name: "BRAD DAUGHERTY", team: "cle" },
  { year: 1985, pick: 1, name: "PATRICK EWING", team: "nyk" }
];

const DraftRoulette = () => {
  const addScore = useGameStore((state) => state.addScore);
  const [current, setCurrent] = useState(() => getDailyItem(DRAFT_DATA));
  const [isDailyPick, setIsDailyPick] = useState(true); // sadece açılıştaki ilk soru için "TODAY'S PICK" rozeti
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState(null);
  const [selected, setSelected] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    generateOptions(current.name);
  }, [current]);

  const generateOptions = (correctName) => {
    const pool = DRAFT_DATA.map(d => d.name).filter(n => n !== correctName);
    const shuffled = [...pool].sort(() => 0.5 - Math.random()).slice(0, 5);
    setOptions([...shuffled, correctName].sort(() => 0.5 - Math.random()));
  };

  const handleGuess = (name) => {
    if (status || isTransitioning) return;
    setSelected(name);

    if (name === current.name) {
      setStatus("correct");
      setScore(s => s + 200);
      addScore(200, "draft");
      setIsTransitioning(true);
      setTimeout(() => {
        const next = DRAFT_DATA[Math.floor(Math.random() * DRAFT_DATA.length)];
        setCurrent(next);
        setStatus(null);
        setSelected(null);
        setIsTransitioning(false);
        setIsDailyPick(false);
      }, 2000);
    } else {
      setStatus("wrong");
      setTimeout(() => { setStatus(null); setSelected(null); }, 1000);
    }
  };

  return (
    <div className="relative p-6 bg-zinc-900 rounded-3xl border border-white/10 text-center min-h-[420px] flex flex-col">
      {/* Sabit Başlık */}
      <div className="flex justify-between text-[10px] text-white/40 uppercase tracking-widest mb-8">
        <span>Draft Roulette</span>
        <span>Score: {score}</span>
      </div>

      <AnimatePresence mode="wait">
        {!isTransitioning ? (
          <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-grow flex flex-col justify-center">
            <h2 className="text-xl font-black mb-8 text-orange-500 uppercase">
              {isDailyPick && <span className="block text-emerald-400 text-[10px] tracking-widest mb-2">★ TODAY'S PICK</span>}
              WHO WAS THE {current.year} #1 PICK?
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {options.map((opt) => (
                <button 
                  key={opt}
                  onClick={() => handleGuess(opt)}
                  className={`p-4 rounded-xl border border-white/10 font-bold text-[10px] transition-all 
                    ${status === 'correct' && opt === current.name ? 'bg-green-600' : 
                      status === 'wrong' && opt === selected ? 'bg-red-600' : 'bg-white/5 hover:bg-orange-500/20'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="transition" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-grow flex flex-col items-center justify-center">
            <img src={`https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/${current.team.toLowerCase()}.png`} alt="Team" className="w-24 h-24 object-contain mb-4" />
            <h3 className="text-xl font-black text-white">{current.name}</h3>
            <div className="w-32 h-1 bg-white/10 mt-6 rounded-full overflow-hidden">
              <motion.div className="h-full bg-orange-500" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 2, ease: "linear" }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DraftRoulette;