import React, { useEffect } from 'react';
import { Shield, Volume2, VolumeX, HelpCircle, PlusCircle, AlertTriangle, Clock, Award, Compass } from 'lucide-react';
import { MysteryCase } from '../types';
import { sounds } from '../services/soundEffects';

interface HeaderProps {
  mystery: MysteryCase;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenHowToPlay: () => void;
  onOpenNewCase: () => void;
  onOpenAccusation: () => void;
  onTimeExpired: () => void;
  onUpdateTime: (seconds: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  mystery,
  isMuted,
  onToggleMute,
  onOpenHowToPlay,
  onOpenNewCase,
  onOpenAccusation,
  onTimeExpired,
  onUpdateTime,
}) => {
  // Timer effect for timed mode
  useEffect(() => {
    if (mystery.timerMode !== 'timed' || mystery.status !== 'active') return;

    const interval = setInterval(() => {
      if (mystery.timeRemainingSeconds <= 1) {
        onUpdateTime(0);
        clearInterval(interval);
        onTimeExpired();
      } else {
        onUpdateTime(mystery.timeRemainingSeconds - 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [mystery.timerMode, mystery.timeRemainingSeconds, mystery.status]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getRankBadge = (score: number) => {
    if (score >= 900) return { title: 'Legendary', color: 'text-amber-300 border-amber-500/40 bg-amber-950/30' };
    if (score >= 750) return { title: 'Master', color: 'text-emerald-300 border-emerald-500/40 bg-emerald-950/30' };
    if (score >= 500) return { title: 'Investigator', color: 'text-cyan-300 border-cyan-500/40 bg-cyan-950/30' };
    if (score >= 250) return { title: 'Rookie', color: 'text-indigo-300 border-indigo-500/40 bg-indigo-950/30' };
    return { title: 'Novice', color: 'text-gray-400 border-[#2a2a38] bg-[#161620]' };
  };

  const rank = getRankBadge(mystery.score);

  return (
    <header className="bg-[#0c0c10]/95 border-b border-[#22222c] sticky top-0 z-40 backdrop-blur-md px-3.5 py-2">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        {/* Left Branding */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-950/40 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-black tracking-wider text-sm text-gray-100 uppercase">The AI Detective</span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded border border-amber-500/30 text-amber-400 bg-amber-950/30">
                {mystery.difficulty}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 truncate max-w-xs sm:max-w-md" title={mystery.title}>
              {mystery.title}
            </p>
          </div>
        </div>

        {/* Center Stats / Timer / Score */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Timer Display if in timed mode */}
          {mystery.timerMode === 'timed' ? (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-mono text-xs font-semibold ${
                mystery.timeRemainingSeconds < 120
                  ? 'border-red-500/60 bg-red-950/40 text-red-400 animate-pulse'
                  : 'border-[#2a2a3a] bg-[#14141c] text-amber-300'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{formatTime(mystery.timeRemainingSeconds)}</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md border border-[#22222e] bg-[#14141c] text-[11px] text-gray-400 font-mono">
              <Compass className="w-3 h-3 text-gray-400" />
              <span>Relaxed Pace</span>
            </div>
          )}

          {/* Detective Score Meter */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-mono text-xs font-bold text-gray-100">{mystery.score}</span>
                <span className="text-[10px] text-gray-400 font-mono">/ 1000</span>
              </div>
              <span className={`text-[9px] uppercase font-bold tracking-wider px-1 py-0.2 rounded border ${rank.color}`}>
                {rank.title}
              </span>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onToggleMute}
            className="p-1.5 rounded-lg border border-[#262634] bg-[#14141c] text-gray-400 hover:text-gray-200 hover:bg-[#1e1e2c] transition-colors"
            title={isMuted ? 'Unmute Noir Audio' : 'Mute Audio'}
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-gray-500" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
          </button>

          <button
            onClick={onOpenHowToPlay}
            className="p-1.5 rounded-lg border border-[#262634] bg-[#14141c] text-gray-400 hover:text-gray-200 hover:bg-[#1e1e2c] transition-colors"
            title="How to Play"
            aria-label="How to Play"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onOpenNewCase}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-[#2e2e40] bg-[#161622] hover:bg-[#202030] text-gray-200 text-xs font-semibold transition-all shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">New Case</span>
          </button>

          <button
            onClick={onOpenAccusation}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-zinc-950 font-bold text-xs shadow-sm shadow-amber-950/40 hover:shadow-amber-500/20 active:scale-95 transition-all"
          >
            <AlertTriangle className="w-3.5 h-3.5 fill-zinc-950 text-amber-500" />
            <span>ACCUSATION</span>
          </button>
        </div>
      </div>
    </header>
  );
};
