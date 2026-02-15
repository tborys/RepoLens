
import React from 'react';
import { HealthModel, AIAnalysis, DimensionScore, ApiEndpoint } from '../types';

interface DashboardProps {
  model: HealthModel;
  ai: AIAnalysis;
}

const Dashboard: React.FC<DashboardProps> = ({ model, ai }) => {
  const getBadgeColor = (severity: string) => {
    switch (severity) {
      case 'Healthy': return 'bg-lens-teal/10 text-lens-teal border-lens-teal/20';
      case 'Moderate': return 'bg-amber-500/10 text-amber-700 border-amber-500/20';
      default: return 'bg-rose-500/10 text-rose-700 border-rose-500/20';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'text-sky-400';
      case 'POST': return 'text-emerald-400';
      case 'PUT': return 'text-amber-400';
      case 'DELETE': return 'text-rose-400';
      case 'WSS': return 'text-purple-400';
      default: return 'text-slate-400';
    }
  };

  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*.*?\*\*)/).map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} className="font-black text-lens-navy">{part.slice(2, -2)}</strong>;
        }
        return part;
      });
      return <p key={i} className="mb-4 last:mb-0 leading-relaxed">{parts}</p>;
    });
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. Health Index & Behavioural Summary */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-4 bg-[#21263d] text-lens-cream p-14 rounded-[2rem] flex flex-col justify-center items-center text-center shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <i className="fa-solid fa-shield-halved text-8xl"></i>
          </div>
          
          <span className="text-slate-400 text-[11px] font-black uppercase tracking-[0.3em] mb-12">Health Index</span>
          
          <div className="relative inline-flex items-center justify-center mb-12">
            {/* SVG updated with viewBox to prevent clipping */}
            <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-slate-700/30" />
              <circle 
                cx="50" 
                cy="50" 
                r="44" 
                stroke="currentColor" 
                strokeWidth="6" 
                fill="transparent" 
                strokeDasharray={276} 
                strokeDashoffset={276 - (276 * model.overallScore) / 100} 
                strokeLinecap="round" 
                className="text-lens-teal transition-all duration-[1500ms] ease-out drop-shadow-[0_0_8px_rgba(9,99,126,0.4)]" 
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-6xl font-black leading-none">{model.overallScore}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Points</span>
            </div>
          </div>
          
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Deterministic Model</p>
        </div>

        <div className="lg:col-span-8 bg-white border border-lens-beige p-12 rounded-[2rem] shadow-sm flex flex-col">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-8">
              <span className="h-[2px] w-10 bg-lens-teal rounded-full"></span>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-lens-teal">Behavioural Intelligence</h3>
            </div>
            <div className="text-3xl font-medium leading-tight text-lens-navy mb-10 tracking-tight">
              {ai.behavioralSummary}
            </div>
          </div>
          
          <div className="pt-10 border-t border-lens-bg">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Technical Audit</h4>
            <div className="text-slate-600 space-y-2 text-lg">
              {renderFormattedText(ai.executiveSummary)}
            </div>
          </div>
        </div>
      </section>

      {/* 2. API Inventory & Routes */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black uppercase tracking-tighter text-lens-navy">Audit Dimensions</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(Object.entries(model.scoring) as [string, DimensionScore][]).map(([key, dim]) => (
              <div key={key} className="bg-white border border-lens-beige p-8 rounded-2xl hover:shadow-lg transition-all">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="capitalize font-black text-lens-navy tracking-tight">{key}</h4>
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-widest ${getBadgeColor(dim.severity)}`}>
                    {dim.severity}
                  </span>
                </div>
                <div className="h-2 w-full bg-lens-bg rounded-full overflow-hidden mb-6">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      dim.score > 70 ? 'bg-lens-teal' : dim.score > 40 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${dim.score}%` }}
                  ></div>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">{dim.explanation}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-lens-navy text-lens-cream p-10 rounded-2xl shadow-xl flex flex-col">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] mb-8 text-lens-teal">Resolved API Architecture</h3>
          <div className="flex-1 space-y-6 overflow-y-auto max-h-[500px] custom-scrollbar pr-2">
            {model.apiInventory.endpoints.length > 0 ? (
              model.apiInventory.endpoints.map((endpoint, i) => (
                <div key={i} className="group border-b border-white/5 pb-4 last:border-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex gap-1">
                      {endpoint.methods.map(m => (
                        <span key={m} className={`text-[9px] font-black px-1.5 py-0.5 rounded bg-white/5 border border-white/10 ${getMethodColor(m)}`}>
                          {m}
                        </span>
                      ))}
                    </div>
                    <code className="text-xs font-mono font-medium text-slate-300 truncate flex-1">{endpoint.path}</code>
                  </div>
                  {endpoint.parameters && endpoint.parameters.length > 0 && (
                    <div className="flex gap-2 mt-2 opacity-60">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Params:</span>
                      <span className="text-[9px] text-slate-400 italic">{endpoint.parameters.join(', ')}</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-24 flex flex-col items-center justify-center opacity-40">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center mb-6 animate-spin-slow">
                   <i className="fa-solid fa-code-branch text-2xl"></i>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Zero endpoints resolved</p>
                <p className="text-[9px] mt-2 opacity-60">Search heuristic returned empty set.</p>
              </div>
            )}
          </div>
          <p className="mt-8 text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Inventory compiled via clinical grep</p>
        </div>
      </section>

      {/* 3. Deep Analysis & Supply Chain */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-lens-cream border border-lens-beige p-12 rounded-[2rem]">
          <h3 className="text-2xl font-black mb-10 flex items-center gap-4 text-lens-navy">
            <i className="fa-solid fa-sitemap text-lens-teal text-xl"></i> Architectural Analysis
          </h3>
          <div className="text-lens-navy/90 text-lg leading-relaxed space-y-6">
             {renderFormattedText(ai.architecturalExplanation)}
          </div>
        </div>

        <div className="bg-white border border-lens-beige p-12 rounded-[2rem] shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-black flex items-center gap-4 text-lens-navy">
              <i className="fa-solid fa-box-open text-lens-teal text-xl"></i> Supply Chain Hygiene
            </h3>
            <span className="text-[11px] font-black bg-lens-bg px-4 py-2 rounded-full tracking-widest uppercase text-slate-500">{model.dependencies.length} Items</span>
          </div>
          <div className="space-y-6">
            {ai.dependencyInsights.outdated.length > 0 ? (
              ai.dependencyInsights.outdated.map((dep, idx) => (
                <div key={idx} className="p-8 bg-lens-bg/40 rounded-2xl border-l-[6px] border-amber-500 hover:bg-white hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-black text-xl text-lens-navy">{dep.name}</span>
                    <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-lg border border-amber-100">{dep.current} → {dep.latest}</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">{dep.impact}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-20 text-slate-300 border-2 border-dashed border-lens-beige rounded-[2rem]">
                <i className="fa-solid fa-circle-check text-5xl mb-6 opacity-20"></i>
                <p className="text-xs font-black uppercase tracking-widest">Dependencies validated</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. Priorities & Risks */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-8">
          <h3 className="text-xl font-black uppercase tracking-tighter text-rose-800">Risk Perimeter</h3>
          <div className="space-y-4">
            {ai.riskPrioritization.map((risk, i) => (
              <div key={i} className="flex gap-5 p-6 bg-rose-50 border border-rose-100 rounded-2xl text-base text-rose-900 font-bold leading-relaxed shadow-sm transition-all hover:scale-[1.02]">
                <i className="fa-solid fa-bolt mt-1 text-rose-500"></i>
                <span>{renderFormattedText(risk)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <h3 className="text-xl font-black uppercase tracking-tighter text-lens-teal">Remediation Roadmap</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ai.recommendations.map((rec, i) => (
              <div key={i} className="flex gap-6 p-8 bg-white border border-lens-beige rounded-2xl shadow-sm hover:border-lens-teal transition-all group">
                <span className="text-lens-teal font-black text-3xl opacity-10 group-hover:opacity-100 transition-all duration-500">{String(i+1).padStart(2, '0')}</span>
                <div className="text-lg text-lens-navy font-semibold leading-relaxed">{renderFormattedText(rec)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Dashboard;
