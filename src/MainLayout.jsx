import React from 'react';
import Footer from './Footer';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* This makes the main content area expand to fill the available space */}
      <main className="flex-grow flex justify-center items-center p-4">
        {children}
      </main>
      
      {/* Footer stays at the bottom */}
      <Footer />
    </div>
  );
};

export default MainLayout;