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
          content: "Return only valid JSON. No markdown."
        },
        {
          role: "user",
          content: `
Situation: ${mood}
Meal type: ${mealType}
Preference: ${preference}
Hunger level: ${hungerLevel}
Cuisine: ${cuisine}

Return:
{
  "food": "meal name",
  "reason": "why this meal was chosen",
  "tags": ["tag1", "tag2", "tag3"]
}
`
        }
      ]
    });

    let text = response.choices[0].message.content;
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const recommendation = JSON.parse(text);

    return res.status(200).json(recommendation);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      food: "Recommendation failed",
      reason: "The system could not generate a recommendation. Check API key, credits, or Vercel logs.",
      tags: ["Error"]
    });
  }
};