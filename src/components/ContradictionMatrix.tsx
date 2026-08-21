import React, { useState } from 'react';
import {
  Scale,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Sparkles,
  ArrowRightLeft,
  User,
  Quote,
  ShieldCheck,
} from 'lucide-react';
import { SuspectStatement, Contradiction, Suspect } from '../types';

interface ContradictionMatrixProps {
  suspects: Suspect[];
  discoveredContradictions: Contradiction[];
  onCompareStatements: (stmt1: SuspectStatement, stmt2: SuspectStatement) => Promise<void>;
  isComparing: boolean;
  lastComparisonResult: { isContradiction: boolean; analysis: string; points: number } | null;
}

export const ContradictionMatrix: React.FC<ContradictionMatrixProps> = ({
  suspects,
  discoveredContradictions,
  onCompareStatements,
  isComparing,
  lastComparisonResult,
}) => {
  const [selectedStatement1Id, setSelectedStatement1Id] = useState<string>('');
  const [selectedStatement2Id, setSelectedStatement2Id] = useState<string>('');

  // Collect all discovered statements across all suspects
  const allDiscoveredStatements: SuspectStatement[] = [];
  suspects.forEach((suspect) => {
    suspect.statements.forEach((stmt) => {
      if (stmt.isDiscovered) {
        allDiscoveredStatements.push(stmt);
      }
    });
  });

  const stmt1 = allDiscoveredStatements.find((s) => s.id === selectedStatement1Id);
  const stmt2 = allDiscoveredStatements.find((s) => s.id === selectedStatement2Id);

  const handleCompare = async () => {
    if (!stmt1 || !stmt2 || stmt1.id === stmt2.id || isComparing) return;
    await onCompareStatements(stmt1, stmt2);
  };

  return (
    <div className="flex flex-col h-full space-y-2.5">
      {/* Header */}
      <div className="p-2 bg-[#0e0e14] border border-[#22222c] rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Scale className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-bold text-gray-200 uppercase tracking-wider">
            Statement Contradiction Matrix
          </span>
        </div>
        <span className="text-[11px] font-mono text-amber-400 bg-amber-950/40 border border-amber-500/30 px-1.5 py-0.2 rounded font-bold">
          {discoveredContradictions.length} Resolved (+150 pts)
        </span>
      </div>

      {/* Comparison Engine Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {/* Statement Slot 1 */}
        <div className="p-2.5 rounded-lg border border-[#262632] bg-[#16161f] flex flex-col justify-between space-y-1.5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-amber-400 font-mono uppercase">Statement #1</span>
              {stmt1 && <span className="text-[10px] text-gray-400">{stmt1.timestamp}</span>}
            </div>

            <select
              value={selectedStatement1Id}
              onChange={(e) => setSelectedStatement1Id(e.target.value)}
              className="w-full bg-[#0e0e14] border border-[#262634] rounded px-2 py-1 text-xs text-gray-200 focus:outline-none focus:border-amber-500 mb-1.5"
            >
              <option value="">-- Choose First Statement --</option>
              {allDiscoveredStatements.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.suspectName}: "{s.text.substring(0, 50)}..."
                </option>
              ))}
            </select>

            {stmt1 ? (
              <div className="p-2 rounded bg-[#0c0c10] border border-[#20202a] text-[11px] text-gray-200 italic font-serif leading-relaxed">
                <span className="font-sans font-bold text-amber-400 not-italic block text-[10px] mb-0.5">
                  {stmt1.suspectName} ({stmt1.topic}):
                </span>
                "{stmt1.text}"
              </div>
            ) : (
              <p className="text-[11px] text-gray-400 italic">Select a testimony from records above.</p>
            )}
          </div>
        </div>

        {/* Statement Slot 2 */}
        <div className="p-2.5 rounded-lg border border-[#262632] bg-[#16161f] flex flex-col justify-between space-y-1.5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-cyan-400 font-mono uppercase">Statement #2</span>
              {stmt2 && <span className="text-[10px] text-gray-400">{stmt2.timestamp}</span>}
            </div>

            <select
              value={selectedStatement2Id}
              onChange={(e) => setSelectedStatement2Id(e.target.value)}
              className="w-full bg-[#0e0e14] border border-[#262634] rounded px-2 py-1 text-xs text-gray-200 focus:outline-none focus:border-cyan-500 mb-1.5"
            >
              <option value="">-- Choose Second Statement --</option>
              {allDiscoveredStatements.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.suspectName}: "{s.text.substring(0, 50)}..."
                </option>
              ))}
            </select>

            {stmt2 ? (
              <div className="p-2 rounded bg-[#0c0c10] border border-[#20202a] text-[11px] text-gray-200 italic font-serif leading-relaxed">
                <span className="font-sans font-bold text-cyan-400 not-italic block text-[10px] mb-0.5">
                  {stmt2.suspectName} ({stmt2.topic}):
                </span>
                "{stmt2.text}"
              </div>
            ) : (
              <p className="text-[11px] text-gray-400 italic">Select a testimony to compare.</p>
            )}
          </div>
        </div>
      </div>

      {/* Compare Action Button */}
      <div className="flex justify-center">
        <button
          onClick={handleCompare}
          disabled={!stmt1 || !stmt2 || stmt1.id === stmt2.id || isComparing}
          className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-950/40 disabled:opacity-40 transition-all active:scale-95"
        >
          {isComparing ? (
            <>
              <div className="w-3 h-3 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              <span>Analyzing Consistency...</span>
            </>
          ) : (
            <>
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Compare Statements</span>
            </>
          )}
        </button>
      </div>

      {/* Comparison Analysis Result Banner */}
      {lastComparisonResult && (
        <div
          className={`p-2.5 rounded-lg border transition-all ${
            lastComparisonResult.isContradiction
              ? 'bg-red-950/40 border-red-500/50 shadow-md shadow-red-950/30'
              : 'bg-[#161622] border-[#2c2c3e]'
          }`}
        >
          <div className="flex items-center gap-1.5 mb-1">
            {lastComparisonResult.isContradiction ? (
              <div className="flex items-center gap-1.5 text-red-400 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-bounce" />
                <span>CRITICAL CONTRADICTION UNCOVERED (+{lastComparisonResult.points} PTS)</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-gray-300 font-bold text-xs">
                <CheckCircle className="w-3.5 h-3.5 text-gray-400" />
                <span>Statements Analyzed (No Direct Contradiction)</span>
              </div>
            )}
          </div>
          <p className="text-[11px] text-gray-200 leading-relaxed">{lastComparisonResult.analysis}</p>
        </div>
      )}

      {/* Solved Contradictions Log */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pt-1 custom-scrollbar">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Discovered Inconsistencies ({discoveredContradictions.length})</span>
        </h4>

        {discoveredContradictions.length === 0 ? (
          <div className="p-2.5 rounded-lg border border-[#262634] bg-[#101016]/40 text-center text-xs text-gray-400">
            No contradictions logged yet. Compare conflicting timelines, alibis, or physical claims between suspects.
          </div>
        ) : (
          discoveredContradictions.map((c) => (
            <div key={c.id} className="p-2.5 rounded-lg border border-red-900/40 bg-red-950/20 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-red-300">
                <span>{c.suspect1Name} vs {c.suspect2Name}</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-red-900/40 border border-red-700/50 text-red-300 uppercase">
                  {c.importance}
                </span>
              </div>
              <p className="text-[11px] text-gray-300 leading-relaxed">{c.explanation}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
