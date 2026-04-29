const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      food: "Invalid request",
      reason: "Only POST requests allowed.",
      tags: ["Error"]
    });
  }

  try {
    const {
      mood,
      mealType,
      preference,
      hungerLevel,
      cuisine
    } = req.body;

    // Add randomness so recommendations change
    const randomSeed = Math.floor(Math.random() * 100000);

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",

      temperature: 0.9,

      messages: [
        {
          role: "system",
          content:
            "You are a helpful food recommendation assistant. Always return only valid JSON. No markdown."
        },
        {
          role: "user",
          content: `
Random variation seed: ${randomSeed}

User situation: ${mood}
Meal type: ${mealType}
Special preference: ${preference}
Hunger level: ${hungerLevel}
Cuisine preference: ${cuisine}

Give ONE meal recommendation.

Make the choice feel logical and personalized.

Avoid repeating the same meals across requests.

Return ONLY this JSON format:

{
  "food": "meal name",
  "reason": "clear explanation why this meal fits the user's situation",
  "tags": ["tag1", "tag2", "tag3"]
}
`
        }
      ]
    });

    // Extract AI text
    let text = response.choices[0].message.content;

    // Remove markdown if AI adds it
    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let recommendation;

    try {
      recommendation = JSON.parse(text);
    } catch (parseError) {
      console.error("JSON parse error:", text);

      recommendation = {
        food: "Chef's Surprise Bowl",
        reason:
          "We generated a fallback meal because the AI response format was unexpected.",
        tags: ["Fallback", "Quick", "Reliable"]
      };
    }

    return res.status(200).json(recommendation);

  } catch (error) {
    console.error("Server error:", error);

    return res.status(500).json({
      food: "Recommendation failed",
      reason:
        "Something went wrong generating your meal. Try again shortly.",
      tags: ["Error"]
    });
  }
};