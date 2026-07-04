import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from './store';

// --- TAKIMLAR (App.jsx'teki ALL_TEAMS ile aynı veri seti) ---
const TEAM_OPTIONS = {
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

// --- RAKİP LADDER'I (en düşükten en yükseğe, 18 level) ---
const OPPONENTS = [
  { name: "BEN SIMMONS", ovr: 65, target: 1, tag: "Rookie Wall", skills: { accuracy: 1, range: 0, speed: 3, consistency: 2, clutch: 1 } },
  { name: "RUDY GOBERT", ovr: 68, target: 1, tag: "Paint Protector", skills: { accuracy: 1, range: 1, speed: 2, consistency: 3, clutch: 1 } },
  { name: "DRAYMOND GREEN", ovr: 70, target: 1, tag: "Chess Master", skills: { accuracy: 2, range: 1, speed: 3, consistency: 3, clutch: 3 } },
  { name: "GIANNIS ANTETOKOUNMPO", ovr: 78, target: 2, tag: "The Freak", skills: { accuracy: 2, range: 2, speed: 4, consistency: 3, clutch: 3 } },
  { name: "RUSSELL WESTBROOK", ovr: 80, target: 2, tag: "Mr. Triple-Double", skills: { accuracy: 2, range: 2, speed: 5, consistency: 2, clutch: 3 } },
  { name: "LEBRON JAMES", ovr: 82, target: 2, tag: "The King", skills: { accuracy: 3, range: 3, speed: 3, consistency: 4, clutch: 5 } },
  { name: "LUKA DONCIC", ovr: 85, target: 3, tag: "Wonder Boy", skills: { accuracy: 4, range: 3, speed: 2, consistency: 4, clutch: 4 } },
  { name: "JAYSON TATUM", ovr: 87, target: 3, tag: "Deuce", skills: { accuracy: 4, range: 4, speed: 3, consistency: 4, clutch: 4 } },
  { name: "ANTHONY EDWARDS", ovr: 88, target: 3, tag: "Ant-Man", skills: { accuracy: 3, range: 3, speed: 5, consistency: 3, clutch: 4 } },
  { name: "KEVIN DURANT", ovr: 90, target: 4, tag: "Slim Reaper", skills: { accuracy: 5, range: 4, speed: 3, consistency: 4, clutch: 4 } },
  { name: "DEVIN BOOKER", ovr: 91, target: 4, tag: "Book", skills: { accuracy: 4, range: 4, speed: 3, consistency: 4, clutch: 4 } },
  { name: "DAMIAN LILLARD", ovr: 93, target: 4, tag: "Dame Time", skills: { accuracy: 4, range: 5, speed: 3, consistency: 3, clutch: 5 } },
  { name: "TRAE YOUNG", ovr: 93, target: 4, tag: "Ice Trae", skills: { accuracy: 4, range: 5, speed: 3, consistency: 3, clutch: 4 } },
  { name: "KLAY THOMPSON", ovr: 95, target: 5, tag: "Game 6", skills: { accuracy: 5, range: 4, speed: 2, consistency: 5, clutch: 4 } },
  { name: "KYRIE IRVING", ovr: 96, target: 5, tag: "Uncle Drew", skills: { accuracy: 5, range: 4, speed: 4, consistency: 4, clutch: 4 } },
  { name: "STEPHEN CURRY", ovr: 99, target: 5, tag: "Chef Curry", skills: { accuracy: 5, range: 5, speed: 4, consistency: 5, clutch: 5 } },
  { name: "PRIME KOBE BRYANT", ovr: 100, target: 5, tag: "Black Mamba", skills: { accuracy: 5, range: 5, speed: 4, consistency: 5, clutch: 5 } },
  { name: "PRIME MICHAEL JORDAN", ovr: 101, target: 5, tag: "GOAT · Final Boss", skills: { accuracy: 5, range: 5, speed: 5, consistency: 5, clutch: 5 } }
];

const SKILLS_META = [
  { key: "accuracy", label: "ACCURACY", desc: "Widens your aim window" },
  { key: "range", label: "RANGE", desc: "Widens your power window" },
  { key: "speed", label: "SPEED", desc: "Slows down the moving bars" },
  { key: "consistency", label: "CONSISTENCY", desc: "Reduces random luck swings" },
  { key: "clutch", label: "CLUTCH", desc: "Boosts your final moneyball shot" }
];

const SHOTS_PER_LEVEL = 5;
const TOTAL_POINTS = 5;

const ThreePointLegend = () => {
  const character = useGameStore((s) => s.character);
  const createCharacter = useGameStore((s) => s.createCharacter);
  const advanceCharacterLevel = useGameStore((s) => s.advanceCharacterLevel);
  const addSkillPoint = useGameStore((s) => s.addSkillPoint);
  const addScore = useGameStore((s) => s.addScore);

  const [phase, setPhase] = useState(character ? "play" : "create");
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [skills, setSkills] = useState({ accuracy: 0, range: 0, speed: 0, consistency: 0, clutch: 0 });

  // Takım seçimi
  const [selectedTeamKey, setSelectedTeamKey] = useState(null);
  const [teamRevealed, setTeamRevealed] = useState(false);

  const levelIndex = character?.level ?? 0;
  const opponent = OPPONENTS[Math.min(levelIndex, OPPONENTS.length - 1)];

  const [shotPhase, setShotPhase] = useState("ready"); // ready | power | aim | result
  const [shotIndex, setShotIndex] = useState(0);
  const [levelScore, setLevelScore] = useState(0);
  const [lastResult, setLastResult] = useState(null); // 'make' | 'miss'
  const [levelOutcome, setLevelOutcome] = useState(null); // null | 'win' | 'lose'
  const [showIntro, setShowIntro] = useState(true);
  const [pendingSkillPoint, setPendingSkillPoint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(100);
  const [wasTimeout, setWasTimeout] = useState(false);

  const [powerValue, setPowerValue] = useState(0);
  const [aimValue, setAimValue] = useState(0);
  const [powerTargetCenter, setPowerTargetCenter] = useState(30 + Math.random() * 40);
  const [aimTarget, setAimTarget] = useState(30 + Math.random() * 40);

  const dirRef = useRef(1);
  const intervalRef = useRef(null);
  const lockedPowerRef = useRef(null);

  const usedSkills = Object.values(skills).reduce((a, b) => a + b, 0);
  const remaining = TOTAL_POINTS - usedSkills;

  const adjustSkill = (key, delta) => {
    setSkills((prev) => {
      const next = { ...prev, [key]: Math.max(0, Math.min(5, prev[key] + delta)) };
      const total = Object.values(next).reduce((a, b) => a + b, 0);
      if (total > TOTAL_POINTS) return prev;
      return next;
    });
  };

  const handleCreateCharacter = () => {
    if (!name.trim() || !nickname.trim()) return;
    setPhase("team");
  };

  const selectTeam = (key) => {
    setSelectedTeamKey(key);
    setTeamRevealed(true);
  };

  const confirmTeam = () => {
    setPhase("skills");
  };

  const handleConfirmSkills = () => {
    if (remaining !== 0) return;
    createCharacter(name.trim(), nickname.trim(), selectedTeamKey, skills);
    setPhase("play");
    resetLevelState();
  };

  const resetLevelState = (withIntro = true) => {
    setShotIndex(0);
    setLevelScore(0);
    setLevelOutcome(null);
    setShotPhase("ready");
    setShowIntro(withIntro);
    setPendingSkillPoint(false);
    setTimeLeft(100);
    setWasTimeout(false);
  };

  const startBar = (setter, tickSize) => {
    let v = 0;
    dirRef.current = 1;
    intervalRef.current = setInterval(() => {
      v += tickSize * dirRef.current;
      if (v >= 100) { v = 100; dirRef.current = -1; }
      if (v <= 0) { v = 0; dirRef.current = 1; }
      setter(v);
    }, 16);
  };

  const stopBar = () => clearInterval(intervalRef.current);

  const difficulty = levelIndex;
  const speedSkill = character?.skills?.speed || 0;
  const accSkill = character?.skills?.accuracy || 0;
  const rangeSkill = character?.skills?.range || 0;
  const consSkill = character?.skills?.consistency || 0;
  const clutchSkill = character?.skills?.clutch || 0;

  const isMoneyball = shotIndex === SHOTS_PER_LEVEL - 1;
  const shotsRemaining = SHOTS_PER_LEVEL - shotIndex;
  const pointsNeeded = opponent.target + 1 - levelScore;
  const isClutch = isMoneyball || (shotsRemaining <= 2 && pointsNeeded >= shotsRemaining);
  const clutchSlow = isClutch ? 0.82 : 1; // clutch anında barlar hafif yavaşlar (his için)

  const baseTick = 1.6 + difficulty * 0.18;
  const tickSize = Math.max(0.8, (baseTick - speedSkill * 0.18) * clutchSlow);

  const windowPenalty = difficulty * 1.4;
  let accuracyWindow = 24 + accSkill * 5.5 - windowPenalty;
  let rangeWindow = 24 + rangeSkill * 5.5 - windowPenalty;
  if (isMoneyball) { accuracyWindow += clutchSkill * 4; rangeWindow += clutchSkill * 4; }
  accuracyWindow = Math.max(8, accuracyWindow);
  rangeWindow = Math.max(8, rangeWindow);
  const luckSpread = Math.max(2, 13 - consSkill * 2);

  // --- BUZZER / SÜRE BASKISI ---
  const stageDuration = Math.max(1100, 2600 - difficulty * 70);
  const timerRef = useRef(null);

  const startTimer = (onExpire) => {
    clearInterval(timerRef.current);
    const start = Date.now();
    setTimeLeft(100);
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.max(0, 100 - (elapsed / stageDuration) * 100);
      setTimeLeft(pct);
      if (pct <= 0) {
        clearInterval(timerRef.current);
        onExpire();
      }
    }, 50);
  };
  const stopTimer = () => clearInterval(timerRef.current);

  const resolveShot = (made, timedOut = false) => {
    stopBar();
    stopTimer();
    const points = made ? (isMoneyball ? 2 : 1) : 0;

    setLevelScore((s) => s + points);
    setLastResult(made ? "make" : "miss");
    setWasTimeout(timedOut);
    setShotPhase("result");

    const finalScore = levelScore + points;
    setTimeout(() => {
      if (shotIndex + 1 >= SHOTS_PER_LEVEL) {
        if (finalScore > opponent.target) {
          setLevelOutcome("win");
          setPendingSkillPoint(true);
          addScore((levelIndex + 1) * 100, "threes");
        } else {
          setLevelOutcome("lose");
        }
      } else {
        setShotIndex((i) => i + 1);
        setShotPhase("ready");
      }
    }, 1200);
  };

  const startShot = () => {
    setPowerTargetCenter(25 + Math.random() * 50);
    setAimTarget(25 + Math.random() * 50);
    setShotPhase("power");
    startBar(setPowerValue, tickSize);
    startTimer(() => resolveShot(false, true)); // süre dolarsa otomatik ıska
  };

  const lockPower = () => {
    stopBar();
    stopTimer();
    lockedPowerRef.current = powerValue;
    setShotPhase("aim");
    startBar(setAimValue, tickSize * 1.1);
    startTimer(() => resolveShot(false, true));
  };

  const lockAim = () => {
    const powerDist = Math.abs(lockedPowerRef.current - powerTargetCenter);
    const aimDist = Math.abs(aimValue - aimTarget);
    const luck = (Math.random() * 2 - 1) * luckSpread;
    const margin = (rangeWindow / 2 - powerDist) + (accuracyWindow / 2 - aimDist) + luck;
    resolveShot(margin > 0, false);
  };

  const handleAllocateSkillPoint = (key) => {
    addSkillPoint(key);
    setPendingSkillPoint(false);
  };

  const handleNextLevel = () => {
    if (levelIndex + 1 >= OPPONENTS.length) {
      addScore(5000, "threes"); // GOAT'ı yenme bonusu
    }
    advanceCharacterLevel();
    resetLevelState();
  };

  const handleRetryLevel = () => resetLevelState(false);

  useEffect(() => () => { clearInterval(intervalRef.current); clearInterval(timerRef.current); }, []);

  // ---------- RENDER: CREATE ----------
  if (phase === "create") {
    return (
      <div className="max-w-md mx-auto p-6 text-white">
        <h2 className="text-2xl font-black italic tracking-tighter mb-1">CREATE YOUR <span className="text-orange-500">LEGEND</span></h2>
        <p className="text-[11px] text-white/40 mb-8 uppercase tracking-widest">Three-Point Legend · Career Mode</p>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-white/40 mb-1 block">Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Marcus Reed"
              className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 text-white focus:border-orange-500 outline-none" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-white/40 mb-1 block">Nickname</label>
            <input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="e.g. Ice"
              className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 text-white focus:border-orange-500 outline-none" />
          </div>
          <button onClick={handleCreateCharacter} disabled={!name.trim() || !nickname.trim()}
            className="w-full bg-orange-500 disabled:bg-zinc-800 disabled:text-white/30 text-black font-black py-4 rounded-xl uppercase tracking-widest transition-colors">
            Next: Pick Your Team
          </button>
        </div>
      </div>
    );
  }

  // ---------- RENDER: TEAM ----------
  if (phase === "team") {
    if (!teamRevealed) {
      return (
        <div className="max-w-md mx-auto p-6 text-white">
          <h2 className="text-2xl font-black italic tracking-tighter mb-1">PICK YOUR <span className="text-orange-500">TEAM</span></h2>
          <p className="text-[11px] text-white/40 mb-6 uppercase tracking-widest">Who does "{nickname}" {name} play for?</p>

          <div className="grid grid-cols-3 gap-3 max-h-[420px] overflow-y-auto pr-1">
            {Object.entries(TEAM_OPTIONS).map(([key, team]) => (
              <button
                key={key}
                onClick={() => selectTeam(key)}
                className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-zinc-900 border border-white/10 hover:border-orange-500/50 hover:bg-white/5 transition-all"
              >
                <img src={team.logo} alt={team.name} className="w-10 h-10 object-contain" />
                <span className="text-[8px] font-black uppercase tracking-wide text-white/60 text-center">{team.name}</span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    const team = TEAM_OPTIONS[selectedTeamKey];
    return (
      <div className="max-w-md mx-auto p-6 text-white flex flex-col items-center justify-center min-h-[70vh] relative overflow-hidden">
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${team.color} opacity-20 blur-3xl`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.25, scale: 1 }}
          transition={{ duration: 0.8 }}
        />
        <motion.img
          src={team.logo}
          alt={team.name}
          className="w-40 h-40 object-contain relative z-10 mb-6 drop-shadow-[0_0_35px_rgba(249,115,22,0.35)]"
          initial={{ scale: 0, rotate: -25, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 140, damping: 12 }}
        />
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`relative z-10 text-2xl font-black italic tracking-tighter text-center mb-1 bg-gradient-to-r ${team.color} bg-clip-text text-transparent`}
        >
          YOU'RE REPPING THE {team.name}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="relative z-10 text-[11px] text-white/40 uppercase tracking-widest mb-10"
        >
          "{nickname}" {name} · {team.name}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="relative z-10 w-full flex gap-3"
        >
          <button onClick={() => setTeamRevealed(false)} className="flex-1 border border-white/20 py-4 rounded-xl uppercase text-xs tracking-widest hover:bg-white/5">
            Change
          </button>
          <button onClick={confirmTeam} className="flex-[2] bg-orange-500 text-black font-black py-4 rounded-xl uppercase text-xs tracking-widest">
            Confirm & Continue
          </button>
        </motion.div>
      </div>
    );
  }

  // ---------- RENDER: SKILLS ----------
  if (phase === "skills") {
    return (
      <div className="max-w-md mx-auto p-6 text-white">
        <h2 className="text-2xl font-black italic tracking-tighter mb-1">"{nickname.toUpperCase()}" {name.toUpperCase()}</h2>
        <p className="text-[11px] text-white/40 mb-6 uppercase tracking-widest">Assign your 5 skill points</p>

        <div className="flex justify-center mb-6">
          <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-orange-400 text-xs font-black">
            {remaining} POINTS LEFT
          </span>
        </div>

        <div className="space-y-4">
          {SKILLS_META.map((s) => (
            <div key={s.key} className="bg-zinc-900 border border-white/10 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="font-black text-sm">{s.label}</p>
                  <p className="text-[10px] text-white/35">{s.desc}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => adjustSkill(s.key, -1)} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10">-</button>
                  <span className="font-black text-lg w-4 text-center">{skills[s.key]}</span>
                  <button onClick={() => adjustSkill(s.key, 1)} disabled={remaining <= 0} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-20">+</button>
                </div>
              </div>
              <div className="w-full h-2 bg-black rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 transition-all" style={{ width: `${(skills[s.key] / 5) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>

        <button onClick={handleConfirmSkills} disabled={remaining !== 0}
          className="w-full mt-6 bg-orange-500 disabled:bg-zinc-800 disabled:text-white/30 text-black font-black py-4 rounded-xl uppercase tracking-widest transition-colors">
          Start Career
        </button>
      </div>
    );
  }

  // ---------- RENDER: PLAY ----------
  if (!character) return null;

  if (levelIndex >= OPPONENTS.length) {
    return (
      <div className="max-w-md mx-auto p-6 text-white text-center">
        <h1 className="text-4xl font-black mb-2 text-orange-500">🏆 LEGEND STATUS</h1>
        <p className="text-white/50 mb-8">You beat the GOAT himself, {character.nickname}. There's no one left to challenge.</p>
      </div>
    );
  }

  const myTeam = TEAM_OPTIONS[character.team];

  // ---- MAÇ ÖNCESİ (VS) EKRANI ----
  if (showIntro && !levelOutcome) {
    return (
      <div className="max-w-md mx-auto p-6 text-white">
        <div className="text-center mb-8">
          <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Level {levelIndex + 1} / {OPPONENTS.length}</p>
          <h2 className="text-3xl font-black italic tracking-tighter text-orange-500">{opponent.name}</h2>
          <p className="text-[11px] text-white/40 uppercase tracking-widest mt-1">{opponent.tag} · OVR {opponent.ovr}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              {myTeam && <img src={myTeam.logo} alt={myTeam.name} className="w-5 h-5 object-contain" />}
              <p className="text-[9px] uppercase tracking-widest text-white/40">You{myTeam ? ` · ${myTeam.name}` : ""}</p>
            </div>
            <p className="font-black text-sm mb-3 truncate">"{character.nickname}" {character.name}</p>
            <div className="space-y-2">
              {SKILLS_META.map((s) => (
                <div key={s.key}>
                  <div className="flex justify-between text-[9px] text-white/40 mb-0.5">
                    <span>{s.label}</span><span>{character.skills[s.key]}</span>
                  </div>
                  <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500" style={{ width: `${Math.min(100, (character.skills[s.key] / 8) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900 border border-orange-500/20 rounded-2xl p-4">
            <p className="text-[9px] uppercase tracking-widest text-orange-400 mb-1">Opponent</p>
            <p className="font-black text-sm mb-3 truncate">{opponent.name}</p>
            <div className="space-y-2">
              {SKILLS_META.map((s) => (
                <div key={s.key}>
                  <div className="flex justify-between text-[9px] text-white/40 mb-0.5">
                    <span>{s.label}</span><span>{opponent.skills[s.key]}</span>
                  </div>
                  <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                    <div className="h-full bg-white/50" style={{ width: `${(opponent.skills[s.key] / 5) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-6 text-center">
          <p className="text-[10px] text-white/40 uppercase tracking-widest">
            Score more than <span className="text-orange-400 font-black">{opponent.target}</span> out of {SHOTS_PER_LEVEL} shots to win
          </p>
        </div>

        <button onClick={() => setShowIntro(false)}
          className="w-full bg-orange-500 text-black font-black py-4 rounded-xl uppercase tracking-widest">
          Tip Off
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-[10px] text-white/40 uppercase tracking-widest">Level {levelIndex + 1} / {OPPONENTS.length}</p>
          <h2 className="text-xl font-black italic">{opponent.name}</h2>
          <p className="text-[10px] text-orange-400 uppercase">{opponent.tag} · OVR {opponent.ovr}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-white/40 uppercase tracking-widest">Score</p>
          <p className="text-2xl font-black">{levelScore} <span className="text-white/30 text-sm">/ {opponent.target + 1} to win</span></p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {[...Array(SHOTS_PER_LEVEL)].map((_, i) => (
          <div key={i} className={`flex-1 h-2 rounded-full ${i < shotIndex ? 'bg-orange-500' : i === shotIndex ? 'bg-white/40' : 'bg-white/10'}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {levelOutcome ? (
          <motion.div key="outcome" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900 border border-white/10 rounded-2xl p-8 text-center">
            <h3 className={`text-2xl font-black mb-2 ${levelOutcome === 'win' ? 'text-emerald-500' : 'text-red-500'}`}>
              {levelOutcome === 'win' ? 'RACK WON!' : 'FELL SHORT'}
            </h3>
            <p className="text-white/50 text-sm mb-6">Final score: {levelScore} — needed {opponent.target + 1}</p>

            {levelOutcome === 'win' && pendingSkillPoint && (
              <div className="mb-6">
                <p className="text-orange-400 text-xs font-black uppercase tracking-widest mb-3">+1 Skill Point Earned! Assign it:</p>
                <div className="grid grid-cols-1 gap-2">
                  {SKILLS_META.map((s) => (
                    <button key={s.key} onClick={() => handleAllocateSkillPoint(s.key)}
                      className="flex justify-between items-center bg-white/5 border border-white/10 hover:border-orange-500/50 hover:bg-orange-500/10 rounded-xl px-4 py-3 text-left transition-colors">
                      <span className="text-xs font-black">{s.label}</span>
                      <span className="text-[10px] text-white/40">{character.skills[s.key]} → {character.skills[s.key] + 1}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {levelOutcome === 'win' ? (
              !pendingSkillPoint && (
                <button onClick={handleNextLevel} className="bg-orange-500 text-black font-black px-8 py-3 rounded-xl uppercase text-xs tracking-widest">
                  {levelIndex + 1 >= OPPONENTS.length ? "Claim Legend Status" : "Next Opponent"}
                </button>
              )
            ) : (
              <button onClick={handleRetryLevel} className="border border-white/20 px-8 py-3 rounded-xl uppercase text-xs tracking-widest hover:bg-white/5">
                Retry Rack
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="shot"
            initial={{ opacity: 0 }}
            animate={
              shotPhase === "result"
                ? { opacity: 1, x: lastResult === 'make' ? [0, -6, 6, -4, 4, 0] : [0, -10, 10, -8, 8, -4, 4, 0] }
                : { opacity: 1 }
            }
            transition={shotPhase === "result" ? { duration: 0.5 } : {}}
            className={`relative bg-zinc-900 rounded-2xl p-6 border ${isClutch && shotPhase !== 'result' ? 'border-red-500/60' : 'border-white/10'}`}
          >
            {isClutch && shotPhase !== 'result' && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.6)]"
              >
                🔥 Clutch Time
              </motion.div>
            )}

            {shotPhase === "ready" && (
              <div className="text-center py-8">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-6">
                  {isMoneyball ? "MONEYBALL — worth 2 points" : `Shot ${shotIndex + 1} of ${SHOTS_PER_LEVEL}`}
                </p>
                <button onClick={startShot} className="bg-orange-500 text-black font-black px-10 py-4 rounded-xl uppercase text-sm tracking-widest">
                  Take Shot
                </button>
              </div>
            )}

            {(shotPhase === "power" || shotPhase === "aim") && (
              <div className="py-4">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-[10px] uppercase tracking-widest text-white/40">
                    {shotPhase === "power" ? "STAGE 1 — POWER" : "STAGE 2 — AIM"}
                  </p>
                  <div className="w-20 h-1.5 bg-black rounded-full overflow-hidden border border-white/10">
                    <div
                      className={`h-full transition-all ${timeLeft > 40 ? 'bg-orange-500' : 'bg-red-500'}`}
                      style={{ width: `${timeLeft}%`, transitionDuration: '50ms' }}
                    />
                  </div>
                </div>
                <div className="relative w-full h-8 bg-black rounded-full overflow-hidden border border-white/10">
                  <div className="absolute top-0 bottom-0 bg-orange-500/25"
                    style={{
                      left: `${(shotPhase === 'power' ? powerTargetCenter : aimTarget) - (shotPhase === 'power' ? rangeWindow : accuracyWindow) / 2}%`,
                      width: `${shotPhase === 'power' ? rangeWindow : accuracyWindow}%`
                    }} />
                  <div className="absolute top-0 bottom-0 w-1 bg-white" style={{ left: `${shotPhase === 'power' ? powerValue : aimValue}%` }} />
                </div>
                <button onClick={shotPhase === 'power' ? lockPower : lockAim}
                  className="w-full mt-4 bg-white text-black font-black py-3 rounded-xl uppercase text-xs tracking-widest">
                  Lock In
                </button>
              </div>
            )}

            {shotPhase === "result" && (
              <div className="py-4">
                <div className="relative w-full h-52 mb-3 overflow-hidden rounded-xl bg-gradient-to-b from-zinc-950 to-black border border-white/5">
                  <svg viewBox="0 0 200 60" className="absolute top-3 left-1/2 -translate-x-1/2 w-40">
                    <rect x="70" y="0" width="60" height="10" fill="white" opacity="0.12" />
                    <ellipse cx="100" cy="16" rx="28" ry="6" fill="none" stroke="#f97316" strokeWidth="3" />
                    {[...Array(9)].map((_, i) => {
                      const x1 = 100 - 27 + (54 / 8) * i;
                      return <line key={i} x1={x1} y1="16" x2="100" y2="42" stroke="white" strokeOpacity="0.35" strokeWidth="1" />;
                    })}
                  </svg>

                  <AnimatePresence>
                    <motion.div
                      key={shotIndex}
                      className="absolute left-1/2 bottom-4 w-7 h-7 rounded-full bg-orange-500 border-2 border-orange-700"
                      style={{
                        marginLeft: '-14px',
                        backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.25), transparent 60%)'
                      }}
                      initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                      animate={
                        lastResult === 'make'
                          ? { x: [0, 0, 0], y: [0, -168, -130], opacity: [1, 1, 0], rotate: [0, 280, 400] }
                          : { x: [0, -8, 46, 95], y: [0, -172, -145, -20], opacity: [1, 1, 1, 0], rotate: [0, 260, 420, 520] }
                      }
                      transition={
                        lastResult === 'make'
                          ? { duration: 0.9, times: [0, 0.62, 1], ease: "easeOut" }
                          : { duration: 1, times: [0, 0.55, 0.75, 1], ease: "easeOut" }
                      }
                    />
                  </AnimatePresence>

                  {/* KALABALIK TEPKİSİ */}
                  <motion.div
                    key={`crowd-${shotIndex}`}
                    initial={{ opacity: 0, scale: 0.6, rotate: -6 }}
                    animate={{ opacity: [0, 1, 1, 0], scale: [0.6, 1.15, 1.05, 1], rotate: 0 }}
                    transition={{ duration: 1, delay: 0.5, times: [0, 0.3, 0.8, 1] }}
                    className={`absolute inset-0 flex items-center justify-center text-4xl font-black italic pointer-events-none ${
                      lastResult === 'make' ? 'text-emerald-500/20' : 'text-red-500/20'
                    }`}
                  >
                    {lastResult === 'make' ? (isMoneyball ? '🔥 BANG!' : '🏀 SWISH!') : wasTimeout ? '⏱ TOO SLOW!' : '😬 OHHH!'}
                  </motion.div>
                </div>

                <p className={`text-center text-2xl font-black ${lastResult === 'make' ? 'text-emerald-500' : 'text-red-500'}`}>
                  {lastResult === 'make' ? (isMoneyball ? 'SWISH! +2' : 'NOTHING BUT NET!') : wasTimeout ? 'BUZZER! TOO SLOW!' : 'RIMMED OUT'}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThreePointLegend;
