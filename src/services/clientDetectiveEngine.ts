import { MysteryCase, Suspect, SuspectStatement, Evidence, AccusationResult, AiHintResponse } from '../types';

/**
 * Client-Side Detective Engine
 * Powers static deployments (e.g. Firebase Hosting) when server-side API endpoints are unavailable.
 */

// 1. Client-Side Suspect Interrogation
export function generateClientInterrogationResponse(
  suspect: Suspect,
  isCulprit: boolean,
  playerQuestion: string,
  presentedEvidence?: Evidence
): {
  dialogue: string;
  emotionalState: 'calm' | 'nervous' | 'defensive' | 'arrogant' | 'panicked';
  suspicionDelta: number;
  revealedInfo: string | null;
  newStatement?: { text: string; topic: string; timestamp: string; isLying: boolean };
} {
  const qLower = playerQuestion.toLowerCase();

  // If evidence presented
  if (presentedEvidence) {
    const evName = presentedEvidence.name.toLowerCase();
    if (isCulprit) {
      return {
        dialogue: `"Where did you get that?! That ${presentedEvidence.name}... look, Detective, things aren't as simple as they look. I was only trying to protect myself!"`,
        emotionalState: 'panicked',
        suspicionDelta: 20,
        revealedInfo: `Culprit reacted with visible panic upon seeing ${presentedEvidence.name}.`,
        newStatement: {
          text: `I admit I handled ${presentedEvidence.name}, but it was strictly circumstantial!`,
          topic: `Reaction to ${presentedEvidence.name}`,
          timestamp: 'Interrogation',
          isLying: true,
        },
      };
    } else {
      return {
        dialogue: `"That's ${presentedEvidence.name}. I'm familiar with it, but I have no reason to hide anything regarding its whereabouts. Have you checked the others?"`,
        emotionalState: 'defensive',
        suspicionDelta: -5,
        revealedInfo: `${suspect.name} examined ${presentedEvidence.name} calmly and denied personal involvement.`,
      };
    }
  }

  // Question topic heuristics
  if (qLower.includes('alibi') || qLower.includes('where were you') || qLower.includes('time') || qLower.includes('blackout')) {
    if (isCulprit) {
      return {
        dialogue: `"As I already stated, I was in my quarters when the incident occurred. Any suggestion that I left before the power was restored is completely unfounded."`,
        emotionalState: 'nervous',
        suspicionDelta: 10,
        revealedInfo: `Claimed to be in quarters, but glanced anxiously when timeline was mentioned.`,
      };
    } else {
      return {
        dialogue: `"I was exactly where my statement indicates. I have nothing to hide from the authorities."`,
        emotionalState: 'calm',
        suspicionDelta: 0,
        revealedInfo: `Confirmed alibi details without hesitation.`,
      };
    }
  }

  if (qLower.includes('motive') || qLower.includes('money') || qLower.includes('why') || qLower.includes('secret') || qLower.includes('steal') || qLower.includes('kill')) {
    if (isCulprit) {
      return {
        dialogue: `"Everyone in this house had their grievances! Why single me out when fortunes were on the line for all of us?"`,
        emotionalState: 'defensive',
        suspicionDelta: 15,
        revealedInfo: `Became defensive regarding financial motives.`,
      };
    } else {
      return {
        dialogue: `"I won't deny tensions were high, but I would never stoop to committing a felony."`,
        emotionalState: 'calm',
        suspicionDelta: -5,
        revealedInfo: `Dismissed motive with measured tone.`,
      };
    }
  }

  // General fallback
  const genericResponses = isCulprit
    ? [
        `"Detective, you're grasping at straws. If you have solid proof, present it; otherwise stop wasting my time."`,
        `"I've answered enough questions for one evening. My memory is clear and my conscience is clean."`,
        `"You think you're clever, but there are angles to this situation you clearly haven't considered."`,
      ]
    : [
        `"I want the truth uncovered just as much as you do, Detective. Let me know if there are specific facts you need verified."`,
        `"I noticed unusual movements near the corridor earlier, but I cannot say with certainty who it was."`,
        `"I am cooperating fully with the inquiry. Please inspect whatever you need."`,
      ];

  const dialogue = genericResponses[Math.floor(Math.random() * genericResponses.length)];
  return {
    dialogue,
    emotionalState: isCulprit ? 'nervous' : 'calm',
    suspicionDelta: isCulprit ? 5 : 0,
    revealedInfo: `Interrogated on general inquiry.`,
  };
}

// 2. Client-Side Contradiction Evaluator
export function evaluateClientContradiction(
  stmt1: SuspectStatement,
  stmt2: SuspectStatement,
  currentCase: MysteryCase
): {
  isContradiction: boolean;
  analysis: string;
  importance: 'crucial' | 'supporting' | 'none';
  pointsEarned: number;
} {
  // Check known contradictions
  const matched = currentCase.contradictions.find(
    (c) =>
      (c.statementId1 === stmt1.id && c.statementId2 === stmt2.id) ||
      (c.statementId1 === stmt2.id && c.statementId2 === stmt1.id) ||
      (stmt1.suspectName.toLowerCase().includes(c.suspect1Name.toLowerCase()) &&
        stmt2.suspectName.toLowerCase().includes(c.suspect2Name.toLowerCase())) ||
      (stmt1.suspectName.toLowerCase().includes(c.suspect2Name.toLowerCase()) &&
        stmt2.suspectName.toLowerCase().includes(c.suspect1Name.toLowerCase()))
  );

  if (matched) {
    return {
      isContradiction: true,
      analysis: matched.explanation,
      importance: matched.importance,
      pointsEarned: 150,
    };
  }

  // If one is lying and topics conflict
  if (stmt1.isLying !== stmt2.isLying && stmt1.topic.toLowerCase() === stmt2.topic.toLowerCase()) {
    return {
      isContradiction: true,
      analysis: `Discrepancy detected: ${stmt1.suspectName}'s account on "${stmt1.topic}" directly conflicts with ${stmt2.suspectName}'s statement. One of them is falsifying their testimony.`,
      importance: 'crucial',
      pointsEarned: 150,
    };
  }

  return {
    isContradiction: false,
    analysis: `Statements by ${stmt1.suspectName} and ${stmt2.suspectName} do not show a direct physical or chronological contradiction.`,
    importance: 'none',
    pointsEarned: 0,
  };
}

// 3. Client-Side AI Detective Assistant Hints
export function generateClientDetectiveHint(
  hintLevel: number,
  currentCase: MysteryCase,
  customQuery?: string
): AiHintResponse {
  const penaltyMap: Record<number, number> = { 1: 30, 2: 75, 3: 150 };
  const penalty = penaltyMap[hintLevel] || 50;

  const culprit = currentCase.suspects.find((s) => s.id === currentCase.culpritId);

  if (customQuery) {
    return {
      hintLevel,
      title: 'Deductive Guidance',
      hintText: `Review the physical evidence gathered at the crime scene and compare suspect alibis against the timeline around the critical incident hour.`,
      suggestedAction: 'Cross-examine suspect statements in the Contradiction Matrix.',
      penalty,
    };
  }

  if (hintLevel === 1) {
    return {
      hintLevel: 1,
      title: 'Analyze Time Gaps & Routes',
      hintText: `Examine the verified timeline events closely. Notice which suspect lacked an ironclad witness during the exact window when the crime occurred.`,
      suggestedAction: 'Search the scene locations for physical tools or forensic residue.',
      penalty: 30,
    };
  } else if (hintLevel === 2) {
    return {
      hintLevel: 2,
      title: 'Follow the Method & Means',
      hintText: `Bypassing the security required specific technical means (${currentCase.culpritMethod.substring(0, 70)}...). Match this method to the suspect with corresponding access.`,
      suggestedAction: 'Present key evidence to the most suspicious individuals.',
      penalty: 75,
    };
  } else {
    return {
      hintLevel: 3,
      title: 'Crucial Lead on the True Culprit',
      hintText: `All forensic indicators point toward ${culprit?.name || 'the prime suspect'}. Their motive involves: ${currentCase.culpritMotive.substring(0, 90)}...`,
      suggestedAction: 'Collect the key evidence pieces and initiate the Court of Accusation.',
      penalty: 150,
    };
  }
}

// 4. Client-Side Accusation Evaluation
export function evaluateClientAccusation(
  currentCase: MysteryCase,
  accusedSuspectId: string,
  accusedMotive: string,
  selectedEvidenceIds: string[]
): AccusationResult {
  const isCulpritCorrect = accusedSuspectId === currentCase.culpritId;
  const accusedSuspect = currentCase.suspects.find((s) => s.id === accusedSuspectId);
  const actualCulprit = currentCase.suspects.find((s) => s.id === currentCase.culpritId);

  const keyEvidenceIds = currentCase.keyEvidenceIds || [];
  const matchedKeyEvidence = selectedEvidenceIds.filter((id) => keyEvidenceIds.includes(id));
  const evidenceMatchCount = matchedKeyEvidence.length;
  const totalKeyEvidence = Math.max(1, keyEvidenceIds.length);

  if (isCulpritCorrect) {
    const baseScore = 1000;
    const hintDeductions = currentCase.hintsUsed * 50;
    const attemptDeductions = currentCase.incorrectAccusations * 100;
    const finalScore = Math.max(250, baseScore - hintDeductions - attemptDeductions);

    let rank = 'Master Detective';
    if (finalScore >= 900) rank = 'Legendary Detective';
    else if (finalScore >= 750) rank = 'Master Detective';
    else if (finalScore >= 500) rank = 'Skilled Investigator';
    else rank = 'Rookie Detective';

    return {
      isCorrect: true,
      culpritCorrect: true,
      motiveAccuracyScore: 92,
      evidenceMatchCount,
      totalKeyEvidence,
      scoreAwarded: 500,
      finalScore,
      rank,
      storyResolution: `With flawless deduction and indisputable proof, you cornered ${accusedSuspect?.name}. Faced with the forensic evidence and the collapsed alibi, their resistance broke down and they confessed to the crime.`,
      truthExplanation: currentCase.fullSolutionStory,
      feedback: `Outstanding deduction! You correctly identified ${accusedSuspect?.name} and provided corroborating evidence linking them to the crime.`,
      timelineReconstruction: currentCase.timeline,
      redHerringsExplained: [
        {
          name: 'Secondary Suspicious Activities',
          explanation: 'Other suspects harbored private secrets and personal disputes, but had no involvement in executing the primary crime.',
        },
      ],
    };
  } else {
    return {
      isCorrect: false,
      culpritCorrect: false,
      motiveAccuracyScore: 30,
      evidenceMatchCount,
      totalKeyEvidence,
      scoreAwarded: -100,
      finalScore: Math.max(0, currentCase.score - 100),
      rank: 'Needs More Evidence',
      storyResolution: `You confronted ${accusedSuspect?.name || 'the suspect'}, but their defense held firm. Critical gaps in your timeline and physical evidence allowed them to refute your accusation.`,
      truthExplanation: 'The true culprit remains undetected. Re-examine the crime scene evidence and cross-reference suspect testimonies.',
      feedback: 'The presented evidence is insufficient to secure a conviction against this suspect. Continue the investigation.',
      timelineReconstruction: currentCase.timeline,
      redHerringsExplained: [],
    };
  }
}
