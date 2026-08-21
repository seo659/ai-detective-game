import React, { useState } from 'react';
import { User, MapPin, Calendar, AlertCircle, FileText, ChevronRight, MessageSquare, Skull, Award } from 'lucide-react';
import { MysteryCase, Suspect } from '../types';

interface CaseDossierProps {
  mystery: MysteryCase;
  selectedSuspectId: string | null;
  onSelectSuspect: (suspectId: string) => void;
  onStartInterrogation: (suspectId: string) => void;
}

export const CaseDossier: React.FC<CaseDossierProps> = ({
  mystery,
  selectedSuspectId,
  onSelectSuspect,
  onStartInterrogation,
}) => {
  const [activeTab, setActiveTab] = useState<'suspects' | 'file'>('suspects');

  const getEmotionalBadge = (state: Suspect['emotionalState']) => {
    switch (state) {
      case 'panicked':
        return 'bg-red-950/60 text-red-400 border-red-800/60';
      case 'nervous':
        return 'bg-amber-950/60 text-amber-400 border-amber-800/60';
      case 'defensive':
        return 'bg-orange-950/60 text-orange-400 border-orange-800/60';
      case 'arrogant':
        return 'bg-purple-950/60 text-purple-400 border-purple-800/60';
      default:
        return 'bg-[#181822] text-gray-400 border-[#2a2a38]';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#121216]/95 border border-[#262632] rounded-xl overflow-hidden shadow-xl">
      {/* Top Header Toggle */}
      <div className="flex items-center justify-between border-b border-[#22222c] bg-[#0a0a0e] p-1.5">
        <div className="flex items-center gap-1 w-full">
          <button
            onClick={() => setActiveTab('suspects')}
            className={`flex-1 py-1 px-2.5 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'suspects'
                ? 'bg-[#22222e] text-amber-300 border border-amber-500/40'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#161622]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Suspects ({mystery.suspects.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('file')}
            className={`flex-1 py-1 px-2.5 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'file'
                ? 'bg-[#22222e] text-amber-300 border border-amber-500/40'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#161622]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Case Dossier</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2 custom-scrollbar">
        {activeTab === 'suspects' ? (
          <div className="space-y-2">
            {mystery.suspects.map((suspect) => {
              const isSelected = suspect.id === selectedSuspectId;
              const discoveredStatements = suspect.statements.filter((s) => s.isDiscovered).length;

              return (
                <div
                  key={suspect.id}
                  onClick={() => onSelectSuspect(suspect.id)}
                  className={`group relative p-2.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-amber-500/60 bg-[#1d1d28] shadow-sm'
                      : 'border-[#262632] bg-[#16161f]/90 hover:bg-[#1b1b26] hover:border-[#38384a]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    {/* Avatar Initials / Icon */}
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-serif font-black text-xs border shrink-0 ${suspect.avatarColor}`}
                    >
                      {suspect.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .substring(0, 2)}
                    </div>

                    {/* Suspect Meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-bold text-xs text-gray-100 truncate group-hover:text-amber-300 transition-colors">
                          {suspect.name}
                        </h4>
                        <span className={`text-[9px] font-mono px-1 py-0.2 rounded border capitalize ${getEmotionalBadge(suspect.emotionalState)}`}>
                          {suspect.emotionalState}
                        </span>
                      </div>

                      <p className="text-[11px] text-amber-400/90 truncate">{suspect.occupation}</p>
                      <p className="text-[10px] text-gray-400 truncate mt-0.5">{suspect.relationship}</p>
                    </div>
                  </div>

                  {/* Known Motive */}
                  <div className="mt-2 pt-1.5 border-t border-[#22222c]">
                    <div className="text-[10px] text-gray-300 line-clamp-2">
                      <span className="text-gray-400 font-semibold">Motive: </span>
                      {suspect.knownMotive}
                    </div>
                  </div>

                  {/* Suspicion Meter & Action */}
                  <div className="mt-2 flex items-center justify-between gap-2.5">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-[9px] font-mono mb-0.5">
                        <span className="text-gray-400">Suspicion</span>
                        <span
                          className={`font-bold ${
                            suspect.suspicionLevel > 60
                              ? 'text-red-400'
                              : suspect.suspicionLevel > 35
                              ? 'text-amber-400'
                              : 'text-gray-400'
                          }`}
                        >
                          {suspect.suspicionLevel}%
                        </span>
                      </div>
                      <div className="h-1 w-full bg-[#1e1e2c] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            suspect.suspicionLevel > 60
                              ? 'bg-red-500'
                              : suspect.suspicionLevel > 35
                              ? 'bg-amber-500'
                              : 'bg-zinc-500'
                          }`}
                          style={{ width: `${suspect.suspicionLevel}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartInterrogation(suspect.id);
                      }}
                      className="px-2 py-0.5 rounded-md bg-[#22222e] hover:bg-amber-600 hover:text-zinc-950 text-gray-200 text-[11px] font-semibold flex items-center gap-1 transition-all shrink-0 border border-[#2e2e40]"
                    >
                      <MessageSquare className="w-2.5 h-2.5 text-amber-400 group-hover:text-zinc-950" />
                      <span>Interview</span>
                    </button>
                  </div>

                  {/* Statements count pill */}
                  <div className="mt-1.5 flex items-center justify-between text-[9px] text-gray-400">
                    <span>{discoveredStatements} statement{discoveredStatements !== 1 ? 's' : ''}</span>
                    {suspect.interrogationCount > 0 && (
                      <span className="text-amber-400/80 font-mono">Questioned x{suspect.interrogationCount}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2.5 text-xs">
            {/* Case Overview */}
            <div className="p-2.5 rounded-lg border border-[#262632] bg-[#16161f] space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase tracking-wider text-[10px]">
                <AlertCircle className="w-3 h-3" />
                <span>Crime Dossier</span>
              </div>
              <p className="text-gray-200 leading-relaxed font-serif text-xs italic">{mystery.crime}</p>
            </div>

            {/* Key Meta */}
            <div className="p-2.5 rounded-lg border border-[#262632] bg-[#16161f]/80 space-y-1.5">
              <div className="flex items-start gap-1.5 text-gray-300">
                <MapPin className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-400 font-semibold block text-[10px]">Location</span>
                  <span className="text-gray-200 text-[11px]">{mystery.location}</span>
                </div>
              </div>

              <div className="flex items-start gap-1.5 text-gray-300 pt-1.5 border-t border-[#22222c]">
                <Calendar className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-400 font-semibold block text-[10px]">Incident Date & Time</span>
                  <span className="text-gray-200 text-[11px]">{mystery.date}</span>
                </div>
              </div>

              <div className="flex items-start gap-1.5 text-gray-300 pt-1.5 border-t border-[#22222c]">
                <Skull className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-400 font-semibold block text-[10px]">Victim / Party</span>
                  <span className="text-gray-200 text-[11px]">{mystery.victim}</span>
                </div>
              </div>
            </div>

            {/* Briefing Narrative */}
            <div className="p-2.5 rounded-lg border border-[#262632] bg-[#16161f]/60 space-y-1">
              <h5 className="font-bold text-gray-300 text-[11px]">Detective Briefing</h5>
              <p className="text-gray-400 leading-relaxed text-[10px]">{mystery.briefing}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
