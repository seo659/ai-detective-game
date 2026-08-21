import React, { useState } from 'react';
import { AlertTriangle, X, CheckCircle, ShieldAlert, Sparkles, FolderCheck, User } from 'lucide-react';
import { MysteryCase, Suspect, Evidence } from '../types';

interface AccusationModalProps {
  isOpen: boolean;
  onClose: () => void;
  mystery: MysteryCase;
  onSubmitAccusation: (culpritId: string, motive: string, evidenceIds: string[]) => Promise<void>;
  isSubmitting: boolean;
}

export const AccusationModal: React.FC<AccusationModalProps> = ({
  isOpen,
  onClose,
  mystery,
  onSubmitAccusation,
  isSubmitting,
}) => {
  const [selectedCulpritId, setSelectedCulpritId] = useState<string>('');
  const [selectedMotive, setSelectedMotive] = useState<string>('');
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const discoveredEvidence = mystery.evidence.filter((e) => e.isDiscovered);
  const selectedSuspect = mystery.suspects.find((s) => s.id === selectedCulpritId);

  const toggleEvidence = (id: string) => {
    if (selectedEvidenceIds.includes(id)) {
      setSelectedEvidenceIds(selectedEvidenceIds.filter((eId) => eId !== id));
    } else {
      if (selectedEvidenceIds.length < 3) {
        setSelectedEvidenceIds([...selectedEvidenceIds, id]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCulpritId || !selectedMotive.trim() || selectedEvidenceIds.length === 0 || isSubmitting) {
      return;
    }
    await onSubmitAccusation(selectedCulpritId, selectedMotive.trim(), selectedEvidenceIds);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#0e0e14] border border-[#2c2c3e] rounded-xl max-w-xl w-full p-4 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-[#22222c]">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="w-4 h-4 text-amber-500 fill-amber-500/20" />
            <h2 className="text-sm font-serif font-black tracking-wider uppercase text-gray-100">
              Formal Court of Accusation
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-gray-400 hover:text-gray-200 hover:bg-[#181822] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-2.5 space-y-3 custom-scrollbar pr-1">
          {/* Step 1: Select Suspect */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <span>Step 1: Identify the True Culprit</span>
              <span className="text-red-400">*</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {mystery.suspects.map((s) => {
                const isSelected = s.id === selectedCulpritId;
                return (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => {
                      setSelectedCulpritId(s.id);
                      if (!selectedMotive) setSelectedMotive(s.knownMotive);
                    }}
                    className={`p-2 rounded-lg border text-left transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'border-amber-500/60 bg-amber-950/30 shadow-sm text-gray-100'
                        : 'border-[#262634] bg-[#14141c] hover:bg-[#1c1c28] text-gray-300'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs border ${s.avatarColor}`}>
                      {s.name[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs truncate">{s.name}</div>
                      <div className="text-[10px] text-gray-400 truncate">{s.occupation}</div>
                    </div>
                    {isSelected && <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Establish Motive */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <span>Step 2: Define Criminal Motive & Method</span>
              <span className="text-red-400">*</span>
            </label>

            <textarea
              value={selectedMotive}
              onChange={(e) => setSelectedMotive(e.target.value)}
              placeholder="Explain why the culprit committed the crime and how they bypassed security or constructed their alibi..."
              rows={2}
              className="w-full bg-[#0e0e14] border border-[#262634] rounded-lg p-2 text-xs text-gray-100 placeholder-gray-400 focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
            />
          </div>

          {/* Step 3: Select Key Evidence */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <span>Step 3: Select 1–3 Key Evidence Pieces</span>
                <span className="text-red-400">*</span>
              </label>
              <span className="text-[10px] font-mono text-gray-400">
                {selectedEvidenceIds.length}/3 Selected
              </span>
            </div>

            {discoveredEvidence.length === 0 ? (
              <div className="p-2.5 rounded-lg bg-[#14141c] border border-[#262634] text-xs text-gray-400 text-center">
                You have not discovered any evidence yet. Explore the crime scene or interrogate suspects first.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {discoveredEvidence.map((ev) => {
                  const isChecked = selectedEvidenceIds.includes(ev.id);
                  return (
                    <div
                      key={ev.id}
                      onClick={() => toggleEvidence(ev.id)}
                      className={`p-2 rounded-lg border text-xs cursor-pointer transition-all flex items-start gap-2 ${
                        isChecked
                          ? 'border-amber-500/60 bg-amber-950/30 text-gray-100'
                          : 'border-[#262634] bg-[#14141c] text-gray-400 hover:bg-[#1c1c28]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 accent-amber-500"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-gray-200 text-xs truncate">{ev.name}</div>
                        <div className="text-[9px] text-gray-400 line-clamp-1">{ev.location}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </form>

        {/* Footer Actions */}
        <div className="pt-2.5 border-t border-[#22222c] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-[#262636] text-gray-300 text-xs font-semibold hover:bg-[#181824] transition-colors"
          >
            Return
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedCulpritId || !selectedMotive.trim() || selectedEvidenceIds.length === 0 || isSubmitting}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-zinc-950 font-bold text-xs shadow-md shadow-amber-950/40 disabled:opacity-40 transition-all active:scale-95 flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <>
                <div className="w-3 h-3 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                <span>Evaluating Deductions...</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Submit Accusation</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
