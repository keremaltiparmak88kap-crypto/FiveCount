import { useState, useEffect } from 'react';

const CAREER_DATABASE = [
  { name: "LeBron James", path: ["CLE (2003-2010)", "MIA (2010-2014)", "CLE (2014-2018)", "LAL (2018-Present)"] },
  { name: "Kevin Durant", path: ["SEA/OKC (2007-2016)", "GSW (2016-2019)", "BKN (2019-2023)", "PHX (2023-Present)"] },
  { name: "Kyrie Irving", path: ["CLE (2011-2017)", "BOS (2017-2019)", "BKN (2019-2023)", "DAL (2023-Present)"] },
  { name: "Luka Doncic", path: ["Real Madrid (YOUTH)", "DAL (2018-Present)"] },
  { name: "James Harden", path: ["OKC (2009-2012)", "HOU (2012-2021)", "BKN (2021-2022)", "PHI (2022-2023)", "LAC (2023-Present)"] },
  { name: "Chris Paul", path: ["NOK", "LAC", "HOU", "OKC", "PHX", "GSW", "SAS (Present)"] },
  { name: "Kawhi Leonard", path: ["IND (Drafted)", "SAS (2011-2018)", "TOR (2018-2019)", "LAC (2019-Present)"] },
  { name: "Anthony Davis", path: ["NOH/NOP (2012-2019)", "LAL (2019-Present)"] },
  { name: "Russell Westbrook", path: ["OKC", "HOU", "WAS", "LAL", "LAC", "DEN (Present)"] },
  { name: "Paul George", path: ["IND (2010-2017)", "OKC (2017-2019)", "LAC (2019-2024)", "PHI (2024-Present)"] }
];

function CareerGame() {
  const [target, setTarget] = useState(null);
  const [guess, setGuess] = useState("");
  const [attempts, setAttempts] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const initGame = () => {
    const randomTarget = CAREER_DATABASE[Math.floor(Math.random() * CAREER_DATABASE.length)];
    setTarget(randomTarget);
    setAttempts([]);
    setGuess("");
    setGameOver(false);
    setWon(false);
  };

  useEffect(() => { initGame(); }, []);

  const handleDisplaySubmit = (e) => {
    e.preventDefault();
    if (!guess.trim() || gameOver) return;

    const currentGuess = guess.trim();
    const isCorrect = currentGuess.toLowerCase() === target.name.toLowerCase();
    const nextAttempts = [...attempts, currentGuess];
    
    setAttempts(nextAttempts);
    setGuess("");

    if (isCorrect) {
      setWon(true);
      setGameOver(true);
    } else if (nextAttempts.length >= 4) {
      setGameOver(true);
    }
  };

  return (
    <div className="min-h-screen text-[#e2e8f0] p-6 font-mono tracking-wide">
      <header className="max-w-xl mx-auto text-center border-b border-slate-900 pb-4 mb-8">
        <div className="text-2xl font-black italic text-orange-500">FIVE<span className="text-white font-light">PATH</span></div>
        <div className="text-[10px] text-slate-500 mt-1">// KRONOLOJİK TRANSFER BULMACA</div>
      </header>

      <main className="max-w-xl mx-auto space-y-6">
        <div className="bg-slate-950 p-6 border-2 border-slate-950 rounded text-center shadow-xl">
          <div className="text-[10px] text-orange-400 font-bold mb-4">// HEDEF OYUNCUNUN KARİYER ZAMAN TÜNELİ</div>
          <div className="flex flex-col items-center gap-2">
            {target?.path.map((team, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="bg-slate-900 px-4 py-2 border border-slate-800 text-xs font-bold text-white rounded">
                  {team}
                </div>
                {idx < target.path.length - 1 && <div className="text-slate-600 text-xs">➔</div>}
              </div>
            ))}
          </div>
        </div>

        {!gameOver && (
          <form onSubmit={handleDisplaySubmit} className="space-y-4">
            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Oyuncunun Adını ve Soyadını Yazın..."
              className="w-full bg-black text-white font-bold p-4 border border-slate-800 focus:border-orange-500 outline-none text-xs rounded text-center"
            />
            <button type="submit" className="w-full bg-orange-500 text-black font-black py-3 text-xs uppercase">
              TAHMİN ET ({4 - attempts.length} Hak Kaldı)
            </button>
          </form>
        )}

        {attempts.length > 0 && (
          <div className="bg-slate-950 border border-slate-900 p-4 rounded space-y-2">
            <div className="text-[9px] text-slate-500 font-bold uppercase">// GEÇMİŞ TAHMİNLERİNİZ</div>
            {attempts.map((att, i) => (
              <div key={i} className="text-xs font-bold p-2 bg-black border border-slate-900 rounded flex justify-between">
                <span className="text-slate-400">#{i+1} {att.toUpperCase()}</span>
                <span className="text-red-500">❌ YANLIŞ</span>
              </div>
            ))}
          </div>
        )}

        {gameOver && (
          <div className={`p-6 border text-center rounded ${won ? 'border-emerald-500 bg-emerald-500/10' : 'border-red-500 bg-red-500/10'}`}>
            <h3 className="text-lg font-black">{won ? "🎉 TRANSFER DAHİSİ!" : "💥 TAKIMDA KALDI!"}</h3>
            <p className="text-xs text-slate-400 mt-1">Cevap: <span className="text-white font-black uppercase text-sm">{target?.name}</span></p>
            <button onClick={initGame} className="mt-4 bg-white text-black font-black text-[10px] px-4 py-2 uppercase">YENİDEN BAŞLA</button>
          </div>
        )}
      </main>
    </div>
  );
}

export default CareerGame;