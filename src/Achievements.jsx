import React from 'react';
import { useGameStore } from './store';
import { ACHIEVEMENTS } from './achievementsData';

const Achievements = () => {
  const state = useGameStore();
  const unlockedCount = ACHIEVEMENTS.filter((a) => a.check(state)).length;

  return (
    <div className="max-w-md mx-auto p-6 text-white">
      <h2 className="text-2xl font-black italic tracking-tighter mb-1">
        ACHIEVE<span className="text-orange-500">MENTS</span>
      </h2>
      <p className="text-[11px] text-white/40 mb-2 uppercase tracking-widest">
        {unlockedCount} / {ACHIEVEMENTS.length} unlocked
      </p>

      <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-orange-500 transition-all duration-500"
          style={{ width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {ACHIEVEMENTS.map((a) => {
          const unlocked = a.check(state);
          return (
            <div
              key={a.id}
              className={`rounded-2xl p-4 border transition-all ${
                unlocked
                  ? 'bg-gradient-to-b from-orange-500/10 to-transparent border-orange-500/40'
                  : 'bg-zinc-900 border-white/5 opacity-50'
              }`}
            >
              <div className={`text-2xl mb-2 ${unlocked ? '' : 'grayscale opacity-40'}`}>{a.icon}</div>
              <p className={`text-[11px] font-black tracking-tight mb-1 ${unlocked ? 'text-white' : 'text-white/40'}`}>
                {a.label}
              </p>
              <p className="text-[9px] text-white/35 leading-snug">{a.desc}</p>
              {unlocked && (
                <span className="inline-block mt-2 text-[8px] font-black uppercase tracking-widest text-orange-400">
                  ✓ Unlocked
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Achievements;
