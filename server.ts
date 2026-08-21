import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize GoogleGenAI
const getAi = () => {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", hasApiKey: !!process.env.GEMINI_API_KEY });
});

// 1. Generate a new mystery case
app.post("/api/mystery/generate", async (req, res) => {
  try {
    const { difficulty = "medium", crimeType = "Theft", locationSetting, suspectCount = 5 } = req.body;
    const ai = getAi();

    if (!ai) {
      return res.status(200).json({
        fallback: true,
        message: "Gemini API key not configured. Using high-fidelity procedural generation.",
      });
    }

    const prompt = `Generate a rich, cohesive, fully playable detective mystery case.
Parameters:
- Difficulty: ${difficulty} (affects complexity of clues, alibis, and red herrings)
- Crime Type: ${crimeType}
- Location / Setting: ${locationSetting || "An atmospheric mystery setting (e.g. vintage luxury express train, secluded clifftop manor, elite botanical observatory, high-stakes auction gallery)"}
- Number of Suspects: ${suspectCount}

CRITICAL RULES FOR THE MYSTERY:
1. One single suspect is the true culprit. Their identity, motive, and exact method must be determined now and CANNOT change.
2. Every suspect must have a distinct name, occupation, relationship to the victim, personality, known motive, secret, an alibi, and 2-3 statements they can make.
3. Generate 6-8 distinct evidence items (mix of 'strong', 'weak', and 'red_herring' clues).
4. Generate 4-6 chronological timeline events (some verified, some needing confirmation).
5. Generate 3-4 interactive location scenes (each with 2 searchable points of interest).
6. Generate 2 distinct contradictions between suspect statements that the detective can spot.
7. Provide a comprehensive full solution story explaining the crime from start to finish.

Return the JSON matching the exact schema provided.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            crime: { type: Type.STRING },
            crimeType: { type: Type.STRING },
            location: { type: Type.STRING },
            date: { type: Type.STRING },
            victim: { type: Type.STRING },
            briefing: { type: Type.STRING },
            culpritIndex: { type: Type.INTEGER, description: "0-indexed index of the true culprit among suspects" },
            culpritMotive: { type: Type.STRING },
            culpritMethod: { type: Type.STRING },
            fullSolutionStory: { type: Type.STRING },
            suspects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  occupation: { type: Type.STRING },
                  relationship: { type: Type.STRING },
                  personality: { type: Type.STRING },
                  knownMotive: { type: Type.STRING },
                  secret: { type: Type.STRING },
                  alibi: { type: Type.STRING },
                  initialSuspicion: { type: Type.INTEGER },
                  emotionalState: { type: Type.STRING },
                  statements: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        text: { type: Type.STRING },
                        topic: { type: Type.STRING },
                        timestamp: { type: Type.STRING },
                        isLying: { type: Type.BOOLEAN },
                      },
                      required: ["text", "topic", "timestamp", "isLying"],
                    },
                  },
                },
                required: ["name", "occupation", "relationship", "personality", "knownMotive", "secret", "alibi", "initialSuspicion", "emotionalState", "statements"],
              },
            },
            evidence: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  location: { type: Type.STRING },
                  importance: { type: Type.STRING },
                  status: { type: Type.STRING },
                  category: { type: Type.STRING },
                  details: { type: Type.STRING },
                  isKeyEvidence: { type: Type.BOOLEAN },
                },
                required: ["name", "description", "location", "importance", "status", "category", "details", "isKeyEvidence"],
              },
            },
            timeline: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  verified: { type: Type.BOOLEAN },
                },
                required: ["time", "title", "description", "verified"],
              },
            },
            locations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  searchablePoints: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        searchDetail: { type: Type.STRING },
                        associatedEvidenceName: { type: Type.STRING },
                      },
                      required: ["name", "description", "searchDetail"],
                    },
                  },
                },
                required: ["name", "description", "searchablePoints"],
              },
            },
            contradictions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  suspect1Name: { type: Type.STRING },
                  suspect2Name: { type: Type.STRING },
                  statement1Excerpt: { type: Type.STRING },
                  statement2Excerpt: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  importance: { type: Type.STRING },
                },
                required: ["suspect1Name", "suspect2Name", "statement1Excerpt", "statement2Excerpt", "explanation", "importance"],
              },
            },
          },
          required: [
            "title", "crime", "crimeType", "location", "date", "victim", "briefing",
            "culpritIndex", "culpritMotive", "culpritMethod", "fullSolutionStory",
            "suspects", "evidence", "timeline", "locations", "contradictions"
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ success: true, caseData: parsed });
  } catch (error: any) {
    console.error("Error generating mystery:", error);
    res.status(500).json({ error: error.message || "Failed to generate mystery case." });
  }
});

// 2. Suspect Interrogation Dialogue
app.post("/api/mystery/interview", async (req, res) => {
  try {
    const {
      caseSummary,
      suspect,
      culpritId,
      playerQuestion,
      presentedEvidence,
      interrogationHistory = [],
    } = req.body;

    const ai = getAi();
    const isCulprit = suspect.id === culpritId || suspect.isCulprit;

    if (!ai) {
      // High quality procedural dialogue fallback
      const responses = [
        `"Detective, I've told you everything I remember. When the commotion occurred, I was exactly where I said I was. If you doubt me, check the room logs."`,
        `"Look at my hands, Detective. Do they shake? I have nothing to hide. But if I were you, I would take a closer look at what the others were doing around that time."`,
        `"That's a rather provocative accusation. You think you have me figured out, but you are grasping at shadows without hard proof."`,
        `"I must admit, the tension tonight was unbearable. But I swear on my honor, I did not commit this crime."`,
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      return res.json({
        dialogue: randomResponse,
        emotionalState: isCulprit ? "defensive" : "calm",
        suspicionDelta: presentedEvidence ? (isCulprit ? 15 : -5) : 0,
        revealedInfo: presentedEvidence ? `Reacted noticeably when presented with ${presentedEvidence.name}.` : null,
      });
    }

    const systemPrompt = `You are playing the role of ${suspect.name} in an atmospheric noir mystery game.
SUSPECT DOSSIER:
- Name: ${suspect.name}
- Occupation: ${suspect.occupation}
- Relationship to Victim: ${suspect.relationship}
- Personality: ${suspect.personality}
- Known Motive: ${suspect.knownMotive}
- Secret: ${suspect.secret}
- Is Actual Culprit: ${isCulprit ? "YES (Guilty! Must guard secrets cleverly, lie about direct culpability, but may slip or become defensive under pressure)" : "NO (Innocent of the main crime, but may have personal secrets or motives to hide)"}
- Alibi: ${suspect.alibi}
- Current Emotional State: ${suspect.emotionalState || "calm"}

CASE CONTEXT:
${caseSummary}

RULES FOR YOUR RESPONSE:
1. Speak strictly in-character as ${suspect.name}.
2. Do NOT immediately confess or announce you are the culprit.
3. If presented with damning evidence (${presentedEvidence ? presentedEvidence.name + ": " + presentedEvidence.description : "None"}), react realistically: get flustered, offer an excuse, deflect to another suspect, or reveal a partial secret.
4. Keep the dialogue concise (2-4 sentences max), punchy, and atmospheric.
5. Provide the response formatted in JSON with:
   - "dialogue": The suspect's spoken response (in quotes).
   - "emotionalState": Updated state ("calm", "nervous", "defensive", "arrogant", "panicked").
   - "suspicionDelta": Number between -10 and +20 reflecting how suspicious their reaction was.
   - "revealedClue": Optional text snippet if they inadvertently mention a detail, or null.
   - "newStatement": Optional new statement object { text, topic, timestamp, isLying } if they make a formal on-the-record claim.`;

    const contents = `Player Question: "${playerQuestion}"
Presented Evidence: ${presentedEvidence ? `${presentedEvidence.name} (${presentedEvidence.description})` : "None"}
Previous Exchange Count: ${interrogationHistory.length}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Error in suspect interview:", error);
    res.status(500).json({ error: error.message || "Interrogation failed." });
  }
});

// 3. Compare Statements (Contradiction Analyzer)
app.post("/api/mystery/compare-statements", async (req, res) => {
  try {
    const { statement1, statement2, caseContext, knownContradictions = [] } = req.body;
    const ai = getAi();

    // Check if directly matched in case pre-built contradictions
    const directMatch = knownContradictions.find(
      (c: any) =>
        (c.statementId1 === statement1.id && c.statementId2 === statement2.id) ||
        (c.statementId1 === statement2.id && c.statementId2 === statement1.id)
    );

    if (directMatch) {
      return res.json({
        isContradiction: true,
        matchedContradictionId: directMatch.id,
        analysis: directMatch.explanation,
        credibilityImpact: [
          { suspectId: statement1.suspectId, delta: statement1.isLying ? 25 : 0 },
          { suspectId: statement2.suspectId, delta: statement2.isLying ? 25 : 0 },
        ],
        pointsEarned: 150,
      });
    }

    if (!ai) {
      return res.json({
        isContradiction: false,
        analysis: `No direct logical contradiction found between "${statement1.suspectName}" and "${statement2.suspectName}". Their statements appear compatible or unverified.`,
        credibilityImpact: [],
        pointsEarned: 0,
      });
    }

    const prompt = `You are the master logic engine for a detective game.
Analyze the following two statements from suspects:

Statement 1 (${statement1.suspectName}):
"${statement1.text}" (Topic: ${statement1.topic}, Time: ${statement1.timestamp})

Statement 2 (${statement2.suspectName}):
"${statement2.text}" (Topic: ${statement2.topic}, Time: ${statement2.timestamp})

Case Context:
${caseContext}

Determine if there is a genuine logical, chronological, or factual contradiction between these statements.
Respond in JSON:
{
  "isContradiction": boolean,
  "analysis": "Detailed explanation of why these statements contradict or why they are consistent.",
  "importance": "crucial" | "supporting" | "none",
  "pointsEarned": number (e.g. 150 if true contradiction, 0 if not)
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Error comparing statements:", error);
    res.status(500).json({ error: error.message || "Failed to compare statements." });
  }
});

// 4. AI Detective Assistant Hints
app.post("/api/mystery/ai-detective-hint", async (req, res) => {
  try {
    const { hintLevel, currentCase, discoveredEvidenceIds = [], discoveredTimelineIds = [] } = req.body;
    const ai = getAi();

    const penaltyMap: Record<number, number> = { 1: 30, 2: 75, 3: 150 };
    const penalty = penaltyMap[hintLevel] || 50;

    if (!ai) {
      const fallbackHints: Record<number, { title: string; hintText: string; suggestedAction: string }> = {
        1: {
          title: "Check Alibis & Time Gaps",
          hintText: "Inspect the exact timeline during the blackout or critical incident window. Someone's stated location does not match physical access paths.",
          suggestedAction: "Interview the suspects about their whereabouts during the blackout.",
        },
        2: {
          title: "Focus on Physical Inconsistencies",
          hintText: "Look into the access routes and lock mechanisms. A duplicate key or unlatched portal was required for entry without triggering alarms.",
          suggestedAction: "Search guest rooms and transit corridors for tools or damp articles.",
        },
        3: {
          title: "Critical Contradiction Lead",
          hintText: "Examine external communications. A suspect claiming to be on an urgent telephone call is contradicted by the switchboard outage logs.",
          suggestedAction: "Compare the telecom logs with the business partner's statements and prepare your final accusation.",
        },
      };

      const hint = fallbackHints[hintLevel] || fallbackHints[1];
      return res.json({
        hintLevel,
        title: hint.title,
        hintText: hint.hintText,
        suggestedAction: hint.suggestedAction,
        penalty,
      });
    }

    const prompt = `You are Inspector Blake, a sharp veteran detective advisor in an AI mystery game.
CASE DETAILS:
- Title: ${currentCase.title}
- Crime: ${currentCase.crime}
- True Culprit: ${currentCase.suspects.find((s: any) => s.id === currentCase.culpritId)?.name || "Classified"}
- Culprit Motive: ${currentCase.culpritMotive}
- Culprit Method: ${currentCase.culpritMethod}
- Discovered Evidence Count: ${discoveredEvidenceIds.length} of ${currentCase.evidence.length}

HINT REQUEST LEVEL: Level ${hintLevel}
- Level 1: Very subtle observation or nudge towards an unexamined area/suspect.
- Level 2: Specific inconsistency or lead to investigate (e.g. comparing two people's timelines).
- Level 3: Strong pointer toward the key contradiction or physical evidence linking the culprit, but still framed as deductive advice.

Respond in JSON:
{
  "hintLevel": ${hintLevel},
  "title": "Short catchy detective hint title",
  "hintText": "Atmospheric advice written in Inspector Blake's voice",
  "suggestedAction": "Concrete next step recommendation",
  "penalty": ${penalty}
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const parsed = JSON.parse(response.text || "{}");
    parsed.penalty = penalty;
    res.json(parsed);
  } catch (error: any) {
    console.error("Error giving hint:", error);
    res.status(500).json({ error: error.message || "Failed to generate hint." });
  }
});

// 5. Evaluate Accusation
app.post("/api/mystery/evaluate-accusation", async (req, res) => {
  try {
    const {
      currentCase,
      accusedSuspectId,
      accusedMotive,
      selectedEvidenceIds = [],
      timeTakenSeconds = 0,
    } = req.body;

    const ai = getAi();
    const isCulpritCorrect = accusedSuspectId === currentCase.culpritId;
    const accusedSuspect = currentCase.suspects.find((s: any) => s.id === accusedSuspectId);
    const actualCulprit = currentCase.suspects.find((s: any) => s.id === currentCase.culpritId);

    // Calculate evidence matching
    const keyEvidenceIds = currentCase.keyEvidenceIds || [];
    const matchedKeyEvidence = selectedEvidenceIds.filter((id: string) => keyEvidenceIds.includes(id));
    const evidenceMatchCount = matchedKeyEvidence.length;
    const totalKeyEvidence = Math.max(1, keyEvidenceIds.length);

    if (!ai) {
      if (isCulpritCorrect) {
        const finalScore = Math.max(200, 1000 - (currentCase.hintsUsed * 50) - (currentCase.incorrectAccusations * 100));
        let rank = "Master Detective";
        if (finalScore >= 900) rank = "Legendary Detective";
        else if (finalScore >= 750) rank = "Master Detective";
        else if (finalScore >= 500) rank = "Skilled Investigator";
        else rank = "Rookie Detective";

        return res.json({
          isCorrect: true,
          culpritCorrect: true,
          motiveAccuracyScore: 90,
          evidenceMatchCount,
          totalKeyEvidence,
          scoreAwarded: 500,
          finalScore,
          rank,
          storyResolution: `With unshakeable logic, you cornered ${accusedSuspect.name}. Faced with the undeniable forensic trail, their composure shattered and they confessed to the crime.`,
          truthExplanation: currentCase.fullSolutionStory,
          feedback: "Flawless deduction. The timeline and evidence left no room for doubt.",
          redHerringsExplained: [
            { name: "Arthur's Burned Document", explanation: "Arthur sought to burn his father's will revision, but had no part in stealing the jewel." },
            { name: "Evelyn's Black Velvet Bag", explanation: "Standard gemological inspection tools, entirely innocent." },
          ],
        });
      } else {
        return res.json({
          isCorrect: false,
          culpritCorrect: false,
          motiveAccuracyScore: 30,
          evidenceMatchCount,
          totalKeyEvidence,
          scoreAwarded: -100,
          finalScore: Math.max(0, currentCase.score - 100),
          rank: "Needs More Evidence",
          storyResolution: `You confronted ${accusedSuspect?.name || "the suspect"}, but their legal counsel immediately tore through your assertions. Key discrepancies in your theory remain unresolved.`,
          truthExplanation: "The real culprit remains at large. Review the physical timeline and cross-examine suspect alibis.",
          feedback: "The evidence presented does not definitively prove this suspect's guilt. The investigation must continue.",
          redHerringsExplained: [],
        });
      }
    }

    const prompt = `You are evaluating the final accusation in an AI mystery game.
CASE CONTEXT:
- Case Title: ${currentCase.title}
- Actual Culprit: ${actualCulprit?.name} (${actualCulprit?.occupation})
- Actual Culprit Motive: ${currentCase.culpritMotive}
- Actual Culprit Method: ${currentCase.culpritMethod}
- Full Truth: ${currentCase.fullSolutionStory}
- Key Evidence Required: ${keyEvidenceIds.join(", ")}

PLAYER'S ACCUSATION:
- Accused Suspect: ${accusedSuspect?.name} (${accusedSuspect?.occupation})
- Accused Suspect ID: ${accusedSuspectId}
- Player's Claimed Motive: "${accusedMotive}"
- Selected Evidence IDs: ${selectedEvidenceIds.join(", ")}
- Matched Key Evidence Count: ${evidenceMatchCount} of ${totalKeyEvidence}
- Correct Culprit Picked: ${isCulpritCorrect ? "YES" : "NO"}

Evaluate the accusation.
If Correct (isCulpritCorrect is true):
- Provide a cinematic noir resolution where the detective exposes the culprit and the culprit confesses.
- Grade motive accuracy (0-100).
- Calculate score and rank (900-1000: Legendary Detective, 750-899: Master Detective, 500-749: Skilled Investigator, 250-499: Rookie Detective).

If Incorrect (isCulpritCorrect is false):
- Provide a dramatic scene where the accused presents an ironclad counter-argument or alibi, proving the detective made a mistake.
- Explain why the evidence was insufficient without giving away the real culprit's name.

Respond in JSON:
{
  "isCorrect": ${isCulpritCorrect},
  "culpritCorrect": ${isCulpritCorrect},
  "motiveAccuracyScore": number,
  "evidenceMatchCount": ${evidenceMatchCount},
  "totalKeyEvidence": ${totalKeyEvidence},
  "scoreAwarded": number,
  "finalScore": number,
  "rank": "Legendary Detective" | "Master Detective" | "Skilled Investigator" | "Rookie Detective" | "Needs More Evidence",
  "storyResolution": "Cinematic dramatic narrative passage",
  "truthExplanation": "Full explanation of the true events (only reveal full truth if isCorrect is true; if false, give constructive guidance)",
  "feedback": "Evaluation feedback on evidence strength and logic",
  "redHerringsExplained": [
    { "name": "Red Herring Item Name", "explanation": "Why this seemed suspicious but was innocent" }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Error evaluating accusation:", error);
    res.status(500).json({ error: error.message || "Failed to evaluate accusation." });
  }
});

// Vite middleware configuration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`The AI Detective server running on http://localhost:${PORT}`);
  });
}

startServer();
