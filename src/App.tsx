/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Search,
  FolderOpen,
  MapPin,
  MessageSquare,
  Clock,
  Scale,
  Award,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import {
  MysteryCase,
  Difficulty,
  CrimeType,
  Evidence,
  Suspect,
  SuspectStatement,
  AccusationResult,
  AiHintResponse,
} from './types';
import { DEMO_CASE } from './data/demoCase';
import { createNewMysteryCase } from './services/mysteryGenerator';
import {
  generateClientInterrogationResponse,
  evaluateClientContradiction,
  generateClientDetectiveHint,
  evaluateClientAccusation,
} from './services/clientDetectiveEngine';
import { sounds } from './services/soundEffects';
import { Header } from './components/Header';
import { TitleScreen } from './components/TitleScreen';
import { CaseDossier } from './components/CaseDossier';
import { EvidenceBoard } from './components/EvidenceBoard';
import { SceneInvestigation } from './components/SceneInvestigation';
import { InterrogationRoom } from './components/InterrogationRoom';
import { TimelineView } from './components/TimelineView';
import { ContradictionMatrix } from './components/ContradictionMatrix';
import { AiDetectiveAssistant } from './components/AiDetectiveAssistant';
import { AccusationModal } from './components/AccusationModal';
import { CaseResultModal } from './components/CaseResultModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { NewCaseModal } from './components/NewCaseModal';
import { EvidenceInspectorModal } from './components/EvidenceInspectorModal';

const STORAGE_KEY = 'the_ai_detective_case_v1';

