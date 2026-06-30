import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full py-10 px-4 bg-black text-center text-zinc-500 text-[10px] uppercase tracking-widest mt-20 border-t border-white/10">
      {/* Links */}
      <div className="flex justify-center gap-8 mb-6">
        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
        <a href="#" className="hover:text-white transition-colors">Legacy Contact</a>
        <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
      </div>
      
      {/* Disclaimer Text */}
      <div className="max-w-xl mx-auto space-y-2">
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