
import React from 'react';

const Header: React.FC = () => {
  const comingSoon = (e: React.MouseEvent) => {
    e.preventDefault();
    alert('This module is planned for Phase 2 integration.');
  };

  return (
    <header className="flex justify-between items-center py-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-lens-navy rounded-lg flex items-center justify-center text-lens-cream shadow-md">
          <i className="fa-solid fa-eye text-lg"></i>
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tighter uppercase leading-none">
            Repo<span className="text-lens-teal">Lens</span>
          </h1>
          <span className="text-[9px] font-bold tracking-[0.2em] text-slate-400 uppercase">Intelligence v1.0</span>
        </div>
      </div>
      
      <nav className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-slate-400">
        <a href="#" onClick={comingSoon} className="hover:text-lens-navy transition-colors">Documentation</a>
        <a href="#" onClick={comingSoon} className="hover:text-lens-navy transition-colors">Enterprise</a>
        <a href="#" onClick={comingSoon} className="hover:text-lens-navy transition-colors">Cloud</a>
        <a href="https://github.com" target="_blank" rel="noreferrer" className="bg-lens-navy text-lens-cream px-5 py-2 rounded shadow-sm hover:bg-lens-teal transition-all">
          <i className="fa-brands fa-github mr-2"></i> Star
        </a>
      </nav>
    </header>
  );
};

export default Header;
