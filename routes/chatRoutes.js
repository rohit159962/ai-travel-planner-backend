const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const prompt = `
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

User input: ${message}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    let text = response.text();

    // 
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("Invalid JSON:", text);
      return res.status(500).json({ error: "Invalid AI response" });
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI failed" });
  }
});

module.exports = router;