import React from 'react';
import { Shield, Play, RotateCcw, HelpCircle, Sparkles, BookOpen, Compass, Zap } from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface TitleScreenProps {
  onStartNewCase: () => void;
  onContinueCase: () => void;
  hasSavedCase: boolean;
  onStartDemoCase: () => void;
  onOpenHowToPlay: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartNewCase,
  onContinueCase,
  hasSavedCase,
  onStartDemoCase,
  onOpenHowToPlay,
}) => {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-3 sm:p-6 bg-[#0a0a0c] text-gray-300 overflow-hidden select-none">
      {/* Background Atmospheric Layers */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(180,83,9,0.08),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(10,10,12,0.9)_100%)] pointer-events-none" />

      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#22222c20_1px,transparent_1px),linear-gradient(to_bottom,#22222c20_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Main Glass Card */}
      <div className="relative z-10 max-w-md w-full text-center space-y-5 p-6 sm:p-8 rounded-2xl border border-[#22222c] bg-[#0e0e14]/90 backdrop-blur-md shadow-2xl shadow-amber-950/20">
        {/* Emblem Badge */}
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-950/40 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-950/30">
            <Shield className="w-7 h-7" />
          </div>
        </div>

        {/* Title & Tagline */}
        <div className="space-y-1.5">
          <h1 className="font-serif font-black text-3xl sm:text-4xl tracking-widest text-gray-100 uppercase">
            The AI Detective
          </h1>
          <p className="text-xs sm:text-sm text-amber-300/90 font-serif italic max-w-xs mx-auto leading-relaxed">
            “Something has happened. Can you uncover the truth?”
          </p>
          <div className="flex items-center justify-center gap-1 pt-0.5 text-[10px] font-mono text-gray-400">
            <span>Powered by Gemini Game Master Engine</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-2 pt-1 max-w-xs mx-auto">
          {/* New Case Button */}
          <button
            onClick={() => {
              sounds.startAmbience();
              onStartNewCase();
            }}
            className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-zinc-950 font-bold text-xs shadow-md shadow-amber-950/40 active:scale-98 transition-all flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
            <span>New Case (AI Generated)</span>
          </button>

          {/* Demo Case Button */}
          <button
            onClick={() => {
              sounds.startAmbience();
              onStartDemoCase();
            }}
            className="w-full py-2 px-4 rounded-lg bg-[#161622] hover:bg-[#1e1e2c] border border-amber-500/40 text-amber-300 font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Play Demo: Midnight Sapphire</span>
          </button>

          {/* Continue Case Button */}
          {hasSavedCase && (
            <button
              onClick={() => {
                sounds.startAmbience();
                onContinueCase();
              }}
              className="w-full py-2 px-4 rounded-lg bg-[#14141c] hover:bg-[#1c1c28] border border-[#262634] text-gray-200 font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3 h-3 text-emerald-400" />
              <span>Continue Saved Case</span>
            </button>
          )}

          {/* How to Play Button */}
          <button
            onClick={onOpenHowToPlay}
            className="w-full py-1.5 px-4 rounded-lg text-gray-400 hover:text-gray-200 text-xs font-semibold hover:bg-[#161620] transition-all flex items-center justify-center gap-1.5"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How to Play & Field Rules</span>
          </button>
        </div>

        {/* Footer Features */}
        <div className="pt-3 border-t border-[#22222c] grid grid-cols-3 gap-1.5 text-[9px] text-gray-400 font-mono">
          <div>Interactive Clues</div>
          <div>Live Suspect AI</div>
          <div>Contradiction Engine</div>
        </div>
      </div>
    </div>
  );
};
