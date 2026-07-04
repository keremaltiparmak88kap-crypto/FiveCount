import React, { useEffect, useState } from 'react';
import { db } from './firebaseConfig';
import {
  doc, getDoc, setDoc, onSnapshot,
  collection, query, where, limit, getDocs,
  arrayUnion, arrayRemove, serverTimestamp
} from 'firebase/firestore';
import { useGameStore } from './store';
import { generateTag } from './store';

const Friends = () => {
  const uid = useGameStore((s) => s.uid);
  const username = useGameStore((s) => s.username);
  const myTotalScore = useGameStore((s) => s.totalScore);

  const [friendUids, setFriendUids] = useState([]);
  const [friendProfiles, setFriendProfiles] = useState([]); // [{uid, username, totalScore}]
  const [loadingFriends, setLoadingFriends] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // Kendi arkadaş listemi (uid listesi) canlı dinle
  useEffect(() => {
    if (!uid) return;
    const ref = doc(db, "friends", uid);
    const unsub = onSnapshot(ref, (snap) => {
      setFriendUids(snap.exists() ? (snap.data().friendUids || []) : []);
    });
    return () => unsub();
  }, [uid]);

  // Arkadaş uid listesi değiştikçe, her birinin profilini (isim + skor) çek
  useEffect(() => {
    const loadProfiles = async () => {
      setLoadingFriends(true);
      const profiles = await Promise.all(
        friendUids.map(async (fUid) => {
          try {
            const snap = await getDoc(doc(db, "players", fUid));
            return snap.exists() ? { uid: fUid, username: snap.data().username || "Anonymous", tag: snap.data().tag, totalScore: snap.data().totalScore || 0 } : null;
          } catch (e) {
            return null;
          }
        })
      );
      setFriendProfiles(profiles.filter(Boolean));
      setLoadingFriends(false);
    };
    if (friendUids.length > 0) loadProfiles();
    else { setFriendProfiles([]); setLoadingFriends(false); }
  }, [friendUids]);

  const handleSearch = async () => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return;
    setSearching(true);
    setSearchError(null);
    try {
      const q = query(collection(db, "players"), where("usernameLower", "==", term), limit(5));
      const snap = await getDocs(q);
      const results = snap.docs
        .map((d) => ({ uid: d.id, username: d.data().username, tag: d.data().tag, totalScore: d.data().totalScore || 0 }))
        .filter((r) => r.uid !== uid); // kendini sonuçlardan çıkar
      setSearchResults(results);
      if (results.length === 0) setSearchError("No player found with that exact username.");
    } catch (e) {
      setSearchError("Search failed. Try again.");
    } finally {
      setSearching(false);
    }
  };

  const addFriend = async (friendUid) => {
    if (!uid) return;
    try {
      await setDoc(doc(db, "friends", uid), {
        friendUids: arrayUnion(friendUid),
        updatedAt: serverTimestamp()
      }, { merge: true });
      setSearchResults((prev) => prev.filter((r) => r.uid !== friendUid));
    } catch (e) {
      console.warn("Add friend failed:", e);
    }
  };

  const removeFriend = async (friendUid) => {
    if (!uid) return;
    try {
      await setDoc(doc(db, "friends", uid), {
        friendUids: arrayRemove(friendUid)
      }, { merge: true });
    } catch (e) {
      console.warn("Remove friend failed:", e);
    }
  };

  // Kendini + arkadaşları birleştirip skora göre sırala (mini leaderboard)
  const combinedBoard = [
    { uid, username: username || "You", tag: generateTag(uid), totalScore: myTotalScore, isMe: true },
    ...friendProfiles
  ].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="max-w-md mx-auto p-6 text-white">
      <h2 className="text-2xl font-black italic tracking-tighter mb-1">
        FRIENDS
      </h2>
      <p className="text-[11px] text-white/40 mb-6 uppercase tracking-widest">Add friends by exact username</p>

      {/* ARAMA */}
      <div className="flex gap-2 mb-2">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
          placeholder="Search username..."
          className="flex-1 bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-orange-500"
        />
        <button
          onClick={handleSearch}
          disabled={searching || !searchTerm.trim()}
          className="bg-orange-500 disabled:bg-zinc-800 disabled:text-white/30 text-black font-black px-5 rounded-xl text-xs uppercase tracking-widest"
        >
          {searching ? "..." : "Search"}
        </button>
      </div>

      {searchError && <p className="text-[10px] text-red-400 mb-4">{searchError}</p>}

      {searchResults.length > 0 && (
        <div className="space-y-2 mb-6">
          {searchResults.map((r) => (
            <div key={r.uid} className="flex items-center justify-between bg-zinc-900 border border-white/10 rounded-xl px-4 py-3">
              <span className="font-bold text-sm">
                {r.username}
                {r.tag && <span className="text-white/30 font-normal">#{r.tag}</span>}
              </span>
              <button
                onClick={() => addFriend(r.uid)}
                className="text-[9px] font-black uppercase tracking-widest bg-orange-500 text-black px-3 py-1.5 rounded-full"
              >
                Add
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MİNİ LEADERBOARD: SEN + ARKADAŞLARIN */}
      <p className="text-[9px] uppercase tracking-[0.3em] text-white/30 mb-2">You & Your Friends</p>

      {loadingFriends ? (
        <p className="text-center text-white/30 text-xs py-8 uppercase tracking-widest">Loading…</p>
      ) : (
        <div className="space-y-2">
          {combinedBoard.map((p, i) => (
            <div
              key={p.uid || i}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border ${
                p.isMe ? 'bg-orange-500/10 border-orange-500/40' : 'bg-zinc-900 border-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-6 text-center font-black text-sm ${
                  i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-600' : 'text-white/30'
                }`}>
                  {i + 1}
                </span>
                <span className="font-bold text-sm truncate max-w-[120px]">
                  {p.username}
                  {p.tag && <span className="text-white/30 font-normal">#{p.tag}</span>}
                </span>
                {p.isMe && <span className="text-[8px] text-orange-400 font-black uppercase">You</span>}
              </div>
              <div className="flex items-center gap-3">
                <span className="font-black text-orange-400 text-sm">{p.totalScore.toLocaleString()}</span>
                {!p.isMe && (
                  <button onClick={() => removeFriend(p.uid)} className="text-white/20 hover:text-red-400 text-xs">✕</button>
                )}
              </div>
            </div>
          ))}

          {friendProfiles.length === 0 && (
            <p className="text-center text-white/30 text-[11px] py-6">
              No friends added yet — search above to add your first one.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Friends;
