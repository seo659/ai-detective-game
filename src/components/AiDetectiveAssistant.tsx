import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  HelpCircle,
  Lightbulb,
  FileText,
  Clock,
  Send,
  AlertCircle,
  ChevronRight,
  Shield,
  BookOpen,
} from 'lucide-react';
import { MysteryCase, InvestigationLog, AiHintResponse } from '../types';

interface AiDetectiveAssistantProps {
  mystery: MysteryCase;
  onRequestHint: (level: number) => Promise<void>;
  onAskCustomAssistantQuestion: (question: string) => Promise<void>;
  isHintLoading: boolean;
  activeHint: AiHintResponse | null;
  onUpdatePlayerNotes: (notes: string) => void;
}

export const AiDetectiveAssistant: React.FC<AiDetectiveAssistantProps> = ({
  mystery,
  onRequestHint,
  onAskCustomAssistantQuestion,
  isHintLoading,
  activeHint,
  onUpdatePlayerNotes,
}) => {
  const [activeTab, setActiveTab] = useState<'assistant' | 'log' | 'notes'>('assistant');
  const [consultQuery, setConsultQuery] = useState('');

  const quickQuestions = [
    'What should I investigate next?',
    'Which suspect seems most suspicious?',
    'Do we have enough evidence to accuse?',
    'Which statements might contradict each other?',
  ];

  const handleAsk = async (query: string) => {
    if (!query.trim() || isHintLoading) return;
    await onAskCustomAssistantQuestion(query.trim());
    setConsultQuery('');
  };

  return (
    <div className="flex flex-col h-full bg-[#0e0e14] border border-[#22222c] rounded-xl overflow-hidden shadow-lg">
      {/* Top Tab Bar */}
      <div className="flex items-center justify-between border-b border-[#22222c] bg-[#121218] p-1.5">
        <div className="flex items-center gap-1 w-full">
          <button
            onClick={() => setActiveTab('assistant')}
            className={`flex-1 py-1 px-2 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'assistant'
                ? 'bg-[#22222e] text-amber-300 border border-amber-500/30'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#181822]'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Inspector AI</span>
          </button>

          <button
            onClick={() => setActiveTab('log')}
            className={`flex-1 py-1 px-2 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'log'
                ? 'bg-[#22222e] text-amber-300 border border-amber-500/30'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#181822]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Case Log</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 py-1 px-2 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'notes'
                ? 'bg-[#22222e] text-amber-300 border border-amber-500/30'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#181822]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Notes</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 custom-scrollbar">
        {activeTab === 'assistant' ? (
          <div className="space-y-2.5">
            {/* Inspector Avatar Banner */}
            <div className="p-2.5 rounded-lg border border-[#262632] bg-[#16161f] flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-gray-100">Inspector Blake</h4>
                <p className="text-[10px] text-amber-400/80">AI Detective Advisor • Yard Specialist</p>
              </div>
            </div>

            {/* Hint Tier Buttons */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-gray-400 font-semibold">
                <span className="flex items-center gap-1">
                  <Lightbulb className="w-3 h-3 text-amber-400" />
                  Request Detective Hint:
                </span>
                <span className="text-[9px] text-red-400 font-mono">Deducts Score</span>
              </div>

              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => onRequestHint(1)}
                  disabled={isHintLoading}
                  className="p-1.5 rounded-md border border-[#262634] bg-[#14141c] hover:bg-[#1c1c28] hover:border-amber-500/40 text-center transition-all disabled:opacity-50"
                >
                  <div className="text-[10px] font-bold text-gray-200">Hint 1</div>
                  <div className="text-[9px] text-gray-400">Subtle</div>
                  <div className="text-[9px] font-mono text-amber-400">-30 pts</div>
                </button>

                <button
                  onClick={() => onRequestHint(2)}
                  disabled={isHintLoading}
                  className="p-1.5 rounded-md border border-[#262634] bg-[#14141c] hover:bg-[#1c1c28] hover:border-amber-500/40 text-center transition-all disabled:opacity-50"
                >
                  <div className="text-[10px] font-bold text-gray-200">Hint 2</div>
                  <div className="text-[9px] text-gray-400">Specific</div>
                  <div className="text-[9px] font-mono text-amber-400">-75 pts</div>
                </button>

                <button
                  onClick={() => onRequestHint(3)}
                  disabled={isHintLoading}
                  className="p-1.5 rounded-md border border-[#262634] bg-[#14141c] hover:bg-[#1c1c28] hover:border-amber-500/40 text-center transition-all disabled:opacity-50"
                >
                  <div className="text-[10px] font-bold text-gray-200">Hint 3</div>
                  <div className="text-[9px] text-gray-400">Direct</div>
                  <div className="text-[9px] font-mono text-amber-400">-150 pts</div>
                </button>
              </div>
            </div>

            {/* Active Hint Output Display */}
            {activeHint && (
              <div className="p-2.5 rounded-lg border border-amber-500/40 bg-[#181614] space-y-1.5 shadow-md">
                <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    {activeHint.title}
                  </span>
                  <span className="text-[9px] font-mono text-red-400">-{activeHint.penalty} pts</span>
                </div>
                <p className="text-[11px] text-gray-200 leading-relaxed italic font-serif">"{activeHint.hintText}"</p>
                <div className="pt-1.5 border-t border-[#2a2620] text-[10px] text-amber-400">
                  <span className="font-semibold">Recommended Action: </span>
                  {activeHint.suggestedAction}
                </div>
              </div>
            )}

            {/* Quick Consultation Questions */}
            <div className="space-y-1">
              <span className="text-[10px] text-gray-400 font-semibold block">Consultation Topics:</span>
              <div className="space-y-1">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAsk(q)}
                    disabled={isHintLoading}
                    className="w-full text-left p-1.5 rounded-md bg-[#14141c] hover:bg-[#1e1e2c] border border-[#22222e] text-[11px] text-gray-300 hover:text-amber-300 transition-colors flex items-center justify-between group disabled:opacity-50"
                  >
                    <span className="truncate">{q}</span>
                    <ChevronRight className="w-3 h-3 text-gray-600 group-hover:text-amber-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Assistant Query Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAsk(consultQuery);
              }}
              className="flex items-center gap-1.5 pt-0.5"
            >
              <input
                type="text"
                placeholder="Ask Inspector Blake..."
                value={consultQuery}
                onChange={(e) => setConsultQuery(e.target.value)}
                disabled={isHintLoading}
                className="flex-1 bg-[#0e0e14] border border-[#262634] rounded-md px-2.5 py-1 text-xs text-gray-100 placeholder-gray-400 focus:outline-none focus:border-amber-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isHintLoading || !consultQuery.trim()}
                className="p-1.5 rounded-md bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold transition-all disabled:opacity-40"
              >
                <Send className="w-3 h-3" />
              </button>
            </form>
          </div>
        ) : activeTab === 'log' ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-0.5">
              <span className="font-semibold">Event Logs</span>
              <span className="font-mono text-[9px]">{mystery.investigationLogs.length} Entries</span>
            </div>

            <div className="space-y-1.5">
              {mystery.investigationLogs.map((log) => {
                const getLogColor = () => {
                  switch (log.type) {
                    case 'clue':
                      return 'border-emerald-500/30 text-emerald-400';
                    case 'contradiction':
                      return 'border-red-500/30 text-red-400';
                    case 'dialogue':
                      return 'border-cyan-500/30 text-cyan-400';
                    case 'hint':
                      return 'border-purple-500/30 text-purple-400';
                    default:
                      return 'border-[#2e2e40] text-amber-400';
                  }
                };

                return (
                  <div key={log.id} className="p-2 rounded-md border border-[#242432] bg-[#121218] text-xs space-y-0.5">
                    <div className="flex items-center justify-between text-[9px] font-mono">
                      <span className={`px-1 py-0.2 rounded border uppercase font-bold ${getLogColor()}`}>
                        {log.action}
                      </span>
                      <span className="text-gray-400">{log.timestamp}</span>
                    </div>
                    <p className="text-gray-300 leading-relaxed text-[11px]">{log.details}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-1.5 h-full flex flex-col">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="font-semibold">Scratchpad</span>
              <span className="text-[9px] text-amber-400">Autosaved</span>
            </div>
            <textarea
              value={mystery.playerNotes}
              onChange={(e) => onUpdatePlayerNotes(e.target.value)}
              placeholder="Record your personal theories, suspect motives, and working timeline hypotheses here..."
              className="w-full flex-1 min-h-[200px] bg-[#0e0e14] border border-[#262634] rounded-lg p-2.5 text-xs text-gray-100 placeholder-gray-400 focus:outline-none focus:border-amber-500 resize-none font-mono custom-scrollbar leading-relaxed"
            />
          </div>
        )}
      </div>
    </div>
  );
};
