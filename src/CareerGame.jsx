import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Heart, Route, X } from 'lucide-react';
import { useGameStore } from './store';

const ROUND_LIMIT = 8;
const STARTING_LIVES = 3;
const OPTION_COUNT = 4;

const TEAMS = {
  ATL: { name: "Hawks", logo: "https://a.espncdn.com/i/teamlogos/nba/500/atl.png" },
  BKN: { name: "Nets", logo: "https://a.espncdn.com/i/teamlogos/nba/500/bkn.png" },
  BOS: { name: "Celtics", logo: "https://a.espncdn.com/i/teamlogos/nba/500/bos.png" },
  CHA: { name: "Hornets", logo: "https://a.espncdn.com/i/teamlogos/nba/500/cha.png" },
  CHI: { name: "Bulls", logo: "https://a.espncdn.com/i/teamlogos/nba/500/chi.png" },
  CLE: { name: "Cavaliers", logo: "https://a.espncdn.com/i/teamlogos/nba/500/cle.png" },
  DAL: { name: "Mavericks", logo: "https://a.espncdn.com/i/teamlogos/nba/500/dal.png" },
  DEN: { name: "Nuggets", logo: "https://a.espncdn.com/i/teamlogos/nba/500/den.png" },
  DET: { name: "Pistons", logo: "https://a.espncdn.com/i/teamlogos/nba/500/det.png" },
  GSW: { name: "Warriors", logo: "https://a.espncdn.com/i/teamlogos/nba/500/gs.png" },
  HOU: { name: "Rockets", logo: "https://a.espncdn.com/i/teamlogos/nba/500/hou.png" },
  IND: { name: "Pacers", logo: "https://a.espncdn.com/i/teamlogos/nba/500/ind.png" },
  LAC: { name: "Clippers", logo: "https://a.espncdn.com/i/teamlogos/nba/500/lac.png" },
  LAL: { name: "Lakers", logo: "https://a.espncdn.com/i/teamlogos/nba/500/lal.png" },
  MEM: { name: "Grizzlies", logo: "https://a.espncdn.com/i/teamlogos/nba/500/mem.png" },
  MIA: { name: "Heat", logo: "https://a.espncdn.com/i/teamlogos/nba/500/mia.png" },
  MIL: { name: "Bucks", logo: "https://a.espncdn.com/i/teamlogos/nba/500/mil.png" },
  MIN: { name: "Timberwolves", logo: "https://a.espncdn.com/i/teamlogos/nba/500/min.png" },
  NOP: { name: "Pelicans", logo: "https://a.espncdn.com/i/teamlogos/nba/500/no.png" },
  NYK: { name: "Knicks", logo: "https://a.espncdn.com/i/teamlogos/nba/500/ny.png" },
  OKC: { name: "Thunder", logo: "https://a.espncdn.com/i/teamlogos/nba/500/okc.png" },
  ORL: { name: "Magic", logo: "https://a.espncdn.com/i/teamlogos/nba/500/orl.png" },
  PHI: { name: "76ers", logo: "https://a.espncdn.com/i/teamlogos/nba/500/phi.png" },
  PHX: { name: "Suns", logo: "https://a.espncdn.com/i/teamlogos/nba/500/phx.png" },
  POR: { name: "Trail Blazers", logo: "https://a.espncdn.com/i/teamlogos/nba/500/por.png" },
  SAC: { name: "Kings", logo: "https://a.espncdn.com/i/teamlogos/nba/500/sac.png" },
  SAS: { name: "Spurs", logo: "https://a.espncdn.com/i/teamlogos/nba/500/sa.png" },
  SEA: { name: "SuperSonics", logo: "https://a.espncdn.com/i/teamlogos/nba/500/sea.png" },
  TOR: { name: "Raptors", logo: "https://a.espncdn.com/i/teamlogos/nba/500/tor.png" },
  UTA: { name: "Jazz", logo: "https://a.espncdn.com/i/teamlogos/nba/500/utah.png" },
  WAS: { name: "Wizards", logo: "https://a.espncdn.com/i/teamlogos/nba/500/wsh.png" },
};

