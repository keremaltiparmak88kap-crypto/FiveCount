import React, { useEffect, useState } from 'react';
import { db } from './firebaseConfig';
import { doc, onSnapshot, updateDoc, arrayUnion, setDoc, serverTimestamp } from 'firebase/firestore';
import { useGameStore } from './store';
import { getTodaysQuests } from './dailyQuestsData';

const todayStr = () => new Date().toISOString().slice(0, 10);

const DailyQuests = () => {
  const uid = useGameStore((s) => s.uid);
  const addScore = useGameStore((s) => s.addScore);
  const today = todayStr();
  const quests = getTodaysQuests(today);

  const [gameBreakdown, setGameBreakdown] = useState({});
  const [claimedQuests, setClaimedQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);

  useEffect(() => {
    if (!uid) return;
    const ref = doc(db, "dailyScores", `${uid}_${today}`);
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.data() || {};
      setGameBreakdown(data.gameBreakdown || {});
      setClaimedQuests(data.claimedQuests || []);
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, [uid, today]);

  const handleClaim = async (quest) => {
    if (!uid || claimingId) return;
    setClaimingId(quest.id);
    try {
      const ref = doc(db, "dailyScores", `${uid}_${today}`);
      await setDoc(ref, { claimedQuests: arrayUnion(quest.id), updatedAt: serverTimestamp() }, { merge: true });
      addScore(quest.reward, null); // ödül puanı — gameBreakdown'a karışmasın diye gameId vermiyoruz
    } catch (e) {
      console.warn("Quest claim failed:", e);
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 text-white">
      <h2 className="text-2xl font-black italic tracking-tighter mb-1">DAILY <span className="text-orange-500">QUESTS</span></h2>
      <p className="text-[11px] text-white/40 mb-6 uppercase tracking-widest">Resets every day at midnight — same for everyone</p>

      {loading ? (
        <p className="text-center text-white/30 text-xs py-10 uppercase tracking-widest">Loading quests…</p>
      ) : (
        <div className="space-y-3">
          {quests.map((q) => {
            const progress = Math.min(q.target, q.calc(gameBreakdown));
            const complete = progress >= q.target;
            const claimed = claimedQuests.includes(q.id);

            return (
              <div
                key={q.id}
                className={`rounded-2xl p-4 border transition-all ${
                  claimed ? 'bg-zinc-900 border-white/5 opacity-50' :
                  complete ? 'bg-gradient-to-r from-orange-500/15 to-transparent border-orange-500/40' :
                  'bg-zinc-900 border-white/10'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-bold pr-3">{q.label}</p>
                  <span className="shrink-0 text-[10px] font-black text-orange-400">+{q.reward}</span>
                </div>
                <div className="w-full h-1.5 bg-black rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full transition-all duration-500 ${complete ? 'bg-emerald-500' : 'bg-orange-500'}`}
                    style={{ width: `${(progress / q.target) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-white/40">{progress} / {q.target}</span>
                  {claimed ? (
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/30">✓ Claimed</span>
                  ) : complete ? (
                    <button
                      onClick={() => handleClaim(q)}
                      disabled={claimingId === q.id}
                      className="text-[9px] font-black uppercase tracking-widest bg-orange-500 text-black px-3 py-1.5 rounded-full disabled:opacity-50"
                    >
                      {claimingId === q.id ? "..." : "Claim"}
                    </button>
                  ) : (
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/20">In Progress</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DailyQuests;
