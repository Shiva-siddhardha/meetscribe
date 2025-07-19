const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/', async (req, res) => {
  const { transcript, speaker } = req.body;
  try {
    let prompt;
    if (speaker) {
      // Single speaker summary
      prompt = `You are a meeting assistant. Summarize the following transcript for the speaker ${speaker} into concise bullet points, and highlight any important action items or decisions.\n\nTranscript:\n${transcript}\n\nReturn strictly in JSON format like:\n{\n  \"summary\": [\n    \"summary point 1\",\n    \"summary point 2\",\n    \"action item 1\",\n    \"decision 1\"\n  ]\n}`;
    } else {
      // All speakers: per-speaker and overall summary
      prompt = `You are a meeting assistant. Summarize the following meeting transcript. For each speaker, provide a brief summary of what they said. Then, provide an overall meeting summary.\n\nTranscript:\n${transcript}\n\nReturn strictly in JSON format like:\n{\n  \"per_speaker\": {\n    \"User_A\": \"summary for User_A\",\n    \"User_B\": \"summary for User_B\"\n  },\n  \"overall_summary\": \"overall meeting summary\"\n}`;
    }
    console.log(process.env.GEMINI_API_KEY)
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    let result = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    result = result.replace(/```json|```/g, "").trim();
    let parsed = {};
    try {
      parsed = JSON.parse(result);
    } catch (e) {
      // fallback: return as single summary if not JSON
      if (speaker) {
        parsed.summary = [result];
      } else {
        parsed.per_speaker = {};
        parsed.overall_summary = result;
      }
    }
    if (speaker) {
      res.json({ summary: parsed.summary });
    } else {
      res.json({ per_speaker: parsed.per_speaker, overall_summary: parsed.overall_summary });
    }
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

module.exports = router; 