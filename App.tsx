
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ScannerForm from './components/ScannerForm';
import Dashboard from './components/Dashboard';
import { fetchRepoTree } from './services/githubService';
import { performDeterministicAnalysis } from './services/analyzerService';
import { calculateScores } from './services/scoringService';
import { summarizeRepoHealth } from './services/aiService';
import { HealthModel, AIAnalysis, RepoInfo } from './types';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState<HealthModel | null>(() => {
    const saved = localStorage.getItem('repolens_last_model');
    return saved ? JSON.parse(saved) : null;
  });
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(() => {
    const saved = localStorage.getItem('repolens_last_ai');
    return saved ? JSON.parse(saved) : null;
  });
  const [error, setError] = useState<string | null>(null);
  const [scanSteps, setScanSteps] = useState<string[]>([]);

  useEffect(() => {
    if (model) localStorage.setItem('repolens_last_model', JSON.stringify(model));
    else localStorage.removeItem('repolens_last_model');
  }, [model]);

  useEffect(() => {
    if (aiAnalysis) localStorage.setItem('repolens_last_ai', JSON.stringify(aiAnalysis));
    else localStorage.removeItem('repolens_last_ai');
  }, [aiAnalysis]);

  const addStep = (step: string) => {
    setScanSteps(prev => [...prev, step]);
  };

  const handleScan = async (repoUrl: string, token: string) => {
    setIsLoading(true);
    setError(null);
    setModel(null);
    setAiAnalysis(null);
    setScanSteps([]);

    try {
      addStep("INIT: Initialising RepoLens intelligence cycle...");
      const url = new URL(repoUrl);
      const parts = url.pathname.split('/').filter(p => p);
      if (parts.length < 2) throw new Error("Invalid repository URL format. Use https://github.com/owner/repo");
      
      const repo: RepoInfo = {
        owner: parts[0],
        name: parts[1],
        platform: 'github',
        url: repoUrl
      };

      addStep(`NETWORK: Establishing secure connection to ${repo.owner}/${repo.name}...`);
      const tree = await fetchRepoTree(repo, token);
      addStep(`TREE: Hydrating ${tree.length} unique file descriptors...`);

      addStep("CORE: Commencing deep-scan of deterministic behavioural signals...");
      const analysisResult = await performDeterministicAnalysis(repo, tree, token, (msg) => {
        addStep(msg);
      });
      
      addStep("ANALYSIS: Calculating multidimensional health vectors...");
      const fullModel = calculateScores(analysisResult);
      setModel(fullModel);

      addStep("AI: Initiating high-level behavioural reasoning layer...");
      const aiResponse = await summarizeRepoHealth(fullModel);
      setAiAnalysis(aiResponse);
      addStep("DONE: Intelligence compilation successful. Audit ready.");

    } catch (err: any) {
      setError(err.message || "A fatal execution fault was encountered during analysis.");
      addStep(`FAULT: ${err.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20">
      <Header />

      {!model && !isLoading && (
        <div className="mt-20">
          <div className="text-center mb-16">
             <h2 className="text-6xl md:text-7xl font-black text-lens-navy tracking-tighter mb-6 leading-[0.9]">
               Deep Repository<br/>Intelligence.
             </h2>
             <p className="text-slate-500 font-medium max-w-xl mx-auto text-lg">
               Deterministic analysis meets behavioural reasoning to audit your engineering state in real-time.
             </p>
          </div>
          <ScannerForm onScan={handleScan} isLoading={isLoading} />
        </div>
      )}

      {isLoading && (
        <div className="mt-20 max-w-3xl mx-auto">
          <div className="bg-lens-navy border-[6px] border-white rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-white/5 px-6 py-4 flex items-center justify-between border-b border-white/10">
              <div className="flex gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-lens-teal"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-lens-muted-blue"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-lens-beige"></div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">Console.repolens.v1</span>
            </div>
            <div className="p-8 font-mono text-[12px] space-y-3 min-h-[350px] max-h-[550px] overflow-y-auto custom-scrollbar bg-slate-900/50">
              {scanSteps.map((step, i) => (
                <div key={i} className="flex gap-4 animate-in fade-in duration-300">
                  <span className="text-lens-teal font-black opacity-40">[{String(i).padStart(3, '0')}]</span>
                  <span className="text-lens-cream/90">{step}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 text-lens-teal">
                <span className="animate-pulse">_</span>
              </div>
            </div>
          </div>
          <p className="text-center mt-6 text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse">
            Inspecting source artifacts...
          </p>
        </div>
      )}

      {error && !isLoading && (
        <div className="mt-12 max-w-2xl mx-auto bg-rose-50 border border-rose-200 p-6 rounded-2xl flex gap-5 items-start">
          <div className="bg-rose-100 text-rose-600 p-3 rounded-xl">
            <i className="fa-solid fa-triangle-exclamation text-xl"></i>
          </div>
          <div className="flex-1">
            <h4 className="font-black text-rose-900 uppercase tracking-tighter">System Fault</h4>
            <p className="text-sm text-rose-700 mb-4">{error}</p>
            <button 
              onClick={() => { setError(null); setModel(null); }}
              className="text-xs font-black uppercase tracking-widest text-rose-600 hover:text-rose-800 transition-colors"
            >
              Reset Terminal
            </button>
          </div>
        </div>
      )}

      {model && aiAnalysis && !isLoading && (
        <div className="mt-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-lens-teal bg-lens-teal/5 px-2 py-0.5 rounded">Audit Report</span>
                <span className="text-slate-300">/</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Live View</span>
              </div>
              <h2 className="text-4xl font-black tracking-tighter text-lens-navy">
                {model.repo.owner}<span className="text-lens-teal">/</span>{model.repo.name}
              </h2>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => {
                  setModel(null);
                  setAiAnalysis(null);
                }}
                className="px-6 py-3 bg-white border border-lens-beige hover:border-lens-navy rounded-xl text-xs font-black uppercase tracking-widest text-lens-navy transition-all shadow-sm"
              >
                New Analysis
              </button>
              <button 
                onClick={() => {
                  const blob = new Blob([JSON.stringify({ model, aiAnalysis }, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `repolens-audit-${model.repo.name}.json`;
                  a.click();
                }}
                className="px-6 py-3 bg-lens-navy hover:bg-lens-teal text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-lens-navy/20"
              >
                Export Evidence
              </button>
            </div>
          </div>
          <Dashboard model={model} ai={aiAnalysis} />
        </div>
      )}
    </div>
  );
};

export default App;
