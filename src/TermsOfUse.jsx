import React from 'react';

const Section = ({ title, children }) => (
  <div className="mb-6">
    <h2 className="text-sm font-black uppercase tracking-widest text-orange-400 mb-2">{title}</h2>
    <div className="text-[13px] text-white/60 leading-relaxed space-y-2">{children}</div>
  </div>
);

const TermsOfUse = ({ onBack }) => {
  return (
    <div className="max-w-lg mx-auto p-6 text-white">
      <button onClick={onBack} className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white mb-6">
        ← Back
      </button>

      <h1 className="text-2xl font-black italic tracking-tighter mb-1">TERMS <span className="text-orange-500">OF USE</span></h1>
      <p className="text-[10px] text-white/30 uppercase tracking-widest mb-8">Last updated: July 2026</p>

      <Section title="Fan-Made, Not Official">
        <p>
          FiveCourt is an independent, fan-made project built for entertainment and educational
          purposes. It is not affiliated with, endorsed by, sponsored by, or connected in any way to
          the NBA, any NBA team, any player, or any other professional sports league or organization.
        </p>
      </Section>

      <Section title="Player Names, Stats & Team Colors">
        <p>
          Game content references real player names, publicly known statistics, and team color
          schemes solely for identification purposes within trivia and puzzle games. No official
          logos, trademarks, or licensed imagery are used. All content is either originally created
          (illustrations, silhouettes, layouts) or based on publicly available factual information
          (names, positions, historical stats).
        </p>
      </Section>

      <Section title="Acceptable Use">
        <p>By using FiveCourt, you agree not to:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Attempt to manipulate, exploit, or falsify scores or leaderboard rankings</li>
          <li>Use automated tools, bots, or scripts to interact with the app</li>
          <li>Use another person's identity, harass other users, or post offensive nicknames</li>
          <li>Attempt to disrupt, reverse-engineer, or attack our backend services</li>
        </ul>
      </Section>

      <Section title="Accounts">
        <p>
          Accounts are anonymous and free. We reserve the right to reset, suspend, or remove any
          account or leaderboard entry that appears to violate these terms or involves abusive
          behavior.
        </p>
      </Section>

      <Section title="No Warranty">
        <p>
          FiveCourt is provided "as is" without warranties of any kind. We do our best to keep game
          data accurate and the service available, but we don't guarantee uninterrupted access,
          error-free content, or that statistics are always fully up to date.
        </p>
      </Section>

      <Section title="Limitation of Liability">
        <p>
          To the fullest extent permitted by law, FiveCourt and its creators are not liable for any
          indirect, incidental, or consequential damages arising from your use of the app.
        </p>
      </Section>

      <Section title="Changes to the Service">
        <p>
          We may add, remove, or modify games, features, or scoring systems at any time without prior
          notice, as the app is actively developed.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about these terms? Reach out through the app's feedback channel.
        </p>
      </Section>
    </div>
  );
};

export default TermsOfUse;