export default function App() {
  const [gameStage, setGameStage] = useState<'title' | 'investigation'>('title');
  const [currentCase, setCurrentCase] = useState<MysteryCase>(DEMO_CASE);
  const [hasSavedCase, setHasSavedCase] = useState<boolean>(false);

  // Navigation
  const [activeCenterTab, setActiveCenterTab] = useState<'evidence' | 'scene' | 'interrogate' | 'timeline' | 'contradictions'>('evidence');
  const [selectedSuspectId, setSelectedSuspectId] = useState<string>(DEMO_CASE.suspects[0]?.id || '');
  const [inspectingEvidence, setInspectingEvidence] = useState<Evidence | null>(null);

  // Modals
  const [isAccusationOpen, setIsAccusationOpen] = useState<boolean>(false);
  const [isNewCaseOpen, setIsNewCaseOpen] = useState<boolean>(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState<boolean>(false);
  const [caseResult, setCaseResult] = useState<AccusationResult | null>(null);

  // State flags
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isInterrogating, setIsInterrogating] = useState<boolean>(false);
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [isHintLoading, setIsHintLoading] = useState<boolean>(false);
  const [searchingPointId, setSearchingPointId] = useState<string | null>(null);
  const [activeHint, setActiveHint] = useState<AiHintResponse | null>(null);
  const [lastComparisonResult, setLastComparisonResult] = useState<{ isContradiction: boolean; analysis: string; points: number } | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(sounds.getIsMuted());

  // Suspect Dialogue History
  const [dialogueHistory, setDialogueHistory] = useState<
    Array<{ sender: 'detective' | 'suspect'; name: string; text: string; presentedEvidence?: string; timestamp: string }>
  >([]);

  // Check saved state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setHasSavedCase(true);
      }
    } catch (e) {}
  }, []);

  // Autosave active case
  useEffect(() => {
    if (gameStage === 'investigation' && currentCase) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentCase));
        setHasSavedCase(true);
      } catch (e) {}
    }
  }, [currentCase, gameStage]);

  // Handler: Start New Case
  const handleCreateCase = async (
    difficulty: Difficulty,
    crimeType: CrimeType,
    timerMode: 'relaxed' | 'timed',
    location?: string,
    suspectCount?: number
  ) => {
    setIsGenerating(true);
    try {
      const newCase = await createNewMysteryCase(difficulty, crimeType, timerMode, location, suspectCount);
      setCurrentCase(newCase);
      setSelectedSuspectId(newCase.suspects[0]?.id || '');
      setDialogueHistory([]);
      setActiveHint(null);
      setLastComparisonResult(null);
      setCaseResult(null);
      setActiveCenterTab('evidence');
      setIsNewCaseOpen(false);
      setGameStage('investigation');
      sounds.playClueDiscovered();
    } catch (e) {
      console.error('Failed to create new case:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handler: Load Demo Case
  const handleLoadDemoCase = () => {
    // Deep clone demo case
    const clonedDemo: MysteryCase = JSON.parse(JSON.stringify(DEMO_CASE));
    clonedDemo.id = `case_demo_${Date.now()}`;
    setCurrentCase(clonedDemo);
    setSelectedSuspectId(clonedDemo.suspects[0]?.id || '');
    setDialogueHistory([]);
    setActiveHint(null);
    setLastComparisonResult(null);
    setCaseResult(null);
    setActiveCenterTab('evidence');
    setGameStage('investigation');
  };

  // Handler: Continue Saved Case
  const handleContinueCase = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: MysteryCase = JSON.parse(saved);
        setCurrentCase(parsed);
        setSelectedSuspectId(parsed.suspects[0]?.id || '');
        setActiveCenterTab('evidence');
        setGameStage('investigation');
      }
    } catch (e) {
      handleLoadDemoCase();
    }
  };

  // Handler: Toggle Sound
  const handleToggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  // Handler: Time Update
  const handleUpdateTime = (seconds: number) => {
    setCurrentCase((prev) => ({
      ...prev,
      timeRemainingSeconds: seconds,
    }));
  };

  // Handler: Time Expired
  const handleTimeExpired = () => {
    sounds.playWrongAccusation();
    setIsAccusationOpen(true);
  };

  // Handler: Search Scene Point
  const handleSearchPoint = (locationId: string, pointId: string) => {
    setSearchingPointId(pointId);

    setTimeout(() => {
      let discoveredClueName = '';
      let newlyDiscoveredEvidence: Evidence | undefined;

      setCurrentCase((prev) => {
        let earnedPoints = 0;
        const updatedLocations = prev.locations.map((loc) => {
          if (loc.id !== locationId) return loc;
          return {
            ...loc,
            searchablePoints: loc.searchablePoints.map((pt) => {
              if (pt.id !== pointId) return pt;
              if (!pt.isSearched) {
                earnedPoints += 50;
              }
              return { ...pt, isSearched: true };
            }),
          };
        });

        // Find associated point
        const pt = prev.locations
          .find((l) => l.id === locationId)
          ?.searchablePoints.find((p) => p.id === pointId);

        // Unlock associated evidence
        const updatedEvidence = prev.evidence.map((ev) => {
          if (pt?.clueId === ev.id || (pt && ev.name.toLowerCase().includes(pt.name.toLowerCase()))) {
            if (!ev.isDiscovered) {
              earnedPoints += 50;
              discoveredClueName = ev.name;
              newlyDiscoveredEvidence = ev;
            }
            return { ...ev, isDiscovered: true };
          }
          return ev;
        });

        // Unlock timeline items if matched
        const updatedTimeline = prev.timeline.map((tl, i) => {
          if (i < 5) return { ...tl, isDiscovered: true };
          return tl;
        });

        const newLog = {
          id: `log_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action: 'Crime Scene Search',
          details: `Searched "${pt?.name}". ${discoveredClueName ? `Discovered: ${discoveredClueName}` : pt?.searchDetail || 'Forensic observations logged.'}`,
          type: 'clue' as const,
        };

        return {
          ...prev,
          locations: updatedLocations,
          evidence: updatedEvidence,
          timeline: updatedTimeline,
          score: Math.min(1000, prev.score + earnedPoints),
          investigationLogs: [newLog, ...prev.investigationLogs],
        };
      });

      sounds.playClueDiscovered();
      setSearchingPointId(null);
    }, 600);
  };

  // Handler: Interrogate Suspect
  const handleAskQuestion = async (suspectId: string, question: string, evidence?: Evidence) => {
    const suspect = currentCase.suspects.find((s) => s.id === suspectId);
    if (!suspect) return;

    setIsInterrogating(true);
    sounds.playTypewriterKey();

    const newDetectiveMsg = {
      sender: 'detective' as const,
      name: 'Detective',
      text: question,
      presentedEvidence: evidence ? evidence.name : undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setDialogueHistory((prev) => [...prev, newDetectiveMsg]);

    try {
      let data: any = null;
      try {
        const res = await fetch('/api/mystery/interview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            caseSummary: currentCase.briefing,
            suspect,
            culpritId: currentCase.culpritId,
            playerQuestion: question,
            presentedEvidence: evidence,
            interrogationHistory: dialogueHistory,
          }),
        });
        if (res.ok) {
          data = await res.json();
        }
      } catch (netErr) {
        // Fallback for static hosting
      }

      if (!data || !data.dialogue) {
        data = generateClientInterrogationResponse(
          suspect,
          suspect.id === currentCase.culpritId || suspect.isCulprit,
          question,
          evidence
        );
      }

      const responseText = data.dialogue || `"I've said everything I know, detective."`;

      const newSuspectMsg = {
        sender: 'suspect' as const,
        name: suspect.name,
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setDialogueHistory((prev) => [...prev, newSuspectMsg]);

      // Update suspect state & case
      setCurrentCase((prev) => {
        const updatedSuspects = prev.suspects.map((s) => {
          if (s.id !== suspectId) return s;

          const updatedStatements = [...s.statements];
          if (data.newStatement) {
            updatedStatements.push({
              id: `stmt_${suspectId}_${Date.now()}`,
              suspectId: s.id,
              suspectName: s.name,
              text: data.newStatement.text,
              topic: data.newStatement.topic || 'Interview Remark',
              timestamp: 'Interview',
              isLying: !!data.newStatement.isLying,
              isDiscovered: true,
            });
          } else {
            // Unlock all known statements for this suspect
            updatedStatements.forEach((stmt) => (stmt.isDiscovered = true));
          }

          const newSuspicion = Math.max(0, Math.min(100, s.suspicionLevel + (data.suspicionDelta || 5)));

          return {
            ...s,
            emotionalState: data.emotionalState || s.emotionalState,
            suspicionLevel: newSuspicion,
            interrogationCount: s.interrogationCount + 1,
            statements: updatedStatements,
          };
        });

        const newLog = {
          id: `log_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action: 'Suspect Interrogation',
          details: `Questioned ${suspect.name}. ${data.revealedInfo || `Emotional state changed to ${data.emotionalState || 'defensive'}.`}`,
          type: 'dialogue' as const,
        };

        return {
          ...prev,
          suspects: updatedSuspects,
          investigationLogs: [newLog, ...prev.investigationLogs],
        };
      });

      sounds.playTypewriterKey();
    } catch (e) {
      console.error('Interview error:', e);
    } finally {
      setIsInterrogating(false);
    }
  };

  // Handler: Compare Statements
  const handleCompareStatements = async (stmt1: SuspectStatement, stmt2: SuspectStatement) => {
    setIsComparing(true);
    try {
      let data: any = null;
      try {
        const res = await fetch('/api/mystery/compare-statements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            statement1: stmt1,
            statement2: stmt2,
            caseContext: currentCase.briefing,
            knownContradictions: currentCase.contradictions,
          }),
        });
        if (res.ok) {
          data = await res.json();
        }
      } catch (netErr) {
        // Fallback for static hosting
      }

      if (!data) {
        data = evaluateClientContradiction(stmt1, stmt2, currentCase);
      }

      setLastComparisonResult({
        isContradiction: data.isContradiction,
        analysis: data.analysis,
        points: data.pointsEarned || (data.isContradiction ? 150 : 0),
      });

      if (data.isContradiction) {
        sounds.playContradictionAlert();

        setCurrentCase((prev) => {
          const updatedContradictions = prev.contradictions.map((c) => {
            if (
              (c.statementId1 === stmt1.id && c.statementId2 === stmt2.id) ||
              (c.statementId1 === stmt2.id && c.statementId2 === stmt1.id)
            ) {
              return { ...c, isDiscovered: true };
            }
            return c;
          });

          // Also add new contradiction if dynamic
          if (!updatedContradictions.some((c) => c.isDiscovered)) {
            updatedContradictions.push({
              id: `contra_dyn_${Date.now()}`,
              statementId1: stmt1.id,
              statementId2: stmt2.id,
              suspect1Name: stmt1.suspectName,
              suspect2Name: stmt2.suspectName,
              explanation: data.analysis,
              importance: 'crucial',
              isDiscovered: true,
            });
          }

          const newLog = {
            id: `log_${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            action: 'Contradiction Uncovered',
            details: `Proved contradiction between ${stmt1.suspectName} and ${stmt2.suspectName}: ${data.analysis}`,
            type: 'contradiction' as const,
          };

          return {
            ...prev,
            contradictions: updatedContradictions,
            score: Math.min(1000, prev.score + (data.pointsEarned || 150)),
            investigationLogs: [newLog, ...prev.investigationLogs],
          };
        });
      }
    } catch (e) {
      console.error('Contradiction check failed:', e);
    } finally {
      setIsComparing(false);
    }
  };

  // Handler: Request Hint
  const handleRequestHint = async (level: number) => {
    setIsHintLoading(true);
    try {
      let data: AiHintResponse | null = null;
      try {
        const res = await fetch('/api/mystery/ai-detective-hint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hintLevel: level,
            currentCase,
            discoveredEvidenceIds: currentCase.evidence.filter((e) => e.isDiscovered).map((e) => e.id),
            discoveredTimelineIds: currentCase.timeline.filter((t) => t.isDiscovered).map((t) => t.id),
          }),
        });
        if (res.ok) {
          data = await res.json();
        }
      } catch (netErr) {
        // Fallback for static hosting
      }

      if (!data) {
        data = generateClientDetectiveHint(level, currentCase);
      }

      setActiveHint(data);

      setCurrentCase((prev) => ({
        ...prev,
        hintsUsed: prev.hintsUsed + 1,
        hintLevelReceived: Math.max(prev.hintLevelReceived, level),
        score: Math.max(0, prev.score - data!.penalty),
        investigationLogs: [
          {
            id: `log_${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            action: `Hint Level ${level} Consulted`,
            details: `Inspector Blake: "${data!.hintText}" (-${data!.penalty} pts)`,
            type: 'hint',
          },
          ...prev.investigationLogs,
        ],
      }));
    } catch (e) {
      console.error('Hint error:', e);
    } finally {
      setIsHintLoading(false);
    }
  };

  // Handler: Custom AI Assistant Question
  const handleCustomAssistantQuestion = async (query: string) => {
    setIsHintLoading(true);
    try {
      let data: AiHintResponse | null = null;
      try {
        const res = await fetch('/api/mystery/ai-detective-hint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hintLevel: 1,
            currentCase,
            customQuery: query,
          }),
        });
        if (res.ok) {
          data = await res.json();
        }
      } catch (netErr) {
        // Fallback for static hosting
      }

      if (!data) {
        data = generateClientDetectiveHint(1, currentCase, query);
      }

      setActiveHint(data);
    } catch (e) {
      console.error('Assistant error:', e);
    } finally {
      setIsHintLoading(false);
    }
  };

  // Handler: Submit Accusation
  const handleSubmitAccusation = async (culpritId: string, motive: string, evidenceIds: string[]) => {
    try {
      let result: AccusationResult | null = null;
      try {
        const res = await fetch('/api/mystery/evaluate-accusation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentCase,
            accusedSuspectId: culpritId,
            accusedMotive: motive,
            selectedEvidenceIds: evidenceIds,
            timeTakenSeconds: currentCase.timeLimitSeconds - currentCase.timeRemainingSeconds,
          }),
        });
        if (res.ok) {
          result = await res.json();
        }
      } catch (netErr) {
        // Fallback for static hosting
      }

      if (!result) {
        result = evaluateClientAccusation(currentCase, culpritId, motive, evidenceIds);
      }

      setCaseResult(result);
      setIsAccusationOpen(false);

      if (result.isCorrect) {
        sounds.playCaseSolved();
        setCurrentCase((prev) => ({
          ...prev,
          status: 'solved',
          score: result!.finalScore,
        }));
      } else {
        sounds.playWrongAccusation();
        setCurrentCase((prev) => ({
          ...prev,
          incorrectAccusations: prev.incorrectAccusations + 1,
          score: Math.max(0, prev.score - 100),
          investigationLogs: [
            {
              id: `log_${Date.now()}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              action: 'Accusation Rejected',
              details: `Confrontation failed. Evidence was deemed insufficient (-100 pts).`,
              type: 'accusation',
            },
            ...prev.investigationLogs,
          ],
        }));
      }
    } catch (e) {
      console.error('Accusation evaluation failed:', e);
    }
  };

  // If on title screen, render dramatic entrance
  if (gameStage === 'title') {
    return (
      <TitleScreen
        onStartNewCase={() => setIsNewCaseOpen(true)}
        onContinueCase={handleContinueCase}
        hasSavedCase={hasSavedCase}
        onStartDemoCase={handleLoadDemoCase}
        onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
      />
    );
  }

  const discoveredEvidence = currentCase.evidence.filter((e) => e.isDiscovered);
  const discoveredContradictions = currentCase.contradictions.filter((c) => c.isDiscovered);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-gray-300 flex flex-col font-sans selection:bg-amber-500/25 selection:text-amber-200">
      {/* Sticky Header */}
      <Header
        mystery={currentCase}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
        onOpenNewCase={() => setIsNewCaseOpen(true)}
        onOpenAccusation={() => setIsAccusationOpen(true)}
        onTimeExpired={handleTimeExpired}
        onUpdateTime={handleUpdateTime}
      />

      {/* Main 3-Column Detective Canvas */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-2.5 sm:p-3.5 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
        {/* Left Column: Suspects & Case Dossier (3 Cols) */}
        <section className="lg:col-span-3 h-[420px] lg:h-[calc(100vh-4.75rem)]">
          <CaseDossier
            mystery={currentCase}
            selectedSuspectId={selectedSuspectId}
            onSelectSuspect={(id) => setSelectedSuspectId(id)}
            onStartInterrogation={(id) => {
              setSelectedSuspectId(id);
              setActiveCenterTab('interrogate');
            }}
          />
        </section>

        {/* Center Column: Investigation Stage Tabs (6 Cols) */}
        <section className="lg:col-span-6 flex flex-col h-[650px] lg:h-[calc(100vh-4.75rem)] bg-[#121216]/95 border border-[#262632] rounded-xl overflow-hidden shadow-xl p-2.5 space-y-2.5">
          {/* Navigation Tab Bar */}
          <div className="flex items-center gap-1 p-1 bg-[#0a0a0e] border border-[#20202a] rounded-lg overflow-x-auto shrink-0">
            <button
              onClick={() => setActiveCenterTab('evidence')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all shrink-0 ${
                activeCenterTab === 'evidence'
                  ? 'bg-[#22222e] text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#181822]'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Evidence Vault ({discoveredEvidence.length})</span>
            </button>

            <button
              onClick={() => setActiveCenterTab('scene')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all shrink-0 ${
                activeCenterTab === 'scene'
                  ? 'bg-[#22222e] text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#181822]'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search Scene</span>
            </button>

            <button
              onClick={() => setActiveCenterTab('interrogate')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all shrink-0 ${
                activeCenterTab === 'interrogate'
                  ? 'bg-[#22222e] text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#181822]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Interrogate</span>
            </button>

            <button
              onClick={() => setActiveCenterTab('timeline')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all shrink-0 ${
                activeCenterTab === 'timeline'
                  ? 'bg-[#22222e] text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#181822]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Timeline</span>
            </button>

            <button
              onClick={() => setActiveCenterTab('contradictions')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all shrink-0 ${
                activeCenterTab === 'contradictions'
                  ? 'bg-[#22222e] text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#181822]'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Contradictions</span>
            </button>
          </div>

          {/* Active Tab View Body */}
          <div className="flex-1 overflow-hidden">
            {activeCenterTab === 'evidence' && (
              <EvidenceBoard
                evidenceList={currentCase.evidence}
                onSelectEvidenceForInspection={(ev) => setInspectingEvidence(ev)}
                onNavigateToInterrogationWithEvidence={(ev) => {
                  setInspectingEvidence(null);
                  setActiveCenterTab('interrogate');
                }}
              />
            )}

            {activeCenterTab === 'scene' && (
              <SceneInvestigation
                locations={currentCase.locations}
                onSearchPoint={handleSearchPoint}
                searchingPointId={searchingPointId}
              />
            )}

            {activeCenterTab === 'interrogate' && (
              <InterrogationRoom
                suspects={currentCase.suspects}
                selectedSuspectId={selectedSuspectId}
                onSelectSuspect={(id) => setSelectedSuspectId(id)}
                discoveredEvidence={discoveredEvidence}
                onAskQuestion={handleAskQuestion}
                isThinking={isInterrogating}
                dialogueHistory={dialogueHistory}
              />
            )}

            {activeCenterTab === 'timeline' && <TimelineView timeline={currentCase.timeline} />}

            {activeCenterTab === 'contradictions' && (
              <ContradictionMatrix
                suspects={currentCase.suspects}
                discoveredContradictions={discoveredContradictions}
                onCompareStatements={handleCompareStatements}
                isComparing={isComparing}
                lastComparisonResult={lastComparisonResult}
              />
            )}
          </div>
        </section>

        {/* Right Column: AI Assistant & Notes (3 Cols) */}
        <section className="lg:col-span-3 h-[450px] lg:h-[calc(100vh-4.75rem)]">
          <AiDetectiveAssistant
            mystery={currentCase}
            onRequestHint={handleRequestHint}
            onAskCustomAssistantQuestion={handleCustomAssistantQuestion}
            isHintLoading={isHintLoading}
            activeHint={activeHint}
            onUpdatePlayerNotes={(notes) => setCurrentCase((prev) => ({ ...prev, playerNotes: notes }))}
          />
        </section>
      </main>

      {/* Accusation Modal */}
      <AccusationModal
        isOpen={isAccusationOpen}
        onClose={() => setIsAccusationOpen(false)}
        mystery={currentCase}
        onSubmitAccusation={handleSubmitAccusation}
        isSubmitting={false}
      />

      {/* Case Result Modal */}
      {caseResult && (
        <CaseResultModal
          isOpen={!!caseResult}
          onClose={() => setCaseResult(null)}
          result={caseResult}
          mystery={currentCase}
          onPlayNewCase={() => {
            setCaseResult(null);
            setIsNewCaseOpen(true);
          }}
        />
      )}

      {/* Evidence Inspector Modal */}
      <EvidenceInspectorModal
        evidence={inspectingEvidence}
        onClose={() => setInspectingEvidence(null)}
        onPresentToSuspect={(ev) => {
          setInspectingEvidence(null);
          setActiveCenterTab('interrogate');
        }}
      />

      {/* New Case Creation Modal */}
      <NewCaseModal
        isOpen={isNewCaseOpen}
        onClose={() => setIsNewCaseOpen(false)}
        onCreateCase={handleCreateCase}
        onLoadDemoCase={handleLoadDemoCase}
        isGenerating={isGenerating}
      />

      {/* How To Play Modal */}
      <HowToPlayModal isOpen={isHowToPlayOpen} onClose={() => setIsHowToPlayOpen(false)} />
    </div>
  );
}
