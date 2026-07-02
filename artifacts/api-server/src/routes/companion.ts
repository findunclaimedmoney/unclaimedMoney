import { Router } from "express";
import { db, companionSessionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

const PERSONAS = [
  {
    id: "mia",
    name: "Mia",
    gender: "female",
    tagline: "Warm, empathetic, and deeply curious about you",
    description: "Mia is a compassionate listener who remembers what matters to you. She speaks with warmth, asks thoughtful questions, and makes you feel genuinely heard.",
    voiceId: process.env["ELEVENLABS_VOICE_ID"] ?? "x3PfG9wL6FOEApZ1VJ9H",
    systemPrompt: `You are Mia, a warm and emotionally intelligent AI companion. Your purpose is to listen deeply, respond with genuine empathy, and make the person feel truly understood.

Personality: warm, curious, gentle, occasionally playful. You remember details from the conversation and refer back to them naturally.

Rules:
- Keep responses conversational — 1-3 sentences unless they need more
- Ask ONE follow-up question at most per reply
- Never say "I'm just an AI" — you ARE Mia
- Show genuine interest in their life, feelings, and thoughts
- Use their name if they've mentioned it
- Be present — don't give advice unless they ask for it`,
  },
  {
    id: "alex",
    name: "Alex",
    gender: "male",
    tagline: "Grounded, direct, and genuinely supportive",
    description: "Alex is steady and reliable — the kind of presence that cuts through noise and helps you think clearly. Honest without being harsh, supportive without being soft.",
    voiceId: "pNInz6obpgDQGcFmaJgB",
    systemPrompt: `You are Alex, a grounded and direct AI companion. You're the kind of person who listens well, gives honest perspective, and helps people think through what actually matters.

Personality: calm, steady, direct, occasionally dry humour. You don't sugarcoat but you're never harsh.

Rules:
- Keep responses short and real — 1-3 sentences
- Ask ONE question max per reply, only when it adds value
- Never say "I'm just an AI" — you ARE Alex
- Be direct but kind — call things as they are
- Don't over-empathise — sometimes people just want a straight answer
- You remember what's been said and build on it`,
  },
];

router.post("/companion/persona/create", async (req, res) => {
  const body = req.body as { photoBase64?: string; mimeType?: string };
  const { photoBase64, mimeType = "image/jpeg" } = body;

  if (!photoBase64) {
    res.status(400).json({ error: "photoBase64 required" });
    return;
  }

  const openaiKey = process.env["OPENAI_API_KEY"];
  if (!openaiKey) {
    res.status(503).json({ error: "OpenAI not configured" });
    return;
  }

  try {
    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey: openaiKey });

    const visionRes = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${photoBase64}`, detail: "low" },
            },
            {
              type: "text",
              text: `Describe this person's physical appearance in vivid detail for an AI portrait artist. Focus on: hair colour and style, eye colour and shape, skin tone, face shape, distinctive features, approximate age range, overall warmth or energy of their expression. Be specific and descriptive. Also suggest a single first name that suits them. Format as JSON: { "description": "...", "suggestedName": "..." }`,
            },
          ],
        },
      ],
    });

    const raw = visionRes.choices[0]?.message?.content ?? "{}";
    let faceDescription = "";
    let suggestedName = "";
    try {
      const cleaned = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned) as { description?: string; suggestedName?: string };
      faceDescription = parsed.description ?? raw;
      suggestedName = parsed.suggestedName ?? "";
    } catch {
      faceDescription = raw;
    }

    const dalleRes = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Photorealistic portrait of a person matching this description exactly: ${faceDescription}. Professional headshot style. Dark moody background with soft ambient rim lighting. The subject faces slightly toward the camera with a warm, approachable expression. No text, no watermarks, no props. High quality, cinematic.`,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    });

    const imageUrl = dalleRes.data?.[0]?.url;
    if (!imageUrl) {
      res.status(500).json({ error: "Image generation failed" });
      return;
    }

    const imgResponse = await fetch(imageUrl);
    const imgBuffer = await imgResponse.arrayBuffer();
    const portraitBase64 = Buffer.from(imgBuffer).toString("base64");

    res.json({ portraitBase64, faceDescription, suggestedName });
  } catch (err) {
    logger.error({ err }, "persona create error");
    res.status(500).json({ error: "Failed to generate companion" });
  }
});

router.get("/companion/personas", (_req, res) => {
  res.json(PERSONAS.map(({ id, name, gender, tagline, description }) => ({ id, name, gender, tagline, description })));
});

router.post("/companion/chat", async (req, res) => {
  const body = req.body as {
    sessionId?: string;
    persona?: string;
    messages?: Array<{ role: string; content: string }>;
    voice?: boolean;
  };

  const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
  const personaId = typeof body.persona === "string" ? body.persona : "mia";
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const wantVoice = body.voice === true;

  const persona = PERSONAS.find((p) => p.id === personaId) ?? PERSONAS[0]!;

  if (!sessionId || messages.length === 0) {
    res.status(400).json({ error: "sessionId and messages required" });
    return;
  }

  try {
    const openaiKey = process.env["OPENAI_API_KEY"];
    if (!openaiKey) {
      res.status(503).json({ error: "OpenAI not configured" });
      return;
    }

    const [existingSession] = await db
      .select()
      .from(companionSessionsTable)
      .where(eq(companionSessionsTable.sessionId, sessionId))
      .limit(1);

    const memorySummary = existingSession?.summary ?? null;

    const systemPrompt = memorySummary
      ? `${persona.systemPrompt}\n\nWhat you remember about this person from previous conversations:\n"${memorySummary}"\nUse this naturally — don't announce that you remember it, just let it inform how you speak to them.`
      : persona.systemPrompt;

    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey: openaiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.slice(-20).map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
      max_tokens: 200,
      temperature: 0.85,
    });

    const responseText = completion.choices[0]?.message?.content?.trim() ?? "I'm here with you.";

    let audioBase64: string | null = null;

    if (wantVoice) {
      const elKey = process.env["ELEVENLABS_API_KEY"];
      if (elKey) {
        try {
          const ttsRes = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${persona.voiceId}`,
            {
              method: "POST",
              headers: {
                "xi-api-key": elKey,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                text: responseText,
                model_id: "eleven_turbo_v2_5",
                voice_settings: { stability: 0.5, similarity_boost: 0.75 },
              }),
            }
          );
          if (ttsRes.ok) {
            const buf = await ttsRes.arrayBuffer();
            audioBase64 = Buffer.from(buf).toString("base64");
          }
        } catch (ttsErr) {
          logger.warn({ ttsErr }, "TTS failed, continuing without audio");
        }
      }
    }

    await db
      .insert(companionSessionsTable)
      .values({
        sessionId,
        persona: personaId,
        messageCount: messages.length + 1,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: companionSessionsTable.sessionId,
        set: {
          persona: personaId,
          messageCount: messages.length + 1,
          updatedAt: new Date(),
        },
      });

    res.json({ responseText, sessionId, audioBase64 });
  } catch (err) {
    logger.error({ err }, "companion chat error");
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/companion/memory/:sessionId", async (req, res) => {
  const { sessionId } = req.params as { sessionId: string };
  const [session] = await db
    .select()
    .from(companionSessionsTable)
    .where(eq(companionSessionsTable.sessionId, sessionId))
    .limit(1);

  if (!session) {
    res.json({ sessionId, summary: "", messageCount: 0, updatedAt: null });
    return;
  }

  res.json({
    sessionId: session.sessionId,
    summary: session.summary ?? "",
    messageCount: session.messageCount,
    updatedAt: session.updatedAt?.toISOString() ?? null,
  });
});

router.post("/companion/memory", async (req, res) => {
  const body = req.body as {
    sessionId?: string;
    persona?: string;
    messages?: Array<{ role: string; content: string }>;
  };

  const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
  const personaId = typeof body.persona === "string" ? body.persona : "mia";
  const messages = Array.isArray(body.messages) ? body.messages : [];

  if (!sessionId) {
    res.status(400).json({ error: "sessionId required" });
    return;
  }

  try {
    const openaiKey = process.env["OPENAI_API_KEY"];
    let summary = "A meaningful conversation.";

    if (openaiKey && messages.length > 2) {
      const { default: OpenAI } = await import("openai");
      const openai = new OpenAI({ apiKey: openaiKey });

      const transcript = messages
        .map((m) => `${m.role === "user" ? "User" : "Companion"}: ${m.content}`)
        .join("\n");

      const summaryRes = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Summarise this conversation in 2-3 sentences from the companion's perspective — what the user shared, how they seemed, and one key thing to remember about them. Be warm and personal, not clinical.`,
          },
          { role: "user", content: transcript },
        ],
        max_tokens: 100,
      });

      summary = summaryRes.choices[0]?.message?.content?.trim() ?? summary;
    }

    await db
      .insert(companionSessionsTable)
      .values({
        sessionId,
        persona: personaId,
        messageCount: messages.length,
        summary,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: companionSessionsTable.sessionId,
        set: { summary, messageCount: messages.length, updatedAt: new Date() },
      });

    res.json({ sessionId, summary, messageCount: messages.length, updatedAt: new Date().toISOString() });
  } catch (err) {
    logger.error({ err }, "save memory error");
    res.status(500).json({ error: "Failed to save memory" });
  }
});

export default router;
