
import React, { useState, useEffect } from 'react';

interface ScannerFormProps {
  onScan: (repoUrl: string, token: string) => void;
  isLoading: boolean;
}

const ScannerForm: React.FC<ScannerFormProps> = ({ onScan, isLoading }) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [token, setToken] = useState(() => localStorage.getItem('repolens_token') || '');

  useEffect(() => {
    localStorage.setItem('repolens_token', token);
  }, [token]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl) return;
    onScan(repoUrl, token);
  };

  return (
    <div className="bg-white border border-lens-beige rounded-3xl p-12 shadow-2xl max-w-2xl mx-auto border-b-8 border-b-lens-navy transition-all">
      <div className="flex items-center gap-6 mb-10">
        <div className="w-16 h-16 bg-lens-navy rounded-2xl flex items-center justify-center text-lens-cream shadow-xl">
          <i className="fa-solid fa-microscope text-3xl"></i>
        </div>
        <div>
          <h2 className="text-3xl font-black text-lens-navy tracking-tighter">Initialize Lens</h2>
          <p className="text-slate-500 text-sm font-medium">Audit architecture, behaviour and risk in real-time.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-3">
          <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Repository URL</label>
          <div className="relative group">
            <i className={`fa-brands fa-github absolute left-5 top-1/2 -translate-y-1/2 text-xl transition-all duration-300 ${repoUrl ? 'text-lens-navy' : 'text-slate-200 opacity-50'}`}></i>
            <input
              type="text"
              placeholder="https://github.com/owner/repository"
              className="w-full bg-lens-bg/30 border-2 border-lens-beige rounded-2xl pl-14 pr-6 py-5 focus:outline-none focus:border-lens-teal focus:bg-white transition-all text-lens-navy font-semibold placeholder:text-slate-300 shadow-sm"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">API Access Token</label>
            <span className="text-[10px] font-bold text-lens-teal uppercase bg-lens-teal/5 border border-lens-teal/10 px-2 py-0.5 rounded tracking-widest">Persistent</span>
          </div>
          <div className="relative group">
            <i className={`fa-solid fa-key absolute left-5 top-1/2 -translate-y-1/2 transition-all duration-300 ${token ? 'text-lens-teal' : 'text-slate-200 opacity-50'}`}></i>
            <input
              type="password"
              placeholder="••••••••••••••••••••••••"
              className="w-full bg-lens-cream/20 border-2 border-lens-beige rounded-2xl pl-14 pr-6 py-5 focus:outline-none focus:border-lens-teal focus:bg-white transition-all text-lens-navy font-semibold placeholder:text-slate-300 shadow-sm"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !repoUrl}
          className={`w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-4 transition-all duration-300 active:scale-[0.98] ${
            isLoading || !repoUrl
              ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
              : 'bg-lens-teal hover:bg-lens-dark-teal text-white shadow-xl shadow-lens-teal/20'
          }`}
        >
          {isLoading ? (
            <>
              <i className="fa-solid fa-sync animate-spin"></i>
              Analysing State
            </>
          ) : (
            <>
              <i className="fa-solid fa-bolt-lightning"></i>
              Execute Scan
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ScannerForm;
