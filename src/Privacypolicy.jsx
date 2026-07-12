import React from 'react';

const Section = ({ title, children }) => (
  <div className="mb-6">
    <h2 className="text-sm font-black uppercase tracking-widest text-orange-400 mb-2">{title}</h2>
    <div className="text-[13px] text-white/60 leading-relaxed space-y-2">{children}</div>
  </div>
);

const PrivacyPolicy = ({ onBack }) => {
  return (
    <div className="max-w-lg mx-auto p-6 text-white">
      <button onClick={onBack} className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white mb-6">
        ← Back
      </button>

      <h1 className="text-2xl font-black italic tracking-tighter mb-1">PRIVACY <span className="text-orange-500">POLICY</span></h1>
      <p className="text-[10px] text-white/30 uppercase tracking-widest mb-8">Last updated: July 2026</p>

      <Section title="Overview">
        <p>
          FiveCourt ("we", "us", "the app") is a free, fan-made basketball trivia and mini-game hub.
          This page explains what information we collect, why, and how it's used.
        </p>
      </Section>

      <Section title="Anonymous Accounts">
        <p>
          When you open FiveCourt, we automatically create an anonymous account for you using Firebase
          Authentication. This account is not linked to your email, phone number, or any personal
          identity — it's simply a random ID that lets your scores and progress persist between visits
          on the same device/browser.
        </p>
      </Section>

      <Section title="What We Store">
        <p>We store the following in our database (Firebase Firestore):</p>
        <ul className="list-disc list-inside space-y-1">
          <li>The nickname you choose</li>
          <li>Your game scores (total, daily, weekly, monthly, and per-game)</li>
          <li>Achievements, streaks, and daily quest progress</li>
          <li>Your 3PT Legend character (name, team, skills)</li>
          <li>Friend connections you create with other players</li>
        </ul>
        <p>
          We do not collect your real name, email address, location, or any government ID unless you
          voluntarily provide it to us directly (e.g. via support contact).
        </p>
      </Section>

      <Section title="Public Leaderboard">
        <p>
          Your chosen nickname, tag, and scores are visible to other users on the public leaderboard
          and in the friends feature. Please do not use your real name or any personal information as
          your nickname.
        </p>
      </Section>

      <Section title="Third-Party Services">
        <p>
          We use Google Firebase for authentication, database, and hosting-adjacent infrastructure.
          Firebase's own privacy practices apply to the data they process on our behalf. We may also
          use a third-party sports statistics API to fetch publicly available player rosters and
          information for some game modes.
        </p>
      </Section>

      <Section title="Children's Privacy">
        <p>
          FiveCourt does not knowingly collect personal information from children. Since our accounts
          are anonymous and we don't collect names, emails, or other identifying data, the app is
          generally safe for a broad audience, but is not specifically directed at children under 13.
        </p>
      </Section>

      <Section title="Your Choices">
        <p>
          Because accounts are anonymous and tied to your browser/device, clearing your browser data
          will effectively reset your local session. If you'd like data associated with your account
          removed from our servers, you can reach out via the contact option below.
        </p>
      </Section>

      <Section title="Changes to This Policy">
        <p>
          We may update this policy from time to time as the app evolves. Continued use of FiveCourt
          after changes means you accept the updated policy.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about this policy or your data? Reach out through the app's feedback channel.
        </p>
      </Section>
    </div>
  );
};

export default PrivacyPolicy;
