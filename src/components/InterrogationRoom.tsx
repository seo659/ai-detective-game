import React, { useState } from 'react';
import {
  MessageSquare,
  User,
  Send,
  Sparkles,
  AlertTriangle,
  FolderOpen,
  Briefcase,
  Quote,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';
import { Suspect, Evidence } from '../types';

interface InterrogationRoomProps {
  suspects: Suspect[];
  selectedSuspectId: string;
  onSelectSuspect: (id: string) => void;
  discoveredEvidence: Evidence[];
  onAskQuestion: (suspectId: string, question: string, evidence?: Evidence) => Promise<void>;
  isThinking: boolean;
  dialogueHistory: Array<{ sender: 'detective' | 'suspect'; name: string; text: string; presentedEvidence?: string; timestamp: string }>;
}

export const InterrogationRoom: React.FC<InterrogationRoomProps> = ({
  suspects,
  selectedSuspectId,
  onSelectSuspect,
  discoveredEvidence,
  onAskQuestion,
  isThinking,
  dialogueHistory,
}) => {
  const [customQuestion, setCustomQuestion] = useState('');
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string>('');

  const currentSuspect = suspects.find((s) => s.id === selectedSuspectId) || suspects[0];

  const suggestedQuestions = [
    'Where were you and what were you doing during the critical moment of the incident?',
    'What was the nature of your financial or personal relationship with the victim?',
    'Did you notice any unusual movements or conversations prior to the crime?',
    'Why would someone with your skill or access want this to happen?',
  ];

  const handleSubmit = async (questionText: string) => {
    if (!questionText.trim() || isThinking || !currentSuspect) return;
    const ev = discoveredEvidence.find((e) => e.id === selectedEvidenceId);
    await onAskQuestion(currentSuspect.id, questionText.trim(), ev);
    setCustomQuestion('');
    setSelectedEvidenceId('');
  };

  const getEmotionalBadge = (state: Suspect['emotionalState']) => {
    switch (state) {
      case 'panicked':
        return 'bg-red-950/70 text-red-400 border-red-800/70 animate-pulse';
      case 'nervous':
        return 'bg-amber-950/70 text-amber-400 border-amber-800/70';
      case 'defensive':
        return 'bg-orange-950/70 text-orange-400 border-orange-800/70';
      case 'arrogant':
        return 'bg-purple-950/70 text-purple-400 border-purple-800/70';
      default:
        return 'bg-[#181822] text-gray-400 border-[#2a2a38]';
    }
  };

  return (
    <div className="flex flex-col h-full space-y-2">
      {/* Suspect Selector Pill Row */}
      <div className="flex items-center gap-1.5 p-1 bg-[#0e0e14] border border-[#22222c] rounded-lg overflow-x-auto">
        {suspects.map((s) => {
          const isSelected = s.id === (currentSuspect?.id || '');
          return (
            <button
              key={s.id}
              onClick={() => onSelectSuspect(s.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all shrink-0 ${
                isSelected
                  ? 'bg-[#22222e] text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'bg-[#14141c] text-gray-400 border border-[#262634] hover:text-gray-200'
              }`}
            >
              <div className={`w-4 h-4 rounded flex items-center justify-center text-[9px] font-black border ${s.avatarColor}`}>
                {s.name[0]}
              </div>
              <span>{s.name.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Main Interrogation View */}
      {currentSuspect && (
        <div className="flex-1 flex flex-col space-y-2 min-h-0">
          {/* Suspect Status Banner */}
          <div className="p-2.5 rounded-lg border border-[#262632] bg-[#16161f] flex flex-wrap items-center justify-between gap-2 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-serif font-black text-sm border shadow-inner ${currentSuspect.avatarColor}`}>
                {currentSuspect.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-xs text-gray-100">{currentSuspect.name}</h3>
                  <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border capitalize ${getEmotionalBadge(currentSuspect.emotionalState)}`}>
                    {currentSuspect.emotionalState}
                  </span>
                </div>
                <p className="text-[10px] text-amber-400/90">{currentSuspect.occupation} • {currentSuspect.relationship}</p>
              </div>
            </div>

            {/* Suspicion Bar */}
            <div className="flex items-center gap-2 min-w-[150px]">
              <div className="flex-1 text-right">
                <div className="text-[9px] font-mono text-gray-400 mb-0.5">
                  Suspicion: <span className="font-bold text-amber-400">{currentSuspect.suspicionLevel}%</span>
                </div>
                <div className="h-1.5 w-full bg-[#1e1e2c] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      currentSuspect.suspicionLevel > 60
                        ? 'bg-red-500'
                        : currentSuspect.suspicionLevel > 35
                        ? 'bg-amber-500'
                        : 'bg-zinc-500'
                    }`}
                    style={{ width: `${currentSuspect.suspicionLevel}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dialogue Transcript Feed */}
          <div className="flex-1 p-2.5 bg-[#0c0c10] border border-[#20202a] rounded-lg overflow-y-auto space-y-2.5 custom-scrollbar">
            {dialogueHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-gray-400 space-y-1.5">
                <MessageSquare className="w-6 h-6 text-amber-400/40" />
                <p className="text-xs max-w-sm text-gray-400">
                  Select a suggested inquiry or type a custom question below to interrogate {currentSuspect.name}.
                </p>
              </div>
            ) : (
              dialogueHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col space-y-0.5 ${item.sender === 'detective' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 text-[9px] font-mono text-gray-400">
                    <span>{item.name}</span>
                    <span>•</span>
                    <span>{item.timestamp}</span>
                    {item.presentedEvidence && (
                      <span className="text-amber-400 font-semibold">[Clue: {item.presentedEvidence}]</span>
                    )}
                  </div>

                  <div
                    className={`p-2.5 rounded-xl max-w-[85%] text-xs leading-relaxed ${
                      item.sender === 'detective'
                        ? 'bg-[#22222e] border border-amber-500/30 text-amber-200 rounded-tr-none'
                        : 'bg-[#161622] border border-[#282838] text-gray-200 rounded-tl-none font-serif italic text-xs'
                    }`}
                  >
                    {item.text}
                  </div>
                </div>
              ))
            )}

            {isThinking && (
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono italic animate-pulse p-1.5">
                <Sparkles className="w-3 h-3 animate-spin" />
                <span>{currentSuspect.name} is carefully formulating response...</span>
              </div>
            )}
          </div>

          {/* Suggested Quick Questions */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-semibold">
              <Quote className="w-2.5 h-2.5 text-amber-400" />
              <span>Suggested Inquiries:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {suggestedQuestions.map((q, qIdx) => (
                <button
                  key={qIdx}
                  onClick={() => handleSubmit(q)}
                  disabled={isThinking}
                  className="p-1.5 rounded bg-[#14141c] hover:bg-[#1e1e2c] border border-[#242434] text-left text-[11px] text-gray-300 hover:text-amber-300 transition-colors line-clamp-1 disabled:opacity-50"
                >
                  "{q}"
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar with Evidence Presentation Option */}
          <div className="p-2 bg-[#121216] border border-[#262632] rounded-lg space-y-1.5">
            {/* Optional Evidence Selector */}
            {discoveredEvidence.length > 0 && (
              <div className="flex items-center gap-1.5">
                <FolderOpen className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="text-[10px] text-gray-400 shrink-0">Present Clue:</span>
                <select
                  value={selectedEvidenceId}
                  onChange={(e) => setSelectedEvidenceId(e.target.value)}
                  className="flex-1 bg-[#0e0e14] border border-[#262634] rounded px-2 py-0.5 text-xs text-gray-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- None (Standard Inquiry) --</option>
                  {discoveredEvidence.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name} ({ev.importance === 'strong' ? '★ Strong' : 'Supporting'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Custom Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(customQuestion);
              }}
              className="flex items-center gap-1.5"
            >
              <input
                type="text"
                placeholder={`Ask ${currentSuspect.name} or confront them...`}
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                disabled={isThinking}
                className="flex-1 bg-[#0e0e14] border border-[#262634] rounded-md px-2.5 py-1.5 text-xs text-gray-100 placeholder-gray-400 focus:outline-none focus:border-amber-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isThinking || !customQuestion.trim()}
                className="px-3 py-1.5 rounded-md bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1 transition-all disabled:opacity-40 shadow-sm shrink-0"
              >
                <Send className="w-3 h-3" />
                <span>Ask</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
