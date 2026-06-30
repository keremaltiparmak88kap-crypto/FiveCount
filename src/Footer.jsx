import React from 'react';

const Footer = () => {
  return (
    <footer className="relative w-full py-10 px-4 mt-20 text-center text-zinc-500 text-[10px] uppercase tracking-widest
                        bg-gradient-to-b from-white/[0.03] to-transparent">
      {/* üst ince gradient çizgi (kartlardaki glow ile uyumlu) */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />

      {/* Links */}
      <div className="flex justify-center gap-8 mb-6">
        <a href="#" className="hover:text-orange-400 transition-colors">Privacy Policy</a>
        <a href="#" className="hover:text-orange-400 transition-colors">Legacy Contact</a>
        <a href="#" className="hover:text-orange-400 transition-colors">Terms of Use</a>
      </div>
      
      {/* Disclaimer Text */}
      <div className="max-w-xl mx-auto space-y-2 text-zinc-600">
        <p>
          Five Court is not affiliated with, endorsed by, or connected to any professional sports league or organization. 
          All team logos and names are used solely for identification and educational gaming purposes.
        </p>
        <p>
          © 2026 Five Court. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;