const CAREER_PATHS = [
  { name: "LeBron James", path: ["CLE", "MIA", "CLE", "LAL"] },
  { name: "Kevin Durant", path: ["OKC", "GSW", "BKN", "PHX"] },
  { name: "Kyrie Irving", path: ["CLE", "BOS", "BKN", "DAL"] },
  { name: "James Harden", path: ["OKC", "HOU", "BKN", "PHI", "LAC"] },
  { name: "Chris Paul", path: ["NOP", "LAC", "HOU", "OKC", "PHX", "GSW", "SAS"] },
  { name: "Kawhi Leonard", path: ["SAS", "TOR", "LAC"] },
  { name: "Russell Westbrook", path: ["OKC", "HOU", "WAS", "LAL", "LAC", "DEN"] },
  { name: "Paul George", path: ["IND", "OKC", "LAC", "PHI"] },
  { name: "Jimmy Butler", path: ["CHI", "MIN", "PHI", "MIA"] },
  { name: "Shaquille O'Neal", path: ["ORL", "LAL", "MIA", "PHX", "CLE", "BOS"] },
  { name: "Carmelo Anthony", path: ["DEN", "NYK", "OKC", "HOU", "POR", "LAL"] },
  { name: "Dwight Howard", path: ["ORL", "LAL", "HOU", "ATL", "CHA", "WAS", "PHI"] },
  { name: "Ray Allen", path: ["MIL", "SEA", "BOS", "MIA"] },
  { name: "Pau Gasol", path: ["MEM", "LAL", "CHI", "SAS", "MIL"] },
  { name: "Vince Carter", path: ["TOR", "BKN", "ORL", "PHX", "DAL", "MEM", "SAC", "ATL"] },
  { name: "Jason Kidd", path: ["DAL", "PHX", "BKN", "DAL", "NYK"] },
];

const shuffle = (items) => {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
};

const buildRound = (usedNames) => {
  const available = CAREER_PATHS.filter((item) => !usedNames.includes(item.name));
  const career = shuffle(available.length ? available : CAREER_PATHS)[0];
  const hiddenIndex = Math.floor(Math.random() * career.path.length);
  const answer = career.path[hiddenIndex];
  const decoys = shuffle(Object.keys(TEAMS).filter((team) => team !== answer && !career.path.includes(team)))
    .slice(0, OPTION_COUNT - 1);

  return {
    career,
    hiddenIndex,
    answer,
    options: shuffle([answer, ...decoys]),
  };
};

const normalizeAnswer = (value) => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
};

