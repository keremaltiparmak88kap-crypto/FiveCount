import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Search, Shield, Shirt, Star, Trophy, X } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { getDailyItem } from './dailyRotation';
import { PLAYERS, validateInteraction } from './playerManager';
import { useGameStore } from './store';

const NBA_TEAMS = {
  LAL: { id: "LAL", short: "LAL", name: "Lakers", fullName: "Los Angeles Lakers", logo: "https://a.espncdn.com/i/teamlogos/nba/500/lal.png" },
  GSW: { id: "GSW", short: "GSW", name: "Warriors", fullName: "Golden State Warriors", logo: "https://a.espncdn.com/i/teamlogos/nba/500/gs.png" },
  MIA: { id: "MIA", short: "MIA", name: "Heat", fullName: "Miami Heat", logo: "https://a.espncdn.com/i/teamlogos/nba/500/mia.png" },
  BOS: { id: "BOS", short: "BOS", name: "Celtics", fullName: "Boston Celtics", logo: "https://a.espncdn.com/i/teamlogos/nba/500/bos.png" },
  PHX: { id: "PHX", short: "PHX", name: "Suns", fullName: "Phoenix Suns", logo: "https://a.espncdn.com/i/teamlogos/nba/500/phx.png" },
  LAC: { id: "LAC", short: "LAC", name: "Clippers", fullName: "LA Clippers", logo: "https://a.espncdn.com/i/teamlogos/nba/500/lac.png" },
  DEN: { id: "DEN", short: "DEN", name: "Nuggets", fullName: "Denver Nuggets", logo: "https://a.espncdn.com/i/teamlogos/nba/500/den.png" },
  DAL: { id: "DAL", short: "DAL", name: "Mavericks", fullName: "Dallas Mavericks", logo: "https://a.espncdn.com/i/teamlogos/nba/500/dal.png" },
  MIL: { id: "MIL", short: "MIL", name: "Bucks", fullName: "Milwaukee Bucks", logo: "https://a.espncdn.com/i/teamlogos/nba/500/mil.png" },
};

const CATEGORIES = {
  CHAMPION: { id: "CHAMPION", match: "Champion", label: "Champion", icon: Trophy },
  USA: { id: "USA", match: "USA", label: "USA", icon: Shield },
  ALL_STAR: { id: "ALL_STAR", match: "All-Star", label: "All-Star", icon: Star },
  MVP: { id: "MVP", match: "MVP", label: "MVP", icon: Trophy },
  THREE_POINT: { id: "THREE_POINT", match: "3-Point King", label: "3PT King", icon: Shirt },
  POINT_GUARD: { id: "POINT_GUARD", match: "Point Guard", label: "Point Guard", icon: Shirt },
};

const PUZZLES = [
  {
    id: "rings-and-stars",
    title: "Rings & Stars",
    teams: ["LAL", "GSW", "MIA"],
    categories: ["CHAMPION", "USA", "ALL_STAR"],
  },
  {
    id: "modern-icons",
    title: "Modern Icons",
    teams: ["DEN", "DAL", "MIL"],
    categories: ["MVP", "USA", "ALL_STAR"],
  },
  {
    id: "shot-makers",
    title: "Shot Makers",
    teams: ["BOS", "PHX", "LAC"],
    categories: ["ALL_STAR", "USA", "THREE_POINT"],
  },
];

const todayStr = () => new Date().toISOString().slice(0, 10);

const normalizePlayer = (player) => ({
  id: player.id || player.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  name: player.name,
  team: player.team || null,
  category: player.category || null,
  nationality: player.nationality || null,
  traits: player.traits || [],
  pastTeams: player.pastTeams || [],
  mentor: player.mentor || null,
  ovr: player.ovr || null,
});

const loadDailyApiPlayers = async () => {
  const snap = await getDoc(doc(db, "dailyApiPlayers", todayStr()));
  if (!snap.exists()) return [];
  return (snap.data()?.players || []).map(normalizePlayer).filter((p) => p.name);
};

const playerMatchesTeam = (player, teamId) => {
  return player.team === teamId || player.pastTeams.includes(teamId);
};

