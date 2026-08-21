import React from 'react';
import { Clock, CheckCircle2, AlertTriangle, HelpCircle, Lock, Calendar } from 'lucide-react';
import { TimelineEvent } from '../types';

interface TimelineViewProps {
  timeline: TimelineEvent[];
}

export const TimelineView: React.FC<TimelineViewProps> = ({ timeline }) => {
  const discoveredEvents = timeline.filter((t) => t.isDiscovered);
  const undiscoveredCount = timeline.length - discoveredEvents.length;

  return (
    <div className="flex flex-col h-full space-y-2.5">
      {/* Header */}
      <div className="p-2 bg-[#0e0e14] border border-[#22222c] rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-bold text-gray-200 uppercase tracking-wider">Chronological Case Timeline</span>
        </div>
        <span className="text-[11px] font-mono text-amber-400 bg-amber-950/40 border border-amber-500/30 px-1.5 py-0.2 rounded font-bold">
          {discoveredEvents.length} / {timeline.length} Verified
        </span>
      </div>

      {/* Timeline Stream */}
      <div className="flex-1 overflow-y-auto pr-1 relative space-y-2.5 custom-scrollbar">
        {/* Continuous Line */}
        <div className="absolute left-5 top-3 bottom-3 w-0.5 bg-[#20202c]" />

        {discoveredEvents.map((evt, idx) => (
          <div key={evt.id} className="relative flex items-start gap-3 pl-1.5 group">
            {/* Timeline Node */}
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 z-10 ${
                evt.isContradicted
                  ? 'bg-red-950/80 border-red-500/80 text-red-400'
                  : evt.verified
                  ? 'bg-[#1a1a26] border-amber-500/60 text-amber-400'
                  : 'bg-[#14141c] border-[#2c2c3e] text-gray-400'
              }`}
            >
              {evt.isContradicted ? (
                <AlertTriangle className="w-3.5 h-3.5" />
              ) : evt.verified ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <Clock className="w-3.5 h-3.5" />
              )}
            </div>

            {/* Content Card */}
            <div className="flex-1 p-2.5 rounded-lg border border-[#262632] bg-[#16161f] group-hover:border-amber-500/40 transition-all shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/40 px-1.5 py-0.2 rounded border border-amber-500/30">
                    {evt.time}
                  </span>
                  <h4 className="font-bold text-xs text-gray-100">{evt.title}</h4>
                </div>

                {evt.verified ? (
                  <span className="text-[9px] font-mono font-semibold text-emerald-400 bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-500/30">
                    Verified Fact
                  </span>
                ) : (
                  <span className="text-[9px] font-mono font-semibold text-amber-400 bg-amber-950/40 px-1.5 py-0.2 rounded border border-amber-500/30">
                    Testimony
                  </span>
                )}
              </div>

              <p className="text-[11px] text-gray-300 leading-relaxed">{evt.description}</p>
            </div>
          </div>
        ))}

        {undiscoveredCount > 0 && (
          <div className="relative flex items-center gap-3 pl-1.5 opacity-50">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center border border-dashed border-[#2e2e42] bg-[#101016] text-gray-500 shrink-0 z-10">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 p-2 rounded-lg border border-dashed border-[#262638] text-[11px] text-gray-400">
              {undiscoveredCount} additional chronological event{undiscoveredCount > 1 ? 's' : ''} waiting to be uncovered.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