const CareerGame = () => {
  const addScore = useGameStore((state) => state.addScore);
  const [usedNames, setUsedNames] = useState([]);
  const [current, setCurrent] = useState(() => buildRound([]));
  const [mode, setMode] = useState("team");
  const [nameGuess, setNameGuess] = useState("");
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(STARTING_LIVES);
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [finished, setFinished] = useState(false);

  const progress = useMemo(() => Math.round(((round - 1) / ROUND_LIMIT) * 100), [round]);

  const advanceRound = (nextUsedNames) => {
    if (round >= ROUND_LIMIT) {
      setFinished(true);
      setLocked(false);
      return;
    }

    setUsedNames(nextUsedNames);
    setCurrent(buildRound(nextUsedNames));
    setRound((value) => value + 1);
    setFeedback(null);
    setNameGuess("");
    setLocked(false);
  };

  const handlePick = (teamId) => {
    if (locked || finished) return;

    const correct = teamId === current.answer;
    setLocked(true);

    if (correct) {
      const nextCombo = combo + 1;
      const points = Math.min(75, 35 + nextCombo * 5);
      const nextUsedNames = [...usedNames, current.career.name];

      setCombo(nextCombo);
      setScore((value) => value + points);
      setFeedback({ type: "correct", picked: teamId, points });
      addScore(points, "career");

      setTimeout(() => advanceRound(nextUsedNames), 850);
      return;
    }

    const nextLives = lives - 1;
    const nextUsedNames = [...usedNames, current.career.name];
    setLives(nextLives);
    setCombo(0);
    setFeedback({ type: "wrong", picked: teamId, points: 0 });

    if (nextLives <= 0) {
      setTimeout(() => {
        setFinished(true);
        setLocked(false);
      }, 1000);
    } else {
      setTimeout(() => advanceRound(nextUsedNames), 1000);
    }
  };

  const handleNameSubmit = (event) => {
    event.preventDefault();
    if (locked || finished || !nameGuess.trim()) return;

    const correct = normalizeAnswer(nameGuess) === normalizeAnswer(current.career.name);
    const nextUsedNames = [...usedNames, current.career.name];
    setLocked(true);

    if (correct) {
      const nextCombo = combo + 1;
      const points = Math.min(100, 45 + nextCombo * 10);

      setCombo(nextCombo);
      setScore((value) => value + points);
      setFeedback({ type: "correct", picked: current.career.name, points });
      addScore(points, "career");

      setTimeout(() => advanceRound(nextUsedNames), 850);
      return;
    }

    const nextLives = lives - 1;
    setLives(nextLives);
    setCombo(0);
    setFeedback({ type: "wrong-name", picked: nameGuess, points: 0 });

    if (nextLives <= 0) {
      setTimeout(() => {
        setFinished(true);
        setLocked(false);
      }, 1000);
    } else {
      setTimeout(() => advanceRound(nextUsedNames), 1000);
    }
  };

  const restart = () => {
    const next = buildRound([]);
    setUsedNames([]);
    setCurrent(next);
    setNameGuess("");
    setRound(1);
    setScore(0);
    setCombo(0);
    setLives(STARTING_LIVES);
    setLocked(false);
    setFeedback(null);
    setFinished(false);
  };

  const switchMode = (nextMode) => {
    if (locked || mode === nextMode) return;
    setMode(nextMode);
    setNameGuess("");
    setFeedback(null);
  };

  return (
    <div className="max-w-md mx-auto text-white px-2 pb-8">
      <AnimatePresence>
        {finished && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#060608]/95 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-sm text-center rounded-3xl p-8 bg-gradient-to-b from-white/[0.06] to-white/[0.015] border border-white/10"
            >
              <p className="text-[10px] uppercase tracking-[0.35em] text-white/35 mb-2">
                Path Complete
              </p>
              <h2 className="text-5xl font-black text-orange-500 mb-2">{score}</h2>
              <p className="text-xs text-white/40 mb-6">
                Round {round}/{ROUND_LIMIT} · Combo x{combo}
              </p>
              <button
                onClick={restart}
                className="w-full bg-orange-500 text-black font-black py-4 rounded-2xl uppercase text-[11px] tracking-widest"
              >
                Play Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center mb-5">
        <h1 className="text-3xl font-black italic tracking-tight">
          CAREER<span className="text-orange-500">PATH</span>
        </h1>
        <p className="text-[9px] uppercase tracking-[0.3em] text-white/30 mt-1">
          Find the missing team or name the player
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-5 rounded-2xl border border-white/10 bg-white/5 p-1">
        <button
          onClick={() => switchMode("team")}
          disabled={locked}
          className={`rounded-xl py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${
            mode === "team" ? "bg-orange-500 text-black" : "text-white/45 hover:text-white"
          }`}
        >
          Team Mode
        </button>
        <button
          onClick={() => switchMode("name")}
          disabled={locked}
          className={`rounded-xl py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${
            mode === "name" ? "bg-orange-500 text-black" : "text-white/45 hover:text-white"
          }`}
        >
          Name Mode
        </button>
      </div>

      <div className="mb-5">
        <div className="flex justify-between items-center mb-2 text-[10px] uppercase tracking-widest text-white/35">
          <span>Round {round}/{ROUND_LIMIT}</span>
          <span>{score} pts</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full bg-orange-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-5">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1">Lives</p>
          <div className="flex gap-1 text-red-400">
            {[...Array(STARTING_LIVES)].map((_, index) => (
              <Heart key={index} size={15} fill={index < lives ? "currentColor" : "none"} />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1">Combo</p>
          <p className="font-black text-orange-400">x{combo}</p>
        </div>
      </div>

      <motion.div
        key={current.career.name}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.015] p-6 mb-5"
      >
        <div className="w-14 h-14 rounded-2xl mx-auto mb-4 bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
          <Route size={25} />
        </div>
        <p className="text-center text-[9px] uppercase tracking-[0.3em] text-white/30 mb-2">
          {mode === "team" ? "Player Timeline" : "Whose Career Path?"}
        </p>
        {mode === "team" ? (
          <h2 className="text-center text-3xl font-black tracking-tight leading-tight mb-6">
            {current.career.name}
          </h2>
        ) : (
          <div className="text-center mb-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-orange-300 font-black">
              Name the player
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {current.career.path.map((teamId, index) => {
            const hidden = mode === "team" && index === current.hiddenIndex;
            const team = TEAMS[teamId];

            return (
              <div key={`${teamId}-${index}`} className="flex items-center gap-3">
                <div className="w-7 text-[10px] text-white/25 font-black text-right">
                  {index + 1}
                </div>
                <div className={`flex-1 rounded-2xl border px-4 py-3 flex items-center gap-3 ${
                  hidden
                    ? "border-orange-500/50 bg-orange-500/10"
                    : "border-white/10 bg-black/25"
                }`}>
                  {hidden ? (
                    <>
                      <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/40" />
                      <span className="text-sm font-black tracking-widest text-orange-300">???</span>
                    </>
                  ) : (
                    <>
                      <img src={team.logo} alt="" className="w-8 h-8 object-contain" />
                      <div>
                        <p className="text-sm font-black">{teamId}</p>
                        <p className="text-[9px] uppercase tracking-widest text-white/30">{team.name}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {mode === "team" ? (
        <div className="grid grid-cols-2 gap-3">
          {current.options.map((teamId) => {
            const team = TEAMS[teamId];
            const isPicked = feedback?.picked === teamId;
            const isAnswer = current.answer === teamId;
            const showCorrect = feedback && isAnswer;
            const showWrong = feedback?.type === "wrong" && isPicked;

            return (
              <motion.button
                key={teamId}
                whileTap={locked ? {} : { scale: 0.97 }}
                onClick={() => handlePick(teamId)}
                disabled={locked}
                className={`min-h-24 rounded-2xl border p-3 flex items-center gap-3 text-left transition-colors ${
                  showCorrect
                    ? "bg-emerald-500/20 border-emerald-400/60"
                    : showWrong
                      ? "bg-red-500/20 border-red-400/60"
                      : "bg-zinc-950 border-white/10 hover:border-orange-500/45"
                }`}
              >
                <img src={team.logo} alt="" className="w-10 h-10 object-contain shrink-0" />
                <div className="min-w-0">
                  <p className="font-black text-sm">{teamId}</p>
                  <p className="text-[10px] text-white/35 leading-tight">{team.name}</p>
                </div>
                {showCorrect && <Check size={16} className="ml-auto text-emerald-300 shrink-0" />}
                {showWrong && <X size={16} className="ml-auto text-red-300 shrink-0" />}
              </motion.button>
            );
          })}
        </div>
      ) : (
        <form onSubmit={handleNameSubmit} className="space-y-3">
          <input
            value={nameGuess}
            onChange={(event) => setNameGuess(event.target.value)}
            disabled={locked}
            placeholder="Type player name..."
            className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-4 text-center text-white font-black outline-none focus:border-orange-500"
          />
          <button
            type="submit"
            disabled={locked || !nameGuess.trim()}
            className="w-full rounded-2xl bg-orange-500 disabled:bg-white/10 disabled:text-white/25 text-black py-4 font-black uppercase text-[11px] tracking-widest transition-colors"
          >
            Verify Player
          </button>
        </form>
      )}

      <div className="min-h-8 mt-4 text-center">
        {feedback?.type === "correct" && (
          <p className="text-[11px] font-bold text-emerald-300 uppercase tracking-widest">
            +{feedback.points} points
          </p>
        )}
        {feedback?.type === "wrong" && (
          <p className="text-[11px] font-bold text-red-300 uppercase tracking-widest">
            Correct team: {current.answer} · next round
          </p>
        )}
        {feedback?.type === "wrong-name" && (
          <p className="text-[11px] font-bold text-red-300 uppercase tracking-widest">
            Correct player: {current.career.name} · next round
          </p>
        )}
      </div>
    </div>
  );
};

export default CareerGame;