const playerMatchesBox = (player, teamId, categoryMatch) => {
  return playerMatchesTeam(player, teamId) && validateInteraction(player, categoryMatch);
};

// Basit seed'lenmiş karıştırma (dailyRotation.js'teki mantığın aynısı).
const seededShuffle = (array, seed) => {
  const arr = [...array];
  let s = seed || 1;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// Her gün NBA_TEAMS + CATEGORIES havuzundan rastgele 3+3 seçip, sadece YEREL (curated)
// oyuncu verisiyle bile 9 kutunun da çözülebilir olduğunu garanti ediyoruz. API'den gelen
// oyuncular bonus seçenek olarak eklenir ama çözülebilirlik garantisi API'ye bağımlı değil
// (API verisi henüz gelmemiş olsa bile oyun her zaman oynanabilir).
const buildTodaysPuzzle = () => {
  const daysSinceEpoch = Math.floor(Date.now() / 86400000);
  const teamKeys = Object.keys(NBA_TEAMS);
  const categoryKeys = Object.keys(CATEGORIES);
  const localPlayers = PLAYERS.map(normalizePlayer);

  for (let attempt = 0; attempt < 60; attempt++) {
    const seed = daysSinceEpoch + 1 + attempt * 977;
    const teams = seededShuffle(teamKeys, seed).slice(0, 3);
    const cats = seededShuffle(categoryKeys, seed + 13).slice(0, 3);

    let solvable = true;
    for (const t of teams) {
      for (const c of cats) {
        const hasMatch = localPlayers.some((p) => playerMatchesBox(p, t, CATEGORIES[c].match));
        if (!hasMatch) { solvable = false; break; }
      }
      if (!solvable) break;
    }

    if (solvable) {
      return { id: `daily-${daysSinceEpoch}`, title: "Daily Grid", teams, categories: cats };
    }
  }

  // Güvenlik ağı — elle yazılmış, bilinen çözülebilir bulmacalardan biri
  return getDailyItem(PUZZLES);
};

const BasketballBox2BoxGame = () => {
  const addScore = useGameStore((state) => state.addScore);
  const puzzle = useMemo(() => buildTodaysPuzzle(), []);
  const teams = puzzle.teams.map((id) => NBA_TEAMS[id]);
  const categories = puzzle.categories.map((id) => CATEGORIES[id]);

  const [apiPlayers, setApiPlayers] = useState([]);
  const [apiStatus, setApiStatus] = useState("local");
  const [selectedBox, setSelectedBox] = useState(null);
  const [filled, setFilled] = useState({});
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [mistake, setMistake] = useState(null);
  const [wrongCount, setWrongCount] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [nameMode, setNameMode] = useState("short"); // "short" (LAL) <-> "full" (Los Angeles Lakers)
  const [logoError, setLogoError] = useState({});

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const loaded = await loadDailyApiPlayers();
        if (cancelled) return;
        setApiPlayers(loaded);
        setApiStatus(loaded.length ? "api" : "local");
      } catch {
        if (!cancelled) setApiStatus("local");
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const players = useMemo(() => {
    const merged = [...PLAYERS, ...apiPlayers].map(normalizePlayer);
    const byName = new Map();
    merged.forEach((player) => byName.set(player.name.toLowerCase(), player));
    return [...byName.values()];
  }, [apiPlayers]);

  const totalBoxes = teams.length * categories.length;
  const filledCount = Object.keys(filled).length;
  const progress = Math.round((filledCount / totalBoxes) * 100);

  const suggestions = useMemo(() => {
    const clean = query.trim().toLowerCase();
    if (clean.length < 2) return [];

    return players
      .filter((player) => player.name.toLowerCase().includes(clean))
      .slice(0, 8);
  }, [players, query]);

  const getBoxKey = (teamId, categoryId) => `${teamId}-${categoryId}`;

  const handleBoxSelect = (teamId, categoryId) => {
    const key = getBoxKey(teamId, categoryId);
    if (filled[key] || finished) return;
    setSelectedBox({ teamId, categoryId });
    setMessage("");
    setMistake(null);
  };

  const handlePlayerPick = (player) => {
    if (!selectedBox) {
      setMessage("Once bir kutu sec.");
      return;
    }

    const category = CATEGORIES[selectedBox.categoryId];
    const key = getBoxKey(selectedBox.teamId, selectedBox.categoryId);

    if (!playerMatchesBox(player, selectedBox.teamId, category.match)) {
      setWrongCount((count) => count + 1);
      setMistake(key);
      setMessage(`${player.name} bu kutuya uymuyor.`);
      setTimeout(() => setMistake(null), 650);
      return;
    }

    setFilled((current) => {
      const next = {
        ...current,
        [key]: {
          player: player.name,
          teamId: selectedBox.teamId,
          categoryId: selectedBox.categoryId,
        },
      };

      if (Object.keys(next).length === totalBoxes) setFinished(true);
      return next;
    });

    setScore((value) => value + 100);
    addScore(100, "box2box");
    setQuery("");
    setMessage("");
    setSelectedBox(null);
  };

  const useHint = () => {
    if (!selectedBox) {
      setMessage("Ipucu icin once bos bir kutu sec.");
      return;
    }

    const category = CATEGORIES[selectedBox.categoryId];
    const answer = players.find((player) => playerMatchesBox(player, selectedBox.teamId, category.match));

    if (!answer) {
      setMessage("Bu kutu icin mevcut veri havuzunda cevap yok.");
      return;
    }

    setMessage(`Ipucu: ${answer.name.split(" ").slice(-1)[0]}`);
  };

  const restart = () => {
    setSelectedBox(null);
    setFilled({});
    setQuery("");
    setMessage("");
    setMistake(null);
    setWrongCount(0);
    setScore(0);
    setFinished(false);
  };

  return (
    <div className="min-h-screen text-white flex flex-col items-center px-3 pb-10">
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
              className="w-full max-w-sm rounded-3xl border border-white/10 bg-zinc-950 p-8 text-center"
            >
              <p className="text-[10px] uppercase tracking-[0.35em] text-white/35 mb-2">Grid Complete</p>
              <h2 className="text-5xl font-black text-orange-500 mb-2">{score}</h2>
              <p className="text-xs text-white/40 mb-8">Wrong guesses: {wrongCount}</p>
              <button
                onClick={restart}
                className="w-full rounded-2xl bg-orange-500 py-4 text-black font-black uppercase text-[11px] tracking-widest"
              >
                Play Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-md text-center mb-5">
        <h1 className="text-3xl font-black italic tracking-tight">
          BOX<span className="text-orange-500">2BOX</span>
        </h1>
        <p className="text-[9px] uppercase tracking-[0.3em] text-white/30 mt-1">{puzzle.title} Daily Grid</p>
        <button
          onClick={() => setNameMode((m) => (m === "short" ? "full" : "short"))}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-white/50 hover:border-orange-500/40 hover:text-white transition-colors"
        >
          {nameMode === "short" ? "Show Full Names" : "Show Short Codes"}
        </button>
      </div>

      <div className="w-full max-w-md mb-4 grid grid-cols-4 gap-1.5 text-center">
        <div className="rounded-lg bg-white/5 border border-white/10 p-2">
          <p className="text-[9px] font-black text-orange-400">{totalBoxes}</p>
          <p className="text-[8px] uppercase text-white/30">Boxes</p>
        </div>
        <div className="rounded-lg bg-white/5 border border-white/10 p-2">
          <p className="text-[9px] font-black text-orange-400">{filledCount}</p>
          <p className="text-[8px] uppercase text-white/30">Filled</p>
        </div>
        <div className="rounded-lg bg-white/5 border border-white/10 p-2">
          <p className="text-[9px] font-black text-orange-400">{players.length}</p>
          <p className="text-[8px] uppercase text-white/30">Players</p>
        </div>
        <div className="rounded-lg bg-white/5 border border-white/10 p-2">
          <p className="text-[9px] font-black text-orange-400">{progress}%</p>
          <p className="text-[8px] uppercase text-white/30">Done</p>
        </div>
      </div>

      <div className="w-full max-w-md mb-3 relative">
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 rounded-xl border-2 border-orange-500 bg-white px-3 py-3 text-black">
            <Search size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Player..."
              className="w-full bg-transparent outline-none text-sm"
            />
          </div>
          <button
            onClick={useHint}
            className="rounded-xl bg-orange-500 px-4 text-black font-black text-[11px] uppercase"
          >
            Hint
          </button>
        </div>

        {suggestions.length > 0 && (
          <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-zinc-950 shadow-2xl">
            {suggestions.map((player) => (
              <button
                key={player.id}
                onClick={() => handlePlayerPick(player)}
                className="w-full px-4 py-3 text-left border-b border-white/5 hover:bg-orange-500/10 transition-colors"
              >
                <span className="block text-sm font-black">{player.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-full max-w-md min-h-6 mb-2">
        {message && <p className="text-center text-[11px] font-bold text-orange-200">{message}</p>}
      </div>

      <div className="w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-zinc-950">
        <div className="grid grid-cols-4">
          <div className="h-24 bg-zinc-900 flex flex-col items-center justify-center border-r border-white/10">
            <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center mb-1">
              <span className="text-black text-xl font-black">5</span>
            </div>
            <span className="text-[10px] font-black">FIVECOURT</span>
          </div>

          {teams.map((team) => (
            <div
              key={team.id}
              className="h-24 flex flex-col items-center justify-center gap-1 border-r border-white/10 bg-zinc-900 p-1"
            >
              {logoError[team.id] ? (
                <div className="h-10 w-10 rounded-full bg-orange-500/15 border border-orange-500/40 flex items-center justify-center">
                  <span className="text-[10px] font-black text-orange-400">{team.short}</span>
                </div>
              ) : (
                <img
                  src={team.logo}
                  alt=""
                  className="h-10 w-10 object-contain"
                  onError={() => setLogoError((prev) => ({ ...prev, [team.id]: true }))}
                />
              )}
              <span className="text-[10px] font-black text-center leading-tight px-0.5">
                {nameMode === "short" ? team.short : team.fullName}
              </span>
            </div>
          ))}

          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <div key={category.id} className="contents">
                <div className="h-28 flex flex-col items-center justify-center gap-1 border-t border-white/10 bg-zinc-900 p-2 text-center">
                  <Icon size={20} className="text-orange-400" />
                  <span className="text-[9px] font-black uppercase leading-tight">{category.label}</span>
                </div>

                {teams.map((team) => {
                  const key = getBoxKey(team.id, category.id);
                  const solved = filled[key];
                  const selected = selectedBox?.teamId === team.id && selectedBox?.categoryId === category.id;
                  const wrong = mistake === key;

                  return (
                    <button
                      key={key}
                      onClick={() => handleBoxSelect(team.id, category.id)}
                      className={`h-28 border-t border-l border-white/10 p-2 flex flex-col items-center justify-center text-center transition-colors ${
                        solved
                          ? "bg-emerald-500/20"
                          : wrong
                            ? "bg-red-500/25"
                            : selected
                              ? "bg-orange-500/25"
                              : "bg-white/[0.04] hover:bg-orange-500/10"
                      }`}
                    >
                      {solved ? (
                        <>
                          <Check size={18} className="text-emerald-300 mb-1" />
                          <span className="text-[10px] font-black leading-tight text-emerald-100">{solved.player}</span>
                        </>
                      ) : wrong ? (
                        <>
                          <X size={20} className="text-red-300 mb-1" />
                          <span className="text-[9px] font-black text-red-100">TRY AGAIN</span>
                        </>
                      ) : (
                        <>
                          <Shirt size={30} className="text-white/15 mb-1" />
                          <span className="text-[9px] font-black text-white/25">FIND PLAYER</span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full max-w-md mt-5 flex justify-between text-[10px] text-white/35">
        <span>{apiStatus === "api" ? "API data active" : "Local data active"}</span>
        <span>{score} pts</span>
      </div>
    </div>
  );
};

export default BasketballBox2BoxGame;
