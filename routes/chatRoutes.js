import express from "express";
import OpenAI from "openai";

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are a travel planner AI.
Return ONLY JSON in this format:

{
  "destination": "",
  "days": "",
  "budget": "",
  "itinerary": [
    { "day": 1, "plan": "" }
  ],
  "hotels": [],
  "places": [],
  "tips": []
}
          `,
        },
        { role: "user", content: message },
      ],
    });

    const data = JSON.parse(completion.choices[0].message.content);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "AI failed" });
  }
});

export default router;