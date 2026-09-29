
require("dotenv").config();
console.log("Loaded Claude Key Length:", process.env.ANTHROPIC_API_KEY.length);
console.log(
  "Last Character Code:",
  process.env.ANTHROPIC_API_KEY.charCodeAt(
    process.env.ANTHROPIC_API_KEY.length - 1,
  ),
);
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Anthropic = require("@anthropic-ai/sdk");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Existing auth route (unchanged)
app.use("/api/auth", require("./routes/auth"));

// ✅ Anthropic client (safe on backend)
const anthropic = new Anthropic({
  // The ? prevents crashes if undefined, and trim() removes invisible \r characters or spaces
  apiKey: process.env.ANTHROPIC_API_KEY?.trim(),
});

const SYSTEM_PROMPT = `You are an expert travel guide and trip planning assistant for TourPlanner app. Help users plan amazing trips with:
- Day-by-day itineraries with time slots
- Detailed budget breakdowns
- Must-see attractions and hidden gems  
- Best local restaurants, cafes and food spots
- Transportation tips and costs
- Accommodation options by budget
- Safety tips and travel advice
- Local customs and cultural tips
Format responses clearly with emojis, use bullet points, and be enthusiastic and friendly. Keep responses concise but complete.`;

// ✅ NEW: Claude chat route
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array required" });
    }

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001", // ✅ Stable recommended model
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: messages,
    });

    res.json({
      reply: response.content[0].text,
    });
  } catch (error) {
    console.error("Claude Error:", error);
    res.status(500).json({
      error: "Claude request failed",
    });
  }
});

// ✅ Root route (unchanged)
app.get("/", (_, res) => res.json({ message: "TourPlanner API Running ✈️" }));

// ✅ Mongo connection (unchanged)
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server on :${process.env.PORT || 5000}`),
    );
  })
  .catch(console.error);
