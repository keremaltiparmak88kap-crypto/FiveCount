import React, { useState, useEffect } from 'react';
import { useGameStore } from './store';

const FindTeam = ({ teams }) => {
  const addScore = useGameStore((state) => state.addScore);
  const [currentTeam, setCurrentTeam] = useState(null);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("idle");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0); // Seri takibi

  const pickNewTeam = () => {
    const keys = Object.keys(teams);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    setCurrentTeam(teams[randomKey]);
    setInput("");
    setStatus("idle");
  };

  useEffect(() => {
    pickNewTeam();
  }, []);

  const handleGuess = () => {
    if (input.trim().toUpperCase() === currentTeam.name.toUpperCase()) {
      setStatus("correct");
      const points = 10 + (streak * 5); // Seri arttıkça puan da artar
      setScore(prev => prev + points);
      addScore(points, "find");
      setStreak(prev => prev + 1);
    } else {
      setStatus("wrong");
      setStreak(0); // Yanlışta seri bozulur
    }
  };

  if (!currentTeam) return null;

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-zinc-900 rounded-3xl border border-white/10 w-full max-w-lg mx-auto">
      
      {/* Skor ve Seri Göstergesi */}
      <div className="flex justify-between w-full mb-8">
        <div className="text-center">
          <p className="text-white/40 text-[10px] uppercase tracking-widest">Score</p>
          <p className="text-2xl font-black text-white">{score}</p>
        </div>
        <div className="text-center">
          <p className="text-white/40 text-[10px] uppercase tracking-widest">Combo</p>
          <p className={`text-2xl font-black ${streak > 0 ? "text-orange-500" : "text-white/20"}`}>x{streak}</p>
        </div>
      </div>

      <h2 className="text-white/40 text-xs tracking-[0.3em] uppercase mb-10">GUESS THE TEAM</h2>
      
      <div className="relative w-80 h-80 mb-10 flex items-center justify-center">
        <img 
          src={currentTeam.logo} 
          alt={currentTeam.name}
          className={`w-full h-full object-contain transition-all duration-700 ${
            status === "correct" ? "blur-0 opacity-100 scale-100" : "blur-[10px] opacity-60 scale-95"
          }`}
        />
      </div>

      <div className={`text-3xl font-black italic mb-8 transition-all ${status === "correct" ? "text-orange-500" : "text-transparent"}`}>
        {currentTeam.name}
      </div>

      <div className="flex flex-col w-full gap-4">
        {status !== "correct" ? (
          <>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type team name..."
              className="bg-black border border-white/20 p-4 rounded-xl text-center text-white"
            />
            <button 
              onClick={handleGuess}
              className="px-8 py-3 bg-white text-black font-black rounded-xl hover:bg-orange-500 hover:text-white transition-all"
            >
              SUBMIT GUESS
            </button>
            {status === "wrong" && <p className="text-red-500 text-center text-sm uppercase mt-2">Wrong! Streak broken.</p>}
          </>
        ) : (
          <button 
            onClick={pickNewTeam}
            className={`px-8 py-3 text-white font-black rounded-xl animate-bounce bg-gradient-to-r ${currentTeam.color}`}
          >
            NEXT TEAM
          </button>
        )}
      </div>
    </div>
  );
};

export default FindTeam;