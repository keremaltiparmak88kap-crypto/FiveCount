import React, { useEffect, useState } from 'react';
import { db } from './firebaseConfig';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { useGameStore } from './store';

const GAME_LABELS = {
  missing: "MISSING 5",
  code: "COURT CODE",
  trivia: "TRIVIA",
  manager: "MANAGER",
  career: "CAREER",
  bingo: "BINGO",
  grid: "TEAM GRID",
  find: "FIND TEAM",
  draft: "DRAFT ROUL.",
  jersey: "JERSEY #",
  match: "TAG MATCH",
  threes: "3PT LEGEND"
};

// Bu üç yardımcı fonksiyon store.js'tekiyle BİREBİR aynı olmalı,
// yoksa doküman ID'leri (ve dolayısıyla sorgular) uyuşmaz.
const todayStr = () => new Date().toISOString().slice(0, 10);
const weekStr = (d = new Date()) => {
  const onejan = new Date(d.getFullYear(), 0, 1);
  const weekNum = Math.ceil((((d - onejan) / 86400000) + onejan.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
};
const monthStr = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

const TABS = [
  { id: "total", label: "All-Time" },
  { id: "daily", label: "Today" },
  { id: "weekly", label: "This Week" },
  { id: "monthly", label: "This Month" }
];

const Leaderboard = () => {
  const uid = useGameStore((s) => s.uid);
  const [tab, setTab] = useState("total"); // total | daily | weekly | monthly | game
  const [selectedGame, setSelectedGame] = useState("threes");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    let q;

    if (tab === "total") {
      q = query(collection(db, "players"), orderBy("totalScore", "desc"), limit(50));
    } else if (tab === "daily") {
      q = query(collection(db, "dailyScores"), where("date", "==", todayStr()), orderBy("dailyTotal", "desc"), limit(50));
    } else if (tab === "weekly") {
      q = query(collection(db, "weeklyScores"), where("week", "==", weekStr()), orderBy("weeklyTotal", "desc"), limit(50));
    } else if (tab === "monthly") {
      q = query(collection(db, "monthlyScores"), where("month", "==", monthStr()), orderBy("monthlyTotal", "desc"), limit(50));
    } else {
      q = query(collection(db, "gameScores"), where("gameId", "==", selectedGame), orderBy("bestScore", "desc"), limit(50));
    }

    const unsub = onSnapshot(
      q,
      (snap) => {
        setRows(snap.docs.map((d) => d.data()));
        setLoading(false);
      },
      (err) => {
        console.warn("Leaderboard query failed:", err);
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [tab, selectedGame]);

  const scoreField =
    tab === "total" ? "totalScore" :
    tab === "daily" ? "dailyTotal" :
    tab === "weekly" ? "weeklyTotal" :
    tab === "monthly" ? "monthlyTotal" :
    "bestScore";

  return (
    <div className="max-w-md mx-auto p-6 text-white">
      <h2 className="text-2xl font-black italic tracking-tighter mb-1">LEADER<span className="text-orange-500">BOARD</span></h2>
      <p className="text-[11px] text-white/40 mb-6 uppercase tracking-widest">Live rankings across all players</p>

      <div className="grid grid-cols-4 gap-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-colors ${
              tab === t.id ? 'bg-orange-500 text-black border-orange-500' : 'bg-zinc-900 border-white/10 text-white/50 hover:border-white/20'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <button
        onClick={() => setTab("game")}
        className={`w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors mb-4 ${
          tab === "game" ? 'bg-orange-500 text-black border-orange-500' : 'bg-zinc-900 border-white/10 text-white/50 hover:border-white/20'
        }`}
      >
        By Game
      </button>

      {tab === "game" && (
        <select
          value={selectedGame}
          onChange={(e) => setSelectedGame(e.target.value)}
          className="w-full mb-4 bg-zinc-900 border border-white/10 rounded-xl p-3 text-xs text-white uppercase tracking-widest outline-none focus:border-orange-500"
        >
          {Object.entries(GAME_LABELS).map(([id, label]) => (
            <option key={id} value={id}>{label}</option>
          ))}
        </select>
      )}

      {loading ? (
        <p className="text-center text-white/30 text-xs py-10 uppercase tracking-widest">Loading rankings…</p>
      ) : error ? (
        <div className="text-center text-red-400 text-[11px] py-10 px-4 leading-relaxed">
          Couldn't load the leaderboard.<br />
          <span className="text-white/30">
            (If this is your first run, Firestore may need a composite index — check the browser console for a link to create it automatically.)
          </span>
        </div>
      ) : rows.length === 0 ? (
        <p className="text-center text-white/30 text-xs py-10 uppercase tracking-widest">No scores yet — be the first!</p>
      ) : (
        <div className="space-y-2">
          {rows.map((row, i) => (
            <div
              key={row.uid || i}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border ${
                row.uid === uid ? 'bg-orange-500/10 border-orange-500/40' : 'bg-zinc-900 border-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-6 text-center font-black text-sm ${
                  i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-600' : 'text-white/30'
                }`}>
                  {i + 1}
                </span>
                <span className="font-bold text-sm truncate max-w-[140px]">
                  {row.username || "Anonymous"}
                  {row.tag && <span className="text-white/30 font-normal">#{row.tag}</span>}
                </span>
                {row.uid === uid && <span className="text-[8px] text-orange-400 font-black uppercase">You</span>}
              </div>
              <span className="font-black text-orange-400 text-sm">{row[scoreField] ?? 0}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
