import React, { useState } from 'react';
import {
  FileQuestion,
  Search,
  Tag,
  MapPin,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileText,
  Fingerprint,
  Cpu,
  Lock,
  Eye,
  Sparkles,
} from 'lucide-react';
import { Evidence, ClueImportance } from '../types';

interface EvidenceBoardProps {
  evidenceList: Evidence[];
  onSelectEvidenceForInspection: (evidence: Evidence) => void;
  onNavigateToInterrogationWithEvidence?: (evidence: Evidence) => void;
}

export const EvidenceBoard: React.FC<EvidenceBoardProps> = ({
  evidenceList,
  onSelectEvidenceForInspection,
  onNavigateToInterrogationWithEvidence,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterImportance, setFilterImportance] = useState<string>('all');

  const discoveredCount = evidenceList.filter((e) => e.isDiscovered).length;
  const totalCount = evidenceList.length;

  const filteredEvidence = evidenceList.filter((e) => {
    if (filterCategory !== 'all' && e.category !== filterCategory) return false;
    if (filterImportance !== 'all' && e.importance !== filterImportance) return false;
    return true;
  });

  const getImportanceBadge = (importance: ClueImportance) => {
    switch (importance) {
      case 'strong':
        return {
          label: 'Strong Clue',
          className: 'bg-amber-950/60 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-950/30',
          icon: <Sparkles className="w-2.5 h-2.5 text-amber-400" />,
        };
      case 'weak':
        return {
          label: 'Supporting Info',
          className: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40',
          icon: <Tag className="w-2.5 h-2.5 text-cyan-400" />,
        };
      case 'red_herring':
        return {
          label: 'Red Herring',
          className: 'bg-purple-950/60 text-purple-300 border-purple-500/40',
          icon: <HelpCircle className="w-2.5 h-2.5 text-purple-400" />,
        };
    }
  };

  const getCategoryIcon = (category: Evidence['category']) => {
    switch (category) {
      case 'forensic':
        return <Fingerprint className="w-3.5 h-3.5 text-rose-400" />;
      case 'document':
        return <FileText className="w-3.5 h-3.5 text-amber-400" />;
      case 'digital':
        return <Cpu className="w-3.5 h-3.5 text-cyan-400" />;
      default:
        return <Search className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full space-y-2.5">
      {/* Top Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-[#0e0e14] border border-[#22222c] rounded-lg">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-gray-300">Evidence Vault</span>
          <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-amber-950/40 border border-amber-500/30 text-amber-400 font-bold">
            {discoveredCount} / {totalCount}
          </span>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1 text-[11px]">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-2 py-0.5 rounded border font-medium transition-all ${
              filterCategory === 'all'
                ? 'bg-[#242434] text-amber-300 border-amber-500/40'
                : 'bg-[#14141c] text-gray-400 border-[#262634] hover:text-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterCategory('physical')}
            className={`px-2 py-0.5 rounded border font-medium transition-all ${
              filterCategory === 'physical'
                ? 'bg-[#242434] text-amber-300 border-amber-500/40'
                : 'bg-[#14141c] text-gray-400 border-[#262634] hover:text-gray-200'
            }`}
          >
            Physical
          </button>
          <button
            onClick={() => setFilterCategory('document')}
            className={`px-2 py-0.5 rounded border font-medium transition-all ${
              filterCategory === 'document'
                ? 'bg-[#242434] text-amber-300 border-amber-500/40'
                : 'bg-[#14141c] text-gray-400 border-[#262634] hover:text-gray-200'
            }`}
          >
            Documents
          </button>
          <button
            onClick={() => setFilterCategory('forensic')}
            className={`px-2 py-0.5 rounded border font-medium transition-all ${
              filterCategory === 'forensic'
                ? 'bg-[#242434] text-amber-300 border-amber-500/40'
                : 'bg-[#14141c] text-gray-400 border-[#262634] hover:text-gray-200'
            }`}
          >
            Forensic
          </button>
        </div>
      </div>

      {/* Evidence Pinboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5 flex-1 overflow-y-auto pr-1 custom-scrollbar">
        {filteredEvidence.map((evidence) => {
          if (!evidence.isDiscovered) {
            return (
              <div
                key={evidence.id}
                className="p-3 rounded-lg border border-dashed border-[#262636] bg-[#101016]/60 flex flex-col items-center justify-center text-center space-y-1.5 opacity-60 hover:opacity-80 transition-opacity min-h-[130px]"
              >
                <div className="w-7 h-7 rounded-full bg-[#161622] border border-[#262636] flex items-center justify-center text-gray-400">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-semibold text-gray-400">Undiscovered Lead</h4>
                <p className="text-[10px] text-gray-400 max-w-xs">
                  Search crime scenes or cross-examine suspect statements to uncover this evidence.
                </p>
              </div>
            );
          }

          const importanceBadge = getImportanceBadge(evidence.importance);

          return (
            <div
              key={evidence.id}
              onClick={() => onSelectEvidenceForInspection(evidence)}
              className="group relative p-3 rounded-lg border border-[#262632] bg-[#16161f] hover:bg-[#1c1c28] hover:border-amber-500/40 hover:shadow-md hover:shadow-amber-950/20 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Header with Type & Status */}
                <div className="flex items-center justify-between gap-1.5 mb-1.5">
                  <span className={`inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border ${importanceBadge.className}`}>
                    {importanceBadge.icon}
                    <span>{importanceBadge.label}</span>
                  </span>

                  <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    {getCategoryIcon(evidence.category)}
                    <span className="capitalize">{evidence.category}</span>
                  </div>
                </div>

                {/* Name */}
                <h4 className="font-bold text-xs text-gray-100 group-hover:text-amber-300 transition-colors line-clamp-1 mb-1">
                  {evidence.name}
                </h4>

                {/* Description */}
                <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed mb-2">
                  {evidence.description}
                </p>
              </div>

              {/* Footer Location & Status */}
              <div className="pt-1.5 border-t border-[#22222e] flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1 text-gray-400 truncate max-w-[130px]">
                  <MapPin className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                  <span className="truncate">{evidence.location}</span>
                </div>

                <div className="flex items-center gap-1 text-amber-400 font-medium group-hover:underline">
                  <Eye className="w-2.5 h-2.5" />
                  <span>Examine</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
