import React from 'react';
import { X, MapPin, Sparkles, Tag, HelpCircle, FileText, CheckCircle2, MessageSquare } from 'lucide-react';
import { Evidence } from '../types';

interface EvidenceInspectorModalProps {
  evidence: Evidence | null;
  onClose: () => void;
  onPresentToSuspect?: (evidence: Evidence) => void;
}

export const EvidenceInspectorModal: React.FC<EvidenceInspectorModalProps> = ({
  evidence,
  onClose,
  onPresentToSuspect,
}) => {
  if (!evidence) return null;

  const getImportanceDetails = () => {
    switch (evidence.importance) {
      case 'strong':
        return {
          title: 'Direct / Critical Clue',
          desc: 'Directly implicates or excludes key suspects and forms the bedrock of an accusation.',
          badge: 'bg-amber-950/80 text-amber-300 border-amber-500/50',
        };
      case 'weak':
        return {
          title: 'Supporting Context',
          desc: 'Provides helpful background or corroborates timelines, but is not alone conclusive.',
          badge: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50',
        };
      case 'red_herring':
        return {
          title: 'Potential Red Herring',
          desc: 'Appears suspicious at first glance, but may be an innocent coincidence or distraction.',
          badge: 'bg-purple-950/80 text-purple-300 border-purple-500/50',
        };
    }
  };

  const imp = getImportanceDetails();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#0e0e14] border border-[#2c2c3e] rounded-xl max-w-md w-full p-4 shadow-2xl space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 border-b border-[#22222c] pb-2">
          <div>
            <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border ${imp.badge}`}>
              {imp.title}
            </span>
            <h3 className="text-sm font-bold text-gray-100 mt-1">{evidence.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-gray-400 hover:text-gray-200 hover:bg-[#181822] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-2 text-xs">
          {/* Location Found */}
          <div className="flex items-center gap-2 text-gray-300 bg-[#14141c] p-2 rounded-lg border border-[#22222e]">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <div>
              <span className="text-[9px] text-gray-400 uppercase font-semibold block">Discovered Location</span>
              <span className="text-gray-200 text-xs">{evidence.location}</span>
            </div>
          </div>

          {/* Forensic Description */}
          <div className="space-y-0.5">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
              Physical & Forensic Description
            </span>
            <p className="text-gray-200 text-[11px] leading-relaxed bg-[#14141c] p-2.5 rounded-lg border border-[#22222e]">
              {evidence.description}
            </p>
          </div>

          {/* Detective Significance Notes */}
          <div className="space-y-0.5">
            <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block">
              Investigative Significance
            </span>
            <p className="text-gray-300 text-[11px] leading-relaxed italic bg-amber-950/20 p-2.5 rounded-lg border border-amber-500/20">
              {evidence.details || imp.desc}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-[#22222c] flex items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-[#262636] text-gray-300 text-xs font-semibold hover:bg-[#181824] transition-colors"
          >
            Close Dossier
          </button>

          {onPresentToSuspect && (
            <button
              onClick={() => {
                onPresentToSuspect(evidence);
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Confront Suspect</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
