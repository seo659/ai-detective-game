import React, { useState } from 'react';
import { Search, MapPin, CheckCircle, Sparkles, AlertCircle, Compass, FileCheck, Layers } from 'lucide-react';
import { LocationScene, SearchablePoint } from '../types';
import { sounds } from '../services/soundEffects';

interface SceneInvestigationProps {
  locations: LocationScene[];
  onSearchPoint: (locationId: string, pointId: string) => void;
  searchingPointId: string | null;
}

export const SceneInvestigation: React.FC<SceneInvestigationProps> = ({
  locations,
  onSearchPoint,
  searchingPointId,
}) => {
  const [selectedLocationId, setSelectedLocationId] = useState<string>(locations[0]?.id || '');

  const currentLocation = locations.find((l) => l.id === selectedLocationId) || locations[0];

  const handleSearch = (point: SearchablePoint) => {
    if (!currentLocation) return;
    onSearchPoint(currentLocation.id, point.id);
  };

  return (
    <div className="flex flex-col h-full space-y-2.5">
      {/* Location Selector Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#0e0e14] border border-[#22222c] rounded-lg overflow-x-auto">
        {locations.map((loc) => {
          const isSelected = loc.id === (currentLocation?.id || '');
          const searchedCount = loc.searchablePoints.filter((p) => p.isSearched).length;
          const totalPoints = loc.searchablePoints.length;

          return (
            <button
              key={loc.id}
              onClick={() => setSelectedLocationId(loc.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all shrink-0 ${
                isSelected
                  ? 'bg-[#22222e] text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'bg-[#14141c] text-gray-400 border border-[#262634] hover:text-gray-200 hover:bg-[#1a1a24]'
              }`}
            >
              <MapPin className="w-3 h-3 text-amber-400" />
              <span>{loc.name}</span>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#181824] text-gray-300">
                {searchedCount}/{totalPoints}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Location Investigation Canvas */}
      {currentLocation && (
        <div className="flex-1 flex flex-col space-y-2.5 overflow-y-auto pr-1 custom-scrollbar">
          {/* Location Atmosphere Header */}
          <div className="p-3 rounded-lg border border-[#262632] bg-[#16161f] shadow-md">
            <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
              <Compass className="w-3 h-3" />
              <span>Crime Scene Area</span>
            </div>
            <h3 className="text-sm font-serif font-bold text-gray-100 mb-0.5">{currentLocation.name}</h3>
            <p className="text-[11px] text-gray-400 leading-relaxed max-w-2xl">{currentLocation.description}</p>
          </div>

          {/* Points of Interest Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {currentLocation.searchablePoints.map((point) => {
              const isSearching = searchingPointId === point.id;

              return (
                <div
                  key={point.id}
                  className={`relative p-3 rounded-lg border transition-all flex flex-col justify-between ${
                    point.isSearched
                      ? 'border-[#262632] bg-[#16161f]'
                      : 'border-amber-500/30 bg-[#171722] hover:border-amber-500/50 shadow-sm'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-1.5 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`w-6 h-6 rounded-md flex items-center justify-center border ${
                            point.isSearched
                              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
                              : 'bg-amber-950/40 border-amber-500/40 text-amber-400'
                          }`}
                        >
                          {point.isSearched ? <CheckCircle className="w-3 h-3" /> : <Search className="w-3 h-3" />}
                        </div>
                        <h4 className="font-bold text-xs text-gray-100">{point.name}</h4>
                      </div>

                      {point.isSearched ? (
                        <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border border-emerald-500/30 text-emerald-400 bg-emerald-950/20">
                          Forensic Logged
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border border-amber-500/30 text-amber-400 bg-amber-950/20">
                          Unsearched
                        </span>
                      )}
                    </div>

                    {/* Point description */}
                    <p className="text-[11px] text-gray-400 leading-relaxed mb-2">{point.description}</p>

                    {/* If searched, display revealed findings */}
                    {point.isSearched && (
                      <div className="p-2 rounded bg-[#101016] border border-[#22222e] space-y-0.5 mb-2">
                        <div className="flex items-center gap-1 text-amber-400 text-[10px] font-bold">
                          <FileCheck className="w-2.5 h-2.5" />
                          <span>Forensic Findings:</span>
                        </div>
                        <p className="text-[11px] text-gray-200 leading-relaxed italic">{point.searchDetail}</p>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="pt-1">
                    <button
                      onClick={() => handleSearch(point)}
                      disabled={isSearching}
                      className={`w-full py-1.5 px-2.5 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        point.isSearched
                          ? 'bg-[#22222e] hover:bg-[#2c2c3c] text-gray-300 border border-[#2e2e40]'
                          : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-zinc-950 shadow-sm shadow-amber-950/40 active:scale-98'
                      }`}
                    >
                      {isSearching ? (
                        <>
                          <div className="w-3 h-3 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                          <span>Examining with Magnifier...</span>
                        </>
                      ) : point.isSearched ? (
                        <>
                          <Search className="w-3 h-3 text-gray-400" />
                          <span>Re-examine Point</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-zinc-950" />
                          <span>Investigate Point (+50 pts)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
