import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PLAYERS } from './playerManager';
import { getTodaysGrid, checkCriterion } from './hoopGridData';
import { useGameStore } from './store';
import { db } from './firebaseConfig';
import { doc, setDoc, getDoc, increment } from 'firebase/firestore';

const todayStr = () => new Date().toISOString().slice(0, 10);

// Rarity yüzdesine göre renk/etiket (Immaculate Grid tarzı: nadir = altın, yaygın = gri)
const rarityStyle = (pct) => {
  if (pct <= 10) return { color: 'text-yellow-400', border: 'border-yellow-400/40', bg: 'bg-yellow-400/10', tag: '🏆 RARE' };
  if (pct <= 30) return { color: 'text-emerald-400', border: 'border-emerald-400/40', bg: 'bg-emerald-400/10', tag: '⭐ SOLID' };
  return { color: 'text-white/60', border: 'border-white/15', bg: 'bg-white/5', tag: 'COMMON' };
};

const HoopGrid = () => {
  const addScore = useGameStore((s) => s.addScore);
  const { rows, cols } = useMemo(() => getTodaysGrid(), []);

  const [cells, setCells] = useState(() =>
    Array(9).fill(null).map(() => ({ filled: false, player: null, rarity: null, error: false }))
  );
  const [activeCell, setActiveCell] = useState(null); // 0-8 ya da null
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [finished, setFinished] = useState(false);
  const [totalScore, setTotalScore] = useState(0);

  const suggestions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return [];
    return PLAYERS.filter((p) => p.name.toLowerCase().includes(term)).slice(0, 6);
  }, [searchTerm]);

  const filledCount = cells.filter((c) => c.filled).length;

  const handleCellClick = (idx) => {
    if (cells[idx].filled) return;
    setActiveCell(idx);
    setSearchTerm('');
  };

  const handleGuess = async (player) => {
    if (activeCell === null || submitting) return;
    const rowCrit = rows[Math.floor(activeCell / 3)];
    const colCrit = cols[activeCell % 3];

    const isCorrect = checkCriterion(player, rowCrit) && checkCriterion(player, colCrit);

    if (!isCorrect) {
      setCells((prev) => {
        const next = [...prev];
        next[activeCell] = { ...next[activeCell], error: true };
        return next;
      });
      setTimeout(() => {
        setCells((prev) => {
          const next = [...prev];
          next[activeCell] = { ...next[activeCell], error: false };
          return next;
        });
      }, 500);
      return;
    }

    setSubmitting(true);
    let rarity = 50; // varsayılan (Firestore erişilemezse)
    try {
      const docId = `${todayStr()}_${activeCell}`;
      const ref = doc(db, 'box2boxStats', docId);
      await setDoc(ref, { [`answers.${player.id}`]: increment(1), total: increment(1) }, { merge: true });
      const snap = await getDoc(ref);
      const data = snap.data() || {};
      const total = data.total || 1;
      const mine = data.answers?.[player.id] || 1;
      rarity = Math.round((mine / total) * 100);
    } catch (e) {
      console.warn('Rarity senkronizasyonu başarısız:', e);
    }

    const points = Math.max(15, Math.round(115 - rarity));

    setCells((prev) => {
      const next = [...prev];
      next[activeCell] = { filled: true, player, rarity, error: false };
      return next;
    });
    setTotalScore((s) => s + points);
    setActiveCell(null);
    setSearchTerm('');
    setSubmitting(false);
  };

  const handleFinish = () => {
    addScore(totalScore, 'box2box');
    setFinished(true);
  };

  const shareText = () => {
    const emojiGrid = cells
      .map((c) => {
        if (!c.filled) return '⬛';
        if (c.rarity <= 10) return '🟨';
        if (c.rarity <= 30) return '🟩';
        return '⬜';
      })
      .reduce((acc, e, i) => acc + e + (i % 3 === 2 ? '\n' : ''), '');
    return `FiveCourt Box2Box - ${totalScore} pts\n${emojiGrid}`;
  };

  const handleShare = () => {
    const text = shareText();
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="max-w-md mx-auto p-6 text-white">
      <div className="text-center mb-5">
        <h1 className="text-2xl font-black italic tracking-tighter">BOX<span className="text-orange-500">2BOX</span></h1>
        <p className="text-[9px] text-white/25 uppercase tracking-[0.3em] mt-0.5">Daily Puzzle / Real Player Rarity</p>
      </div>

      <div className="flex justify-between items-center mb-4 px-1">
        <p className="text-[10px] uppercase tracking-widest text-white/40">{filledCount} / 9 filled</p>
        <p className="text-sm font-black text-orange-400">{totalScore.toLocaleString()} pts</p>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-4 gap-1.5 mb-5">
        <div />
        {cols.map((c) => (
          <div key={c.id} className="h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-1 text-center">
            <span className="text-[9px] font-black uppercase leading-tight text-white/70">{c.label}</span>
          </div>
        ))}

        {rows.map((r, rowIdx) => (
          <React.Fragment key={r.id}>
            <div className="h-20 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-1 text-center">
              <span className="text-[9px] font-black uppercase leading-tight text-white/70">{r.label}</span>
            </div>
            {cols.map((c, colIdx) => {
              const idx = rowIdx * 3 + colIdx;
              const cell = cells[idx];
              const style = cell.filled ? rarityStyle(cell.rarity) : null;
              return (
                <motion.button
                  key={idx}
                  onClick={() => handleCellClick(idx)}
                  animate={cell.error ? { x: [0, -6, 6, -4, 4, 0] } : {}}
                  className={`relative h-20 rounded-xl border flex flex-col items-center justify-center p-1 text-center transition-colors ${
                    cell.filled
                      ? `${style.bg} ${style.border}`
                      : activeCell === idx
                      ? 'bg-orange-500/15 border-orange-500/50'
                      : 'bg-white/5 border-white/10 hover:border-orange-500/30'
                  }`}
                >
                  {cell.filled ? (
                    <>
                      <span className={`text-[9px] font-black leading-tight ${style.color}`}>{cell.player.name}</span>
                      <span className={`text-[7px] font-bold uppercase tracking-wide mt-1 ${style.color}`}>{cell.rarity}% · {style.tag}</span>
                    </>
                  ) : (
                    <span className="text-white/20 text-xl">+</span>
                  )}
                </motion.button>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* ARAMA / OYUNCU SEÇİMİ */}
      {activeCell !== null && !finished && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] uppercase tracking-widest text-white/40">
              {rows[Math.floor(activeCell / 3)].label} x {cols[activeCell % 3].label}
            </p>
            <button onClick={() => setActiveCell(null)} className="text-white/30 text-xs hover:text-white">✕</button>
          </div>
          <input
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search player name..."
            className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-orange-500 mb-2"
          />
          {suggestions.length > 0 && (
            <div className="space-y-1.5">
              {suggestions.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleGuess(p)}
                  disabled={submitting}
                  className="w-full text-left px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-orange-500/40 hover:bg-orange-500/10 transition-colors text-sm font-bold disabled:opacity-40"
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* BİTİR / PAYLAŞ */}
      {!finished ? (
        <button
          onClick={handleFinish}
          disabled={filledCount === 0}
          className="w-full bg-orange-500 disabled:bg-zinc-800 disabled:text-white/30 text-black font-black py-4 rounded-xl uppercase text-xs tracking-widest transition-colors"
        >
          {filledCount === 9 ? 'Finish Grid' : `Finish Early (${filledCount}/9)`}
        </button>
      ) : (
        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 text-center">
          <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Final Score</p>
          <h2 className="text-4xl font-black text-orange-500 mb-4">{totalScore.toLocaleString()}</h2>
          <button onClick={handleShare} className="w-full bg-[#1DA1F2] hover:bg-blue-500 text-white font-black py-4 rounded-xl uppercase text-xs tracking-widest transition-colors">
            Share on X
          </button>
        </div>
      )}
    </div>
  );
};

export default HoopGrid;
