const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  try {
    const { mood, mealType, preference, hungerLevel, cuisine } = req.body;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a food recommendation tool. Return only valid JSON."
        },
        {
          role: "user",
          content: `
User situation: ${mood}
Meal type: ${mealType}
Preference: ${preference}
Hunger level: ${hungerLevel}
Cuisine: ${cuisine}

Recommend one meal.

Return only JSON:
{
  "food": "meal name",
  "reason": "why this meal was chosen based on the user's answers",
  "tags": ["tag1", "tag2", "tag3"]
}
`
        }
      ]
    });

    const text = response.choices[0].message.content;
    const recommendation = JSON.parse(text);

    return res.status(200).json(recommendation);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      food: "Recommendation failed",
      reason: "The system could not generate a recommendation. Check API key, credits, or server logs.",
      tags: ["Error"]
    });
  }
};