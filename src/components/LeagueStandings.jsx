import React from 'react';

export default function LeagueStandings({ teams, userRecord, currentMatchIndex, onSimulateMatch, totalMatches }) {
  // Kullanıcı takımını da listeye ekleyip sıralayalım
  const allTeams = [
    { id: "USER", name: "YOUR SQUAD (FIVECOURT)", ovr: "Dynamic", w: userRecord.w, l: userRecord.l },
    ...teams
  ].sort((a, b) => b.w - a.w || a.l - b.l);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
      {/* PUAN DURUMU TABLOSU */}
      <div className="lg:col-span-2 bg-black/90 border-2 border-slate-900 p-6 backdrop-blur-md">
        <div className="text-xs text-orange-500 font-bold mb-4">// REGULAR_SEASON_STANDINGS</div>
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-500">
              <th className="py-2">POS</th>
              <th>TEAM</th>
              <th>WINS</th>
              <th>LOSSES</th>
            </tr>
          </thead>
          <tbody>
            {allTeams.map((team, idx) => (
              <tr key={team.id} className={`border-b border-slate-900/50 ${team.id === "USER" ? "text-orange-400 bg-orange-500/5 font-black" : "text-slate-300"}`}>
                <td className="py-3 font-bold">#{idx + 1}</td>
                <td>{team.name}</td>
                <td className="text-emerald-400">{team.w}</td>
                <td className="text-red-500">{team.l}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AKSİYON PANELİ / SIRADAKİ MAÇ */}
      <div className="space-y-6">
        <div className="bg-black/90 border-2 border-orange-500/20 p-6 text-center">
          <div className="text-[10px] text-slate-500 mb-2">// NEXT_CHALLENGE</div>
          {currentMatchIndex < totalMatches ? (
            <>
              <div className="text-2xl font-black text-white uppercase italic tracking-tighter mb-1">
                VS {teams[currentMatchIndex]?.name}
              </div>
              <div className="text-xs text-slate-400 mb-6">Opponent OVR: {teams[currentMatchIndex]?.ovr}</div>
              <button onClick={onSimulateMatch} className="w-full bg-orange-500 hover:bg-orange-400 text-black font-black py-4 text-xs tracking-widest uppercase transition-all shadow-lg shadow-orange-500/10">
                ⚡ SIMULATE NEXT MATCH
              </button>
            </>
          ) : (
            <div className="py-6">
              <div className="text-emerald-400 font-black text-lg mb-2">SEASON CONCLUDED</div>
              <p className="text-xs text-slate-400 mb-4">Top teams are advancing to the Play-offs.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}