/**
 * Room Sense Live — Server
 * Static files + Config API + Master Analysis endpoint
 */

import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MASTER_ANALYSIS_MODEL = 'gemini-2.5-flash-preview-05-20';

if (!GEMINI_API_KEY) {
    console.error('ERROR: GEMINI_API_KEY environment variable is required');
    process.exit(1);
}

const app = express();
app.use(express.json({ limit: '50kb' }));
app.use(express.static(join(__dirname, 'public')));

// Config endpoint
app.get('/api/config', (req, res) => {
    res.json({
        apiKey: GEMINI_API_KEY,
        model: 'gemini-2.5-flash-native-audio-preview-12-2025'
    });
});

// Master Analysis endpoint
app.post('/api/analyze', async (req, res) => {
    const { set } = req.body;
    if (!set || typeof set !== 'string') {
        return res.status(400).json({ error: 'Set text is required' });
    }

    const prompt = `You are the Lead Analyst for Room Sense Live. Analyze this comedy set and return structured JSON.

RETURN JSON ONLY. NO MARKDOWN.

=== ANALYSIS STRUCTURE ===

1. **PREMISE AUDIT** — Stated vs hidden premise, competing angles
2. **STRUCTURAL DIAGNOSIS** — Subject → Premise → Setup → Punch per bit
3. **EFFICIENCY SCAN** — Fat trimming, list detection, throat-clearing
4. **PERFORMANCE NOTES** — Emotional POV, rhythm flags, laugh-stepping
5. **DEVELOPMENT OPTIONS** — Alternative angles, cut vs develop, callbacks

=== OUTPUT FORMAT ===
{
  "title": "[Inferred set title]",
  "core_premise": "One sentence: What is this set actually about?",
  "stats": {
    "estimated_runtime": "X:XX",
    "laugh_density": "X laughs per minute (target: 4-5)",
    "structural_health": "X/10"
  },
  "sections": [
    {
      "id": "section-id",
      "title": "SECTION TITLE",
      "items": [
        { "label": "Item Label", "text": "Analysis text" }
      ]
    }
  ]
}

=== THE SET ===
${set}`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${MASTER_ANALYSIS_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 4096,
                        responseMimeType: 'application/json'
                    }
                })
            }
        );

        const data = await response.json();
        if (data.error) {
            return res.status(500).json({ error: data.error.message || 'Analysis failed' });
        }

        const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!analysisText) {
            return res.status(500).json({ error: 'No analysis generated' });
        }

        try {
            const analysis = JSON.parse(analysisText);
            res.json({ analysis });
        } catch {
            res.json({ analysis: { raw: analysisText } });
        }
    } catch (e) {
        console.error('Analysis error:', e);
        res.status(500).json({ error: 'Failed to analyze set' });
    }
});

const server = createServer(app);

server.listen(PORT, () => {
    console.log(`[Room Sense Live] Running at http://localhost:${PORT}`);
});
