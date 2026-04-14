const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const extractJSON = (text) => {
  try {
    const match = text.match(/\{[\s\S]*\}/); // extract first JSON block
    if (!match) return null;

    return JSON.parse(match[0]);
  } catch (err) {
    console.log("JSON parse failed");
    return null;
  }
};

const generateItinerary = async (req, res) => {
  const { destination, days, people, budget, travelStyle } = req.body;

 const prompt = `
  Return ONLY valid JSON. No explanation.

  {
    "destination": "",
    "days": number,
    "people": number,
    "budget": "",
    "travelStyle": "",
    "hotels": [
      {
        "name": "",
        "type": "Budget/Mid-range/Luxury",
        "priceRange": "",
        "description": "",
        "highlights": ""
      }
    ],
    "itinerary": [
      {
        "day": 1,
        "title": "",
        "morning": "",
        "afternoon": "",
        "evening": "",
        "food": "",
        "tips": "",
        "placesToVisit": [
          {
            "name": "",
            "type": "",
            "description": "",
            "bestTime": "",
            "entryFee": ""
          }
        ]
      }
    ],
    "generalTips": "",
    "estimatedBudget": {
      "accommodation": "",
      "food": "",
      "transport": "",
      "activities": "",
      "totalEstimate": ""
    }
  }

  Destination: ${destination}
  Days: ${days}
  People: ${people}
  Budget: ${budget}
  Style: ${travelStyle}

  Return ONLY JSON.
`

//groq ai
try {
  console.log("Trying Groq...");

  const groqRes = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "mixtral-8x7b-32768" ,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  const text = groqRes.data.choices[0].message.content;

  console.log("Groq RAW:", text);

  const parsed = extractJSON(text);

  if (parsed) {
    console.log(" Groq SUCCESS");
    return res.json(parsed);
  }

} catch (err) {
  console.log(" Groq failed:", err.response?.data || err.message);
}

// gemini ai

 try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
console.log("Gemini RAW:", text);

const parsed = extractJSON(text);

if (parsed) {
  console.log(" Gemini SUCCESS");
  return res.json(parsed);
}

    if (parsed) return res.json(parsed);
  } catch (err) {
    console.log("Gemini failed");
  }
  return res.json({
  destination,
  days,
  people,
  budget,
  travelStyle,

  hotels: [
    {
      name: `${destination} Budget Stay`,
      type: "Budget",
      priceRange: "₹1,000 - ₹2,500 per night",
      description: `Affordable and comfortable stay option in ${destination} with basic amenities, ideal for budget travelers.`,
      highlights: "Free WiFi, Good Location, Clean Rooms"
    },
    {
      name: `${destination} Comfort Hotel`,
      type: "Mid-range",
      priceRange: "₹3,000 - ₹6,000 per night",
      description: `Well-rated mid-range hotel in ${destination} offering great service, modern amenities, and convenient access to attractions.`,
      highlights: "Breakfast Included, AC Rooms, Central Location"
    },
    {
      name: `${destination} Luxury Resort`,
      type: "Luxury",
      priceRange: "₹8,000 - ₹15,000 per night",
      description: `Premium luxury resort in ${destination} offering world-class facilities, scenic views, and top-notch hospitality.`,
      highlights: "Pool, Spa, Fine Dining, Scenic Views"
    }
  ],

  itinerary: Array.from({ length: Number(days) || 3 }, (_, i) => ({
    day: i + 1,
    title: `Day ${i + 1} - Exploring ${destination}`,

    morning: `Start your day with a delicious breakfast and visit a popular attraction in ${destination}. Explore landmarks, take photos, and enjoy the local vibe.`,

    afternoon: `Visit cultural or historical places such as museums, forts, or local markets. Enjoy shopping and experience the local lifestyle of ${destination}.`,

    evening: `Relax at a scenic location like a beach, park, or viewpoint. Enjoy sunset views followed by exploring nightlife or cafes in ${destination}.`,

    food: `Try local cuisine of ${destination}, including popular street food, traditional dishes, and dine at a highly rated restaurant.`,

    tips: `Carry water, wear comfortable shoes, and plan your day in advance. Use local transport or ride apps for convenience.`,

    placesToVisit: [
      {
        name: `${destination} Main Attraction`,
        type: "Tourist Spot",
        description: `One of the most famous attractions in ${destination}, known for its beauty and popularity among tourists.`,
        bestTime: "Morning",
        entryFee: "₹100 - ₹500"
      },
      {
        name: `${destination} Cultural Spot`,
        type: "Historical",
        description: `A place showcasing the culture and heritage of ${destination}. Ideal for learning and exploration.`,
        bestTime: "Afternoon",
        entryFee: "₹50 - ₹200"
      },
      {
        name: `${destination} Scenic Viewpoint`,
        type: "Nature",
        description: `Perfect spot to relax and enjoy scenic beauty, especially during sunset.`,
        bestTime: "Evening",
        entryFee: "Free"
      }
    ]
  })),

  generalTips: `Plan your trip in advance, keep digital and physical copies of important documents, and respect local culture. Always stay aware of your surroundings while traveling in ${destination}. Try local food and interact with locals for a better experience.`,

  estimatedBudget: {
    accommodation:
      budget === "luxury"
        ? "₹8,000 - ₹15,000 per night"
        : budget === "moderate"
        ? "₹3,000 - ₹7,000 per night"
        : "₹1,000 - ₹3,000 per night",

    food:
      budget === "luxury"
        ? "₹2,000 - ₹4,000 per day"
        : budget === "moderate"
        ? "₹800 - ₹2,000 per day"
        : "₹300 - ₹800 per day",

    transport: "₹200 - ₹1,000 per day",
    activities: "₹500 - ₹2,000 per day",

    totalEstimate:
      budget === "luxury"
        ? `₹${days * 12000} - ₹${days * 20000}`
        : budget === "moderate"
        ? `₹${days * 5000} - ₹${days * 9000}`
        : `₹${days * 2000} - ₹${days * 4000}`
  }
});

};

module.exports = { generateItinerary };
