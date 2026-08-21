export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export type CrimeType =
  | 'Theft'
  | 'Murder Mystery'
  | 'Kidnapping'
  | 'Art Heist'
  | 'Corporate Espionage'
  | 'Museum Mystery'
  | 'Mansion Mystery';

export type ClueImportance = 'strong' | 'weak' | 'red_herring';

export interface SuspectStatement {
  id: string;
  suspectId: string;
  suspectName: string;
  text: string;
  topic: string;
  timestamp: string;
  isLying?: boolean;
  isDiscovered: boolean;
}

export interface Suspect {
  id: string;
  name: string;
  occupation: string;
  relationship: string;
  personality: string;
  knownMotive: string;
  secret: string;
  isCulprit: boolean;
  alibi: string;
  suspicionLevel: number; // 0 - 100
  emotionalState: 'calm' | 'nervous' | 'defensive' | 'arrogant' | 'panicked';
  avatarColor: string;
  avatarIcon: string;
  statements: SuspectStatement[];
  interrogationCount: number;
}

export interface Evidence {
  id: string;
  name: string;
  description: string;
  location: string;
  importance: ClueImportance;
  status: 'confirmed' | 'uncertain';
  isDiscovered: boolean;
  details: string;
  category: 'physical' | 'document' | 'forensic' | 'digital' | 'testimony';
}

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  suspectId?: string;
  suspectName?: string;
  isDiscovered: boolean;
  isContradicted?: boolean;
  verified: boolean;
}

export interface SearchablePoint {
  id: string;
  name: string;
  description: string;
  clueId?: string;
  isSearched: boolean;
  searchDetail: string;
}

export interface LocationScene {
  id: string;
  name: string;
  description: string;
  searchablePoints: SearchablePoint[];
}

export interface Contradiction {
  id: string;
  statementId1: string;
  statementId2: string;
  suspect1Name: string;
  suspect2Name: string;
  explanation: string;
  importance: 'crucial' | 'supporting';
  isDiscovered: boolean;
}

export interface InvestigationLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  type: 'dialogue' | 'clue' | 'timeline' | 'contradiction' | 'hint' | 'accusation' | 'note';
}

export interface MysteryCase {
  id: string;
  title: string;
  crime: string;
  crimeType: CrimeType;
  location: string;
  date: string;
  victim: string;
  briefing: string;
  difficulty: Difficulty;
  timerMode: 'relaxed' | 'timed';
  timeLimitSeconds: number;
  timeRemainingSeconds: number;
  culpritId: string;
  culpritMotive: string;
  culpritMethod: string;
  keyEvidenceIds: string[];
  fullSolutionStory: string;
  suspects: Suspect[];
  evidence: Evidence[];
  timeline: TimelineEvent[];
  locations: LocationScene[];
  contradictions: Contradiction[];
  hintsUsed: number;
  hintLevelReceived: number; // 0, 1, 2, 3
  incorrectAccusations: number;
  investigationLogs: InvestigationLog[];
  playerNotes: string;
  score: number;
  status: 'active' | 'solved' | 'failed';
  createdAt: string;
}

export interface AccusationResult {
  isCorrect: boolean;
  culpritCorrect: boolean;
  motiveAccuracyScore: number; // 0 - 100
  evidenceMatchCount: number;
  totalKeyEvidence: number;
  scoreAwarded: number;
  finalScore: number;
  rank: string;
  storyResolution: string;
  truthExplanation: string;
  feedback: string;
  timelineReconstruction: TimelineEvent[];
  redHerringsExplained: { name: string; explanation: string }[];
}

export interface AiHintResponse {
  hintLevel: number;
  title: string;
  hintText: string;
  suggestedAction: string;
  penalty: number;
}

export interface CompareStatementsResult {
  isContradiction: boolean;
  matchedContradictionId?: string;
  analysis: string;
  credibilityImpact: { suspectId: string; delta: number }[];
  revealedClueId?: string;
  pointsEarned: number;
}
