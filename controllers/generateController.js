const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateItinerary = async (req, res) => {
  const { destination, days, people, budget, travelStyle } = req.body;

  const prompt = `
  Create a detailed JSON travel itinerary:
  Destination: ${destination}
  Days: ${days}
  People: ${people}
  Budget: ${budget}
  Style: ${travelStyle}

  Return ONLY valid JSON.
  `;

  // 1. TRY GEMINI
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return res.json(parsed);
  } catch (err) {
    console.log("Gemini failed →", err.status || err.message);
  }

  //  2. TRY HUGGING FACE
  try {
    const hfRes = await axios.post(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct",
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
        },
      }
    );

    return res.json({ data: hfRes.data });
  } catch (err) {
    console.log("HuggingFace failed");
  }

  //  3. TRY GROQ
  try {
    const groqRes = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.json({
      data: groqRes.data.choices[0].message.content,
    });
  } catch (err) {
    console.log("Groq failed");
  }

  //  FINAL FALLBACK 
return res.json({
  destination,
  days,
  people,
  budget,
  travelStyle,
  itinerary: Array.from({ length: Number(days) || 3 }, (_, i) => ({
    day: i + 1,
    title: `Day ${i + 1} - Exploring ${destination}`,
    morning: `Start your day with a refreshing breakfast at a local café and visit a popular attraction in ${destination}. Enjoy sightseeing and take photos.`,
    afternoon: `Head to a cultural or historical spot such as a museum or landmark. Explore nearby markets and try some street shopping.`,
    evening: `Relax at a scenic viewpoint or park. Enjoy sunset views followed by exploring local nightlife or entertainment areas.`,
    food: `Try local cuisine such as regional specialties, street food, and dine at a well-rated restaurant.`,
    tips: `Carry water, wear comfortable shoes, and keep some cash handy. Plan your transport in advance.`
  })),
  generalTips: `Plan your trip in advance, keep digital and physical copies of important documents, and always stay aware of your surroundings. Respect local culture and customs while traveling in ${destination}.`,
  estimatedBudget: {
    accommodation: budget === "luxury" ? "₹8,000 - ₹15,000 per night" :
                   budget === "moderate" ? "₹3,000 - ₹7,000 per night" :
                   "₹1,000 - ₹3,000 per night",
    food: budget === "luxury" ? "₹2,000 - ₹4,000 per day" :
          budget === "moderate" ? "₹800 - ₹2,000 per day" :
          "₹300 - ₹800 per day",
    transport: "₹200 - ₹1,000 per day",
    activities: "₹500 - ₹2,000 per day",
    totalEstimate: budget === "luxury"
      ? `₹${days * 12000} - ₹${days * 20000}`
      : budget === "moderate"
      ? `₹${days * 5000} - ₹${days * 9000}`
      : `₹${days * 2000} - ₹${days * 4000}`
  }
});
};

module.exports = { generateItinerary };