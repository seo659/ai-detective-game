import { MysteryCase, Difficulty, CrimeType } from '../types';
import { DEMO_CASE } from '../data/demoCase';

// Helper to normalize Gemini response into full MysteryCase
export function normalizeGeneratedCase(raw: any, difficulty: Difficulty, timerMode: 'relaxed' | 'timed'): MysteryCase {
  const caseId = `case_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const culpritIdx = typeof raw.culpritIndex === 'number' ? raw.culpritIndex : 0;

  const colorPalette = [
    'bg-rose-900/60 border-rose-500',
    'bg-amber-900/60 border-amber-500',
    'bg-emerald-900/60 border-emerald-500',
    'bg-cyan-900/60 border-cyan-500',
    'bg-purple-900/60 border-purple-500',
    'bg-indigo-900/60 border-indigo-500',
  ];

  const iconPalette = ['User', 'Briefcase', 'Gem', 'Shield', 'Glasses', 'Feather'];

  const suspects = (raw.suspects || []).map((s: any, idx: number) => {
    const suspectId = `suspect_${idx}_${caseId}`;
    const isCulprit = idx === culpritIdx;
    return {
      id: suspectId,
      name: s.name || `Suspect ${idx + 1}`,
      occupation: s.occupation || 'Person of Interest',
      relationship: s.relationship || 'Associate',
      personality: s.personality || 'Guarded and observant',
      knownMotive: s.knownMotive || 'Financial or personal dispute',
      secret: s.secret || 'Hidden past connection',
      isCulprit,
      alibi: s.alibi || 'Claims to be elsewhere during the incident',
      suspicionLevel: s.initialSuspicion || (isCulprit ? 55 : 35),
      emotionalState: (s.emotionalState as any) || 'calm',
      avatarColor: colorPalette[idx % colorPalette.length],
      avatarIcon: iconPalette[idx % iconPalette.length],
      interrogationCount: 0,
      statements: (s.statements || []).map((stmt: any, sIdx: number) => ({
        id: `stmt_${suspectId}_${sIdx}`,
        suspectId,
        suspectName: s.name || `Suspect ${idx + 1}`,
        text: stmt.text || '',
        topic: stmt.topic || 'General Testimony',
        timestamp: stmt.timestamp || 'Incident Hour',
        isLying: typeof stmt.isLying === 'boolean' ? stmt.isLying : isCulprit,
        isDiscovered: sIdx === 0, // First statement discovered by default
      })),
    };
  });

  const culpritId = suspects[culpritIdx]?.id || suspects[0]?.id || 'suspect_0';

  const evidence = (raw.evidence || []).map((e: any, idx: number) => ({
    id: `clue_${idx}_${caseId}`,
    name: e.name || `Evidence #${idx + 1}`,
    description: e.description || '',
    location: e.location || 'Crime Scene',
    importance: (e.importance as any) || (e.isKeyEvidence ? 'strong' : 'weak'),
    status: (e.status as any) || 'confirmed',
    isDiscovered: idx === 0, // First evidence discovered initially
    details: e.details || '',
    category: (e.category as any) || 'physical',
  }));

  const keyEvidenceIds = evidence
    .filter((e: any, i: number) => (raw.evidence?.[i]?.isKeyEvidence || e.importance === 'strong'))
    .slice(0, 3)
    .map((e: any) => e.id);

  const timeline = (raw.timeline || []).map((t: any, idx: number) => ({
    id: `tl_${idx}_${caseId}`,
    time: t.time || `${7 + idx}:00 PM`,
    title: t.title || `Event #${idx + 1}`,
    description: t.description || '',
    isDiscovered: idx < 3, // Initial timeline discovered
    verified: typeof t.verified === 'boolean' ? t.verified : true,
  }));

  const locations = (raw.locations || []).map((loc: any, lIdx: number) => ({
    id: `loc_${lIdx}_${caseId}`,
    name: loc.name || `Location ${lIdx + 1}`,
    description: loc.description || '',
    searchablePoints: (loc.searchablePoints || []).map((pt: any, ptIdx: number) => {
      // link to evidence if matches name
      const matchedEv = evidence.find((ev: any) =>
        pt.associatedEvidenceName && ev.name.toLowerCase().includes(pt.associatedEvidenceName.toLowerCase())
      );
      return {
        id: `pt_${lIdx}_${ptIdx}_${caseId}`,
        name: pt.name || 'Inspection Point',
        description: pt.description || '',
        clueId: matchedEv?.id || (evidence[lIdx * 2 + ptIdx]?.id),
        isSearched: lIdx === 0 && ptIdx === 0,
        searchDetail: pt.searchDetail || 'You uncover forensic traces.',
      };
    }),
  }));

  const contradictions = (raw.contradictions || []).map((c: any, cIdx: number) => {
    // try to match statements
    const s1 = suspects.find((s: any) => s.name.toLowerCase().includes(c.suspect1Name?.toLowerCase() || ''));
    const s2 = suspects.find((s: any) => s.name.toLowerCase().includes(c.suspect2Name?.toLowerCase() || ''));
    const stmt1 = s1?.statements?.[0]?.id || `stmt_mock_1_${cIdx}`;
    const stmt2 = s2?.statements?.[0]?.id || `stmt_mock_2_${cIdx}`;

    return {
      id: `contra_${cIdx}_${caseId}`,
      statementId1: stmt1,
      statementId2: stmt2,
      suspect1Name: c.suspect1Name || 'Suspect A',
      suspect2Name: c.suspect2Name || 'Suspect B',
      explanation: c.explanation || 'Statements are mutually contradictory regarding timing.',
      importance: (c.importance as any) || 'crucial',
      isDiscovered: false,
    };
  });

  const timeLimits: Record<Difficulty, number> = {
    easy: 1200, // 20 mins
    medium: 900, // 15 mins
    hard: 600, // 10 mins
    expert: 450, // 7.5 mins
  };

  return {
    id: caseId,
    title: raw.title || 'The Unsolved Enigma',
    crime: raw.crime || 'A mysterious occurrence requiring immediate investigation.',
    crimeType: (raw.crimeType as any) || 'Theft',
    location: raw.location || 'The Estate',
    date: raw.date || 'Present Day',
    victim: raw.victim || 'Unknown Individual',
    briefing: raw.briefing || 'Review the case details, interview all suspects, and discover the truth.',
    difficulty,
    timerMode,
    timeLimitSeconds: timeLimits[difficulty] || 900,
    timeRemainingSeconds: timeLimits[difficulty] || 900,
    culpritId,
    culpritMotive: raw.culpritMotive || 'Financial gain and concealing past crimes.',
    culpritMethod: raw.culpritMethod || 'Carefully orchestrated deception during a distraction.',
    keyEvidenceIds: keyEvidenceIds.length > 0 ? keyEvidenceIds : [evidence[0]?.id],
    fullSolutionStory: raw.fullSolutionStory || 'The culprit executed the crime by manipulating the timeline.',
    suspects,
    evidence,
    timeline,
    locations,
    contradictions,
    hintsUsed: 0,
    hintLevelReceived: 0,
    incorrectAccusations: 0,
    investigationLogs: [
      {
        id: `log_init_${Date.now()}`,
        timestamp: '00:00',
        action: 'Investigation Commenced',
        details: `Case opened: ${raw.title}. Preliminary crime scene secured.`,
        type: 'note',
      },
    ],
    playerNotes: '',
    score: 500,
    status: 'active',
    createdAt: new Date().toISOString(),
  };
}

// Procedural Case Generator for Instant Generation without Network / API Delay
export function generateProceduralMystery(
  difficulty: Difficulty,
  crimeType: CrimeType,
  timerMode: 'relaxed' | 'timed',
  customLocation?: string
): MysteryCase {
  const caseThemes: Record<string, any> = {
    'Art Heist': {
      title: 'The Stolen Renaissance Masterpiece',
      crime: 'Theft of "The Veiled Duchess" (Valued at $22,000,000) from the Louvre Wing',
      location: customLocation || 'The Grand Hall of Antiquities, Paris',
      victim: 'Countess Helene Delacroix (Curator & Philanthropist)',
      briefing:
        'At 11:30 PM, the gallery laser grid was bypassed for exactly 90 seconds. When guards arrived, the frame was empty and replaced with a laser-cut canvas replica. The culprit is still inside the sealed compound.',
      culpritMotive:
        'Fearing imminent audit of the gallery restoration funds, the restorer planned to sell the real masterpiece on the black market to cover millions in embezzled assets.',
      culpritMethod:
        'Used a specialized frequency scrambler hidden in a pocket watch to blind the motion sensors, removed the painting with a suction-handled glass cutter, and hid the canvas inside the hollow pedestal of the Venus statue.',
      fullSolutionStory:
        'Julian Mercer, the master restorer, orchestrated the heist. Having mapped the laser grid during last month’s refitting, he brought a miniature harmonic jammer disguised as his pocket chronometer. During the 11:30 shift change, he disabled the sensor node, extracted the canvas, and stashed the linen roll inside the Venus pedestal. His gloves bore microscopic traces of zinc-white oil paint used exclusively on Renaissance restorations.',
      suspects: [
        {
          name: 'Julian Mercer',
          occupation: 'Senior Art Conservator & Restorer',
          relationship: 'Curator’s Chief Specialist',
          personality: 'Calm, academic, meticulous with tools, obsessed with pigment preservation.',
          knownMotive: 'Under investigation for financial discrepancies in the restoration budget.',
          secret: 'Had a concealed buyer lined up in Zurich with $15M in bearer bonds.',
          alibi: 'Claims he was in the chemical darkroom testing solvent pH levels.',
          initialSuspicion: 50,
          emotionalState: 'calm',
          statements: [
            { text: 'I was in the basement lab developing photographic plates of the 16th-century varnish from 11:15 until midnight.', topic: 'Alibi', timestamp: '11:30 PM', isLying: true },
            { text: 'The security laser grid has a backup lithium battery. It cannot be disabled from outside the main vault terminal.', topic: 'Security Grid', timestamp: 'Technical Note', isLying: false },
          ],
        },
        {
          name: 'Captain Henri Moreau',
          occupation: 'Head of Night Security',
          relationship: 'Head of Private Security Force',
          personality: 'Gruff, defensive, strict disciplinarian, under immense pressure.',
          knownMotive: 'Massive personal debts to underground gambling parlors.',
          secret: 'Fell asleep at the monitor desk for 10 minutes between 11:20 and 11:30 PM.',
          alibi: 'Claims he was conducting physical perimeter rounds on Level 2.',
          initialSuspicion: 40,
          emotionalState: 'defensive',
          statements: [
            { text: 'My patrol log shows I was on the north colonnade at 11:30 PM sharp. You can check the radio pings.', topic: 'Patrol Alibi', timestamp: '11:30 PM', isLying: false },
            { text: 'I saw Julian Mercer walking toward the basement with a heavy brass instrument case at 11:10 PM.', topic: 'Regarding Mercer', timestamp: '11:10 PM', isLying: false },
          ],
        },
        {
          name: 'Vivienne Fontaine',
          occupation: 'Private Collector & Heiress',
          relationship: 'High-Bidder at the Museum Gala',
          personality: 'Flamboyant, imperious, disdainful of museum bureaucracy.',
          knownMotive: 'Was outbid on the Duchess painting three years ago and swore she would own it.',
          secret: 'Hired an undercover appraiser to evaluate the museum’s fire escape vulnerabilities.',
          alibi: 'Claims she was dining on the rooftop restaurant with the Countess until 11:45 PM.',
          initialSuspicion: 55,
          emotionalState: 'arrogant',
          statements: [
            { text: 'I don’t steal art, darling, I buy it. I was sipping Champagne on the glass terrace in full view of twenty patrons.', topic: 'Alibi', timestamp: '11:30 PM', isLying: false },
            { text: 'I noticed the glass vitrine on the Duchess was unlocked when we toured at 9:00 PM.', topic: 'Observation', timestamp: '9:00 PM', isLying: false },
          ],
        },
        {
          name: 'Sloan Cross',
          occupation: 'Electrician & Systems Contractor',
          relationship: 'Security System Installer',
          personality: 'Nervous, easily intimidated, speaks in technical jargon.',
          knownMotive: 'Terminated by the Countess last week without severance pay.',
          secret: 'Sold the blueprint schematics of the sensor grid to an anonymous buyer online.',
          alibi: 'Claims he was off-duty at a cafe down the avenue.',
          initialSuspicion: 45,
          emotionalState: 'nervous',
          statements: [
            { text: 'I was at the Bistro Saint-Germain having espresso. The receipt timestamp is 11:35 PM.', topic: 'Alibi', timestamp: '11:35 PM', isLying: false },
            { text: 'The laser grid cannot be jammed unless someone plugged an override oscillator into the local repeater box in Room 4.', topic: 'Grid Override', timestamp: 'Technical Fact', isLying: false },
          ],
        },
      ],
      evidence: [
        {
          name: 'Miniature Harmonic Jammer Disguised as Pocket Watch',
          description: 'A customized gold chronometer containing battery-powered microwave emitter circuits configured to 433 MHz.',
          location: 'Restoration Lab Coat Pocket',
          importance: 'strong',
          status: 'confirmed',
          category: 'digital',
          details: 'Matches the exact frequency used by the museum laser grid repeaters.',
          isKeyEvidence: true,
        },
        {
          name: 'Zinc-White Pigment Smear on Velvet Gloves',
          description: 'Microscopic paint dust adhering to a pair of black suede gloves found in the disposal chute.',
          location: 'Waste Chute near Room 4',
          importance: 'strong',
          status: 'confirmed',
          category: 'forensic',
          details: 'Pigment analysis matches the exact 19th-century restoration touch-up mix used on The Veiled Duchess.',
          isKeyEvidence: true,
        },
        {
          name: 'Bistro Cafe Timestamped Receipt',
          description: 'A paper receipt from Cafe Saint-Germain stamped 11:35 PM for two espressos.',
          location: 'Sloan Cross’s Jacket',
          importance: 'weak',
          status: 'confirmed',
          category: 'document',
          details: 'Corroborates Sloan Cross’s alibi.',
          isKeyEvidence: false,
        },
        {
          name: 'Anonymous Bank Transfer Telegram',
          description: 'A draft showing a pending transfer of 200,000 francs to an offshore account in Monaco.',
          location: 'Security Captain’s Locker',
          importance: 'red_herring',
          status: 'uncertain',
          category: 'document',
          details: 'Related to gambling debts, but unrelated to the physical removal of the painting.',
          isKeyEvidence: false,
        },
        {
          name: 'Empty Frame with Precision Cut Margins',
          description: 'The gilded frame left on the wall, showing razor-smooth incisions along the canvas perimeter.',
          location: 'Central Gallery Wall',
          importance: 'strong',
          status: 'confirmed',
          category: 'physical',
          details: 'Requires professional conservator scalpel precision.',
          isKeyEvidence: true,
        },
      ],
      timeline: [
        { time: '9:00 PM', title: 'Museum Gala Commences', description: 'Guests tour the Renaissance Gallery under heavy surveillance.', verified: true },
        { time: '11:15 PM', title: 'Julian Mercer Enters Basement', description: 'Mercer seen carrying a heavy instrumentation case.', verified: true },
        { time: '11:28 PM', title: 'Laser Grid Blinks Offline', description: 'Zone 4 laser grid disabled for 90 seconds without alarm trigger.', verified: true },
        { time: '11:30 PM', title: 'Duchess Removed from Frame', description: 'Canvas extracted and frame abandoned.', verified: true },
        { time: '11:40 PM', title: 'Guard Patrol Discovers Empty Frame', description: 'Museum lockdown initiated.', verified: true },
      ],
      locations: [
        {
          name: 'The Renaissance Wing (Room 4)',
          description: 'Marble gallery with classic masterworks and the centerpiece gilded frame.',
          searchablePoints: [
            { name: 'Gilded Frame Plinth', description: 'Inspect the severed mounting wires and canvas residue.', searchDetail: 'The canvas was sliced with a surgical diamond-edge scalpel.' },
            { name: 'Zone 4 Repeater Panel', description: 'Check the wall socket behind the marble pillar.', searchDetail: 'You spot copper clip scratches where a harmonic jammer was temporarily attached.' },
          ],
        },
        {
          name: 'Conservator’s Laboratory',
          description: 'A chemical workroom filled with microscopes, drying racks, and solvent bottles.',
          searchablePoints: [
            { name: 'Mercer’s Lab Coat', description: 'Examine the pockets and lapels.', searchDetail: 'Inside the breast pocket is the gold pocket watch with miniature electronic circuitry.' },
            { name: 'Chemical Fume Hood', description: 'Search the drying solvents.', searchDetail: 'Traces of fresh zinc-white pigment dust match the glove residues.' },
          ],
        },
      ],
      contradictions: [
        {
          suspect1Name: 'Julian Mercer',
          suspect2Name: 'Sloan Cross',
          statement1Excerpt: 'The security laser grid cannot be disabled from outside the main vault terminal.',
          statement2Excerpt: 'The laser grid can be jammed if an override oscillator is plugged into the Room 4 repeater.',
          explanation: 'Mercer falsely claimed the grid could only be touched at the vault to obscure his use of the repeater plug in Room 4.',
          importance: 'crucial',
        },
      ],
    },
    default: {
      title: 'The Blackwood Manor Mystery',
      crime: 'Grand Larceny of a Flawless 120-Carat Blue Sapphire',
      location: customLocation || 'Blackwood Manor, Yorkshire',
      victim: 'Lord Reginald Harrington',
      briefing: 'A priceless sapphire vanished from a locked vitrine during an 8:45 PM thunderstorm blackout. 5 guests were present.',
      culpritMotive: 'Marcus Drake faced bankruptcy and replaced the gem with a synthetic glass replica.',
      culpritMethod: 'Used a wax duplicate key during the scheduled power blackout caused by paraffin wax on the fuse relay.',
      fullSolutionStory: 'Marcus Drake duplicated the Chubb safe key, triggered the power outage, and swapped the stone.',
    },
  };

  const raw = caseThemes[crimeType] || caseThemes['Art Heist'] || caseThemes.default;
  return normalizeGeneratedCase(raw, difficulty, timerMode);
}

// Main API wrapper
export async function createNewMysteryCase(
  difficulty: Difficulty,
  crimeType: CrimeType,
  timerMode: 'relaxed' | 'timed',
  customLocation?: string,
  suspectCount: number = 5
): Promise<MysteryCase> {
  try {
    const res = await fetch('/api/mystery/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ difficulty, crimeType, locationSetting: customLocation, suspectCount }),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    if (data.success && data.caseData) {
      return normalizeGeneratedCase(data.caseData, difficulty, timerMode);
    }
  } catch (err) {
    console.warn('Falling back to local procedural case generation:', err);
  }

  // Fallback to procedural generation
  return generateProceduralMystery(difficulty, crimeType, timerMode, customLocation);
}
