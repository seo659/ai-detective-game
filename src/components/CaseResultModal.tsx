import React from 'react';
import { Award, AlertOctagon, CheckCircle2, RefreshCw, X, ArrowRight, BookOpen, ShieldCheck, Sparkles } from 'lucide-react';
import { AccusationResult, MysteryCase } from '../types';

interface CaseResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: AccusationResult;
  mystery: MysteryCase;
  onPlayNewCase: () => void;
}

export const CaseResultModal: React.FC<CaseResultModalProps> = ({
  isOpen,
  onClose,
  result,
  mystery,
  onPlayNewCase,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs animate-in fade-in">
      <div
        className={`bg-[#0e0e14] border rounded-xl max-w-2xl w-full p-4 sm:p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden ${
          result.isCorrect
            ? 'border-amber-500/70 shadow-amber-950/40'
            : 'border-red-500/70 shadow-red-950/40'
        }`}
      >
        {/* Header Banner */}
        <div className="text-center pb-3 border-b border-[#22222c] space-y-1.5">
          {result.isCorrect ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-widest animate-bounce">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>CASE SOLVED • TRUTH UNCOVERED</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/50 text-red-300 text-[10px] font-mono font-bold uppercase tracking-widest">
              <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
              <span>INSUFFICIENT EVIDENCE • ACCUSATION FAILED</span>
            </div>
          )}

          <h1 className="text-xl sm:text-2xl font-serif font-black text-gray-100 uppercase tracking-tight">
            {mystery.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono pt-0.5">
            <div className="flex items-center gap-1 text-gray-300">
              <span>Score:</span>
              <span className="text-amber-400 font-bold text-sm">{result.finalScore}</span>
              <span className="text-gray-400">/ 1000</span>
            </div>
            <div className="flex items-center gap-1 text-gray-300">
              <span>Rank:</span>
              <span className="text-emerald-400 font-bold uppercase px-1.5 py-0.2 rounded bg-emerald-950/40 border border-emerald-500/30 text-[10px]">
                {result.rank}
              </span>
            </div>
          </div>
        </div>

        {/* Narrative & Deductive Breakdown */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5 custom-scrollbar pr-1">
          {/* Story Resolution */}
          <div className="p-3 rounded-lg border border-[#262634] bg-[#14141c] space-y-1">
            <h4 className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              <span>Deductive Resolution</span>
            </h4>
            <p className="text-xs text-gray-200 leading-relaxed font-serif italic">
              {result.storyResolution}
            </p>
          </div>

          {/* Full Truth Story */}
          {result.isCorrect && (
            <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-950/20 space-y-1">
              <h4 className="text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                <span>The Full Anatomy of the Crime</span>
              </h4>
              <p className="text-[11px] text-gray-300 leading-relaxed">{result.truthExplanation}</p>
            </div>
          )}

          {/* If Incorrect: Feedback */}
          {!result.isCorrect && (
            <div className="p-3 rounded-lg border border-red-500/40 bg-red-950/20 space-y-1">
              <h4 className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Investigative Feedback</h4>
              <p className="text-[11px] text-gray-300 leading-relaxed">{result.feedback}</p>
              <p className="text-[10px] text-red-300 font-mono">-100 Points penalty applied. You may continue investigating!</p>
            </div>
          )}

          {/* Red Herrings Explained */}
          {result.redHerringsExplained && result.redHerringsExplained.length > 0 && (
            <div className="p-3 rounded-lg border border-[#262634] bg-[#14141c] space-y-1.5">
              <h4 className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                Red Herrings Deconstructed
              </h4>
              <div className="space-y-1 text-xs text-gray-300">
                {result.redHerringsExplained.map((rh, idx) => (
                  <div key={idx} className="p-1.5 rounded bg-[#0e0e14] border border-[#242432]">
                    <span className="font-bold text-purple-300 text-[11px]">{rh.name}: </span>
                    <span className="text-gray-400 text-[10px]">{rh.explanation}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-2.5 border-t border-[#22222c] flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-[#262636] text-gray-300 text-xs font-semibold hover:bg-[#181824] transition-colors"
          >
            {result.isCorrect ? 'Review Case Board' : 'Resume Investigation'}
          </button>

          <button
            onClick={onPlayNewCase}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-zinc-950 font-bold text-xs shadow-md shadow-amber-950/40 transition-all flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Open New Mystery Case</span>
          </button>
        </div>
      </div>
    </div>
  );
};
