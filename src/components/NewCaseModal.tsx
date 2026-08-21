import React, { useState } from 'react';
import { X, Sparkles, Compass, Shield, Clock, Flame, Play, Zap } from 'lucide-react';
import { Difficulty, CrimeType } from '../types';

interface NewCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCase: (
    difficulty: Difficulty,
    crimeType: CrimeType,
    timerMode: 'relaxed' | 'timed',
    location?: string,
    suspectCount?: number
  ) => Promise<void>;
  onLoadDemoCase: () => void;
  isGenerating: boolean;
}

export const NewCaseModal: React.FC<NewCaseModalProps> = ({
  isOpen,
  onClose,
  onCreateCase,
  onLoadDemoCase,
  isGenerating,
}) => {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [crimeType, setCrimeType] = useState<CrimeType>('Theft');
  const [timerMode, setTimerMode] = useState<'relaxed' | 'timed'>('relaxed');
  const [customLocation, setCustomLocation] = useState<string>('');
  const [suspectCount, setSuspectCount] = useState<number>(5);

  if (!isOpen) return null;

  const crimeTypes: CrimeType[] = [
    'Theft',
    'Murder Mystery',
    'Kidnapping',
    'Art Heist',
    'Corporate Espionage',
    'Museum Mystery',
    'Mansion Mystery',
  ];

  const difficulties: Array<{ id: Difficulty; label: string; desc: string; color: string }> = [
    { id: 'easy', label: 'Easy', desc: '4 Suspects • Obvious Clues • 20 Min Timer', color: 'border-emerald-500/50 text-emerald-400' },
    { id: 'medium', label: 'Medium', desc: '5 Suspects • Balanced Red Herrings • 15 Min Timer', color: 'border-amber-500/50 text-amber-400' },
    { id: 'hard', label: 'Hard', desc: '5–6 Suspects • Complex Contradictions • 10 Min Timer', color: 'border-orange-500/50 text-orange-400' },
    { id: 'expert', label: 'Expert', desc: '6 Suspects • Subtle Lies & Intricate Alibis • 7.5 Min Timer', color: 'border-red-500/50 text-red-400' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerating) return;
    await onCreateCase(difficulty, crimeType, timerMode, customLocation.trim() || undefined, suspectCount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#0e0e14] border border-[#2c2c3e] rounded-xl max-w-lg w-full p-4 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-[#22222c]">
          <div className="flex items-center gap-2 text-amber-400">
            <Sparkles className="w-4 h-4" />
            <h2 className="text-sm font-serif font-black uppercase tracking-wider text-gray-100">
              Open New Mystery Dossier
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-gray-400 hover:text-gray-200 hover:bg-[#181822] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-2.5 space-y-2.5 custom-scrollbar text-xs pr-1">
          {/* Quick Demo Case Banner */}
          <div className="p-2.5 rounded-lg border border-amber-500/30 bg-[#16161f] flex items-center justify-between gap-2">
            <div>
              <h4 className="font-bold text-amber-300 text-xs">Instant Demo Mystery</h4>
              <p className="text-[10px] text-gray-400">"The Theft of the Midnight Star Sapphire" (5 suspects, instant launch)</p>
            </div>
            <button
              type="button"
              onClick={() => {
                onLoadDemoCase();
                onClose();
              }}
              className="px-2.5 py-1 rounded bg-[#20202e] hover:bg-amber-600 hover:text-zinc-950 text-amber-300 border border-amber-500/40 font-bold transition-all text-[10px] flex items-center gap-1 shrink-0"
            >
              <Zap className="w-3 h-3" />
              <span>Load Demo</span>
            </button>
          </div>

          {/* Difficulty Selection */}
          <div className="space-y-1">
            <label className="font-bold uppercase tracking-wider text-gray-300 block text-[10px]">
              Difficulty Tier:
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {difficulties.map((d) => {
                const isSelected = d.id === difficulty;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDifficulty(d.id)}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'border-amber-500/60 bg-amber-950/30 shadow-sm text-gray-100'
                        : 'border-[#262634] bg-[#14141c] hover:bg-[#1c1c28] text-gray-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-bold text-xs ${isSelected ? 'text-amber-400' : 'text-gray-200'}`}>
                        {d.label}
                      </span>
                    </div>
                    <p className="text-[9px] text-gray-400 mt-0.5">{d.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Crime Category */}
          <div className="space-y-1">
            <label className="font-bold uppercase tracking-wider text-gray-300 block text-[10px]">
              Mystery Archetype:
            </label>
            <div className="flex flex-wrap gap-1">
              {crimeTypes.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCrimeType(c)}
                  className={`px-2 py-1 rounded text-[11px] border font-medium transition-all ${
                    crimeType === c
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm'
                      : 'bg-[#14141c] border-[#262634] text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Timer Mode */}
          <div className="space-y-1">
            <label className="font-bold uppercase tracking-wider text-gray-300 block text-[10px]">
              Investigation Pace:
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setTimerMode('relaxed')}
                className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all ${
                  timerMode === 'relaxed'
                    ? 'border-amber-500/60 bg-amber-950/30 text-gray-100'
                    : 'border-[#262634] bg-[#14141c] text-gray-400'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <div>
                  <div className="font-bold text-xs">Relaxed Mode</div>
                  <div className="text-[9px] text-gray-400">Untimed exploration.</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTimerMode('timed')}
                className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all ${
                  timerMode === 'timed'
                    ? 'border-amber-500/60 bg-amber-950/30 text-gray-100'
                    : 'border-[#262634] bg-[#14141c] text-gray-400'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <div>
                  <div className="font-bold text-xs">Timed Mode</div>
                  <div className="text-[9px] text-gray-400">Accusation countdown.</div>
                </div>
              </button>
            </div>
          </div>

          {/* Location Setting Optional */}
          <div className="space-y-0.5">
            <label className="font-bold uppercase tracking-wider text-gray-300 block text-[10px]">
              Setting / Location (Optional):
            </label>
            <input
              type="text"
              placeholder="e.g. Orient Express, Clifftop Observatory..."
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              className="w-full bg-[#0e0e14] border border-[#262634] rounded-md px-2.5 py-1.5 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-amber-500 text-xs"
            />
          </div>
        </form>

        {/* Footer Actions */}
        <div className="pt-2.5 border-t border-[#22222c] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-[#262636] text-gray-300 text-xs font-semibold hover:bg-[#181824] transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isGenerating}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-zinc-950 font-bold text-xs shadow-md shadow-amber-950/40 transition-all flex items-center gap-1.5 disabled:opacity-50 active:scale-95"
          >
            {isGenerating ? (
              <>
                <div className="w-3 h-3 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                <span>Generating Mystery...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Case</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
