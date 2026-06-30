import logo from '../assets/fivecourt-logo.png'; // Logonu bu klasöre attığından emin ol

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center">
      
      {/* Sabit Header - Logo ve Marka İsmi */}
      <header className="w-full pt-8 pb-4 flex flex-col items-center border-b border-[#111] mb-4">
        {/* Logo */}
        <img 
          src={logo} 
          alt="FiveCourt Logo" 
          className="h-12 w-auto mb-2 object-contain" 
        />
        {/* FiveCourt Yazısı */}
        <h1 className="text-xl font-black tracking-[0.2em] uppercase text-white/90">
          FiveCourt
        </h1>
      </header>

      {/* Oyun Alanı */}
      <main className="w-full flex-grow">{children}</main>

      {/* Footer */}
      <footer className="p-6 text-[8px] text-zinc-700 uppercase tracking-widest">
        © 2026 FiveCourt Sports Intelligence
      </footer>
    </div>
  );
};

export default Layout;