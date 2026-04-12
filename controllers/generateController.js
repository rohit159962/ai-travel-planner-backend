const { GoogleGenerativeAI } = require('@google/generative-ai')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const generateItinerary = async (req, res) => {
  try {
    const { destination, days, people, budget, travelStyle } = req.body

    if (!destination || !days || !people || !budget || !travelStyle) {
      return res.status(400).json({ message: 'All fields are required!' })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `
      You are an expert travel planner. Generate a detailed day-by-day travel itinerary based on the following details:

      - Destination: ${destination}
      - Number of Days: ${days}
      - Number of People: ${people}
      - Budget: ${budget}
      - Travel Style: ${travelStyle}

      Please respond in the following JSON format only, no extra text:
      {
        "destination": "city, country",
        "days": number,
        "budget": "budget level",
        "travelStyle": "style",
        "people": number,
        "itinerary": [
          {
            "day": 1,
            "title": "Day title",
            "morning": "Morning activity description",
            "afternoon": "Afternoon activity description",
            "evening": "Evening activity description",
            "food": "Food recommendations for the day",
            "tips": "Useful tips for the day"
          }
        ],
        "generalTips": "Overall travel tips for this trip",
        "estimatedBudget": "Estimated budget breakdown"
      }
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    const cleaned = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)

    res.status(200).json(parsed)

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to generate itinerary!' })
  }
}

module.exports = { generateItinerary }