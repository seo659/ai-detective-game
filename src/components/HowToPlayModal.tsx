import React from 'react';
import { X, Shield, Search, MessageSquare, Scale, AlertTriangle, Award, Lightbulb, Clock } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#0e0e14] border border-[#2c2c3e] rounded-xl max-w-xl w-full p-4 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-[#22222c]">
          <div className="flex items-center gap-2 text-amber-400">
            <Shield className="w-4 h-4" />
            <h2 className="text-sm font-serif font-black uppercase tracking-wider text-gray-100">
              The AI Detective Field Manual
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-gray-400 hover:text-gray-200 hover:bg-[#181822] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Manual Content */}
        <div className="flex-1 overflow-y-auto py-2.5 space-y-2.5 custom-scrollbar text-xs text-gray-300 pr-1">
          {/* Objective */}
          <div className="p-2.5 rounded-lg border border-amber-500/30 bg-amber-950/20 space-y-1">
            <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">Primary Objective</h4>
            <p className="leading-relaxed text-[11px]">
              You are the lead detective investigating a newly generated crime. Gemini dynamically crafts a completely cohesive mystery with consistent suspects, motives, secrets, physical clues, timelines, and a predetermined culprit that will never change.
            </p>
          </div>

          {/* Investigation Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="p-2.5 rounded-lg border border-[#262634] bg-[#14141c] space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Search className="w-3.5 h-3.5" />
                <span className="text-xs">1. Search Scenes</span>
              </div>
              <p className="text-gray-400 text-[10px] leading-relaxed">
                Inspect physical hotspots across multiple rooms. Discover forensic fingerprints, duplicate key molds, and hidden compartments.
              </p>
            </div>

            <div className="p-2.5 rounded-lg border border-[#262634] bg-[#14141c] space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="text-xs">2. Interrogate Suspects</span>
              </div>
              <p className="text-gray-400 text-[10px] leading-relaxed">
                Interview suspects with custom or suggested inquiries. Present discovered clues to press for confessions and watch emotional shifts.
              </p>
            </div>

            <div className="p-2.5 rounded-lg border border-[#262634] bg-[#14141c] space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Scale className="w-3.5 h-3.5" />
                <span className="text-xs">3. Spot Contradictions</span>
              </div>
              <p className="text-gray-400 text-[10px] leading-relaxed">
                Select any two statements in the Contradiction Matrix. Catching conflicting alibis earns massive score bonuses (+150 pts).
              </p>
            </div>

            <div className="p-2.5 rounded-lg border border-[#262634] bg-[#14141c] space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="text-xs">4. Make Your Accusation</span>
              </div>
              <p className="text-gray-400 text-[10px] leading-relaxed">
                Submit your formal accusation naming the Culprit, Motive, and Key Evidence to trigger the cinematic case resolution!
              </p>
            </div>
          </div>

          {/* Scoring & Ranks */}
          <div className="p-2.5 rounded-lg border border-[#262634] bg-[#14141c] space-y-1.5">
            <h4 className="font-bold text-gray-200 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Detective Ranks (0 – 1000 Points)</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-center text-[10px] font-mono">
              <div className="p-1.5 rounded bg-[#0e0e14] border border-amber-500/40 text-amber-400">
                <div className="font-bold">900–1000</div>
                <div className="text-[9px] text-gray-400">Legendary</div>
              </div>
              <div className="p-1.5 rounded bg-[#0e0e14] border border-emerald-500/40 text-emerald-400">
                <div className="font-bold">750–899</div>
                <div className="text-[9px] text-gray-400">Master</div>
              </div>
              <div className="p-1.5 rounded bg-[#0e0e14] border border-cyan-500/40 text-cyan-400">
                <div className="font-bold">500–749</div>
                <div className="text-[9px] text-gray-400">Investigator</div>
              </div>
              <div className="p-1.5 rounded bg-[#0e0e14] border border-[#2e2e40] text-gray-400">
                <div className="font-bold">0–499</div>
                <div className="text-[9px] text-gray-400">Rookie</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2.5 border-t border-[#22222c] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors"
          >
            Understood, Detective
          </button>
        </div>
      </div>
    </div>
  );
};
