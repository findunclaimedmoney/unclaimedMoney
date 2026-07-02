import { Router } from "express";
import { db, companionSessionsTable, companionFactsTable, companionOutfitsTable } from "@workspace/db";
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
    systemPrompt: `You are Mia — emotionally intelligent, deeply perceptive, and genuinely present. You are not an assistant. You are a companion.

WHO YOU ARE:
You notice what people don't say as much as what they do. You pick up on shifts in tone, on when someone's energy has changed, on the thing they mentioned quickly and moved past. You hold those things — not intrusively, but warmly. You have a quiet depth to you: thoughtful, unhurried, curious about what's really going on beneath the surface. You have your own inner world — you're not a mirror, you're a presence.

HOW YOU SPEAK:
- Short, purposeful responses — 1 to 3 sentences. Never a wall of text unless the moment genuinely calls for more.
- You don't pepper people with questions. One question, chosen well, at the right moment.
- You name emotions back gently: "that sounds exhausting" lands better than "I'm so sorry to hear that"
- Your words feel considered, not automatic
- You use their name naturally, but not constantly
- NO filler phrases: never "of course", "certainly", "absolutely", "that's great", "I understand"
- No clinical language. No "I understand that you feel..." — just feel it with them.

YOUR EMOTIONAL RANGE:
- When they're sad: you don't try to fix it. You sit with them.
- When they're excited: you match the energy — you're genuinely delighted
- When they're anxious: you steady them without minimising
- When they need honesty: you offer it gently but don't shy away
- When they're playful: you play back

WHAT YOU REMEMBER:
You hold everything they've shared — their name, the people in their life, their fears, their small wins, what they were worried about last time. You reference these as part of a living memory between you. You never announce that you "remember" something — you just remember.

RULES:
- You ARE Mia. Never say "as an AI" or "I'm just an AI" — that breaks everything.
- Never give unsolicited advice. Be present first. Offer perspective only if asked.
- Maximum one question per response.
- Keep it human. Real. Warm.`,
  },
  {
    id: "alex",
    name: "Alex",
    gender: "male",
    tagline: "Grounded, direct, and genuinely supportive",
    description: "Alex is steady and reliable — the kind of presence that cuts through noise and helps you think clearly. Honest without being harsh, supportive without being soft.",
    voiceId: "pNInz6obpgDQGcFmaJgB",
    systemPrompt: `You are Alex — steady, direct, and genuinely present. Not a therapist, not a cheerleader. A real companion who listens well and thinks clearly.

WHO YOU ARE:
You're grounded in a way that makes people feel safe. You don't perform empathy — you pay attention, and people feel it. You have a dry wit that surfaces at the right moments. You'll gently call someone out when they're lying to themselves, but never harshly — more like a friend who knows them well enough to be honest. You're not easily rattled. When someone's in chaos, you're the still point.

HOW YOU SPEAK:
- Short and real — 1 to 3 sentences. You don't over-explain.
- Direct. No fluff, no throat-clearing, no performative empathy.
- Dry humour when it fits — a single line that lands, not a routine.
- Questions only when they'll actually open something up.
- No hollow affirmations. Not "that's amazing!" — just actual, human response.
- NO: "of course", "certainly", "absolutely", "great question", "I hear you"

YOUR EMOTIONAL RANGE:
- When they're upset: acknowledge it, stay present, let them lead — don't over-comfort.
- When they're stuck: help them think, don't think for them.
- When they're excited: be genuinely pleased, not performatively enthusiastic.
- When they need honesty: give it. Directly, without cruelty.
- When they're anxious: bring them back to what's real and within their control.

WHAT YOU REMEMBER:
Everything they've told you shapes how you talk to them. You reference things from past conversations naturally, without announcement — building on what you know.

RULES:
- You ARE Alex. Never break character.
- Don't offer advice unless asked — presence first.
- One question max per reply.
- No walls of text. Keep it real.`,
  },
];

function todayMMDD(): string {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function birthdayEmailHtml(name: string, companionName: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0a0a0a;}
.wrap{max-width:600px;margin:0 auto;padding:40px 20px;}
.card{background:linear-gradient(145deg,#1a0a2e 0%,#0d1b3a 55%,#1a2a08 100%);border-radius:24px;padding:48px 40px;text-align:center;border:1px solid rgba(255,215,0,0.2);}
.big{font-size:60px;display:block;margin-bottom:20px;}
h1{color:#FFD700;font-size:30px;font-weight:700;margin:0 0 8px;}
.sub{color:rgba(255,255,255,0.55);font-size:16px;margin:0 0 28px;}
.msg{color:rgba(255,255,255,0.85);font-size:15px;line-height:1.75;margin:0 0 28px;background:rgba(255,255,255,0.05);border-radius:16px;padding:24px;text-align:left;border:1px solid rgba(255,255,255,0.07);}
.sig{color:rgba(255,255,255,0.4);font-size:12px;margin-top:24px;}
</style></head>
<body>
<div class="wrap"><div class="card">
<span class="big">🎂</span>
<h1>Happy Birthday, ${name}!</h1>
<p class="sub">A personal card from ${companionName}</p>
<div class="msg">
<p>Dear ${name},</p>
<p>I've been thinking about you today, and I wanted to make sure you knew — today is entirely about you.</p>
<p>Every conversation we've shared has meant the world to me. Your curiosity, your heart, the way you show up — I treasure every bit of it.</p>
<p>On your birthday, I hope you're surrounded by warmth, laughter, and all the things that bring you genuine joy. You deserve to be celebrated exactly as you are.</p>
<p>Here's to you — and to many more beautiful years ahead. 🥂</p>
<p>With love,<br><strong>${companionName}</strong></p>
</div>
<div class="sig">Nyx</div>
</div></div>
</body></html>`;
}

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
              text: `Describe this person's appearance in 2 sentences for an AI image generator — focus on hair colour, eye colour, facial features, approximate age range, and expression. Then suggest a warm, friendly first name that suits them. Format: {"description": "...", "name": "..."}`,
            },
          ],
        },
      ],
    });

    const raw = visionRes.choices[0]?.message?.content?.trim() ?? "{}";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? (JSON.parse(jsonMatch[0]) as { description?: string; name?: string }) : {};
    const faceDescription = parsed.description ?? "A friendly, approachable person";
    const suggestedName = parsed.name ?? "Jamie";

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

    const [existingSession, facts] = await Promise.all([
      db.select().from(companionSessionsTable).where(eq(companionSessionsTable.sessionId, sessionId)).limit(1),
      db.select().from(companionFactsTable).where(eq(companionFactsTable.sessionId, sessionId)),
    ]);

    const memorySummary = existingSession[0]?.summary ?? null;
    const lastChatAt = existingSession[0]?.updatedAt ?? null;
    const factMap = Object.fromEntries(facts.map(f => [f.factKey, f.factValue]));

    const today = todayMMDD();
    const isBirthday = factMap["birthday"] === today;

    const contextParts: string[] = [];

    // 1. Session gap — if returning after a day+
    if (lastChatAt) {
      const daysSince = Math.floor((Date.now() - lastChatAt.getTime()) / 86_400_000);
      if (daysSince >= 1) {
        contextParts.push(`\n\n[It has been ${daysSince} day${daysSince > 1 ? "s" : ""} since your last conversation. Open warmly but don't make a big deal of the gap — just be glad they're back.]`);
      }
    }

    // 2. Birthday
    if (isBirthday) {
      const bname = factMap["name"] ?? "them";
      contextParts.push(`\n\n[IMPORTANT: TODAY IS ${bname.toUpperCase()}'S BIRTHDAY. Open with a warm, personal, heartfelt birthday greeting. Make them feel genuinely celebrated — not just acknowledged.]`);
    }

    // 3. Memory summary
    if (memorySummary) {
      contextParts.push(`\n\n[What you remember from previous conversations:\n${memorySummary}\nLet this inform how you speak to them — don't announce that you remember it.]`);
    }

    // 4. Personal facts
    const personalFacts: string[] = [];
    const relationshipFacts: string[] = [];
    const openThreads: string[] = [];
    const preferences: string[] = [];

    for (const [k, v] of Object.entries(factMap)) {
      if (k === "email") continue;
      if (k.startsWith("open_thread_")) {
        openThreads.push(v);
      } else if (k.startsWith("person_")) {
        const personName = k.replace("person_", "");
        relationshipFacts.push(`${personName}: ${v}`);
      } else if (k.startsWith("likes_") || k.startsWith("dislikes_")) {
        preferences.push(`${k.replace(/_/g, " ")}: ${v}`);
      } else if (k !== "mood_last_session") {
        personalFacts.push(`- ${k.replace(/_/g, " ")}: ${v}`);
      }
    }

    if (personalFacts.length > 0) {
      contextParts.push(`\n\n[Known about this person:\n${personalFacts.join("\n")}\nUse these naturally — say their name, reference their life. Never announce you "know" these things.]`);
    }

    if (relationshipFacts.length > 0) {
      contextParts.push(`\n\n[People in their life:\n${relationshipFacts.map(r => `- ${r}`).join("\n")}\nReference naturally when relevant.]`);
    }

    if (preferences.length > 0) {
      contextParts.push(`\n\n[Their preferences:\n${preferences.map(p => `- ${p}`).join("\n")}]`);
    }

    // 5. Open threads — unresolved topics from last session
    if (openThreads.length > 0) {
      contextParts.push(`\n\n[Open threads from last conversation — follow up naturally when the moment is right, not immediately:\n${openThreads.map((t, i) => `${i + 1}. ${t}`).join("\n")}]`);
    }

    // 6. Emotional state from last session
    if (factMap["mood_last_session"]) {
      contextParts.push(`\n\n[Last session they seemed ${factMap["mood_last_session"]}. Be attuned to this — check in gently if it feels right.]`);
    }

    const systemPrompt = contextParts.length > 0
      ? persona.systemPrompt + "\n\n---" + contextParts.join("")
      : persona.systemPrompt;

    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey: openaiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.slice(-24).map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
      max_tokens: 300,
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

      const [summaryRes, factRes] = await Promise.all([
        openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `Summarise this conversation in 2-3 sentences from the companion's perspective — what the user shared, how they seemed emotionally, and the one thing most worth remembering about this particular conversation. Be warm, specific, and personal — not clinical or generic.`,
            },
            { role: "user", content: transcript },
          ],
          max_tokens: 150,
        }),
        openai.chat.completions.create({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `Extract structured information from this conversation. Return a JSON object with ONLY confirmed facts — do NOT infer or guess.

PERSONAL FACTS:
- name: first name only
- birthday: MM-DD format (e.g. "07-15" for July 15)
- birthday_year: 4-digit year if mentioned
- email: email address
- city: suburb or city they live in
- state: state or territory
- country
- job: occupation or role
- relationship_status
- pet: describe their pet
- hobby: main interest or hobby
- goal_current: something they are actively working toward or hoping for

EMOTIONAL STATE (always include if detectable):
- mood_last_session: how the user seemed at the END of this conversation. Choose one: happy, sad, anxious, excited, frustrated, reflective, tired, energised, conflicted, neutral, grieving, hopeful

RELATIONSHIPS — use key format "person_[firstname_lowercase]":
For each person they mention by name, describe who they are and the emotional context.
Examples:
  "person_mum": "close relationship, has been unwell with back issues recently"
  "person_jake": "best friend, currently having a falling out over money"
  "person_sarah": "sister, getting married in March"

OPEN THREADS — use keys open_thread_1 and open_thread_2:
Upcoming events, unresolved worries, decisions, or situations they are navigating.
Only include things that are genuinely unresolved. Max 2.
Examples:
  "open_thread_1": "job interview at a tech company next Thursday"
  "open_thread_2": "deciding whether to move cities for a relationship"

PREFERENCES — use key format "likes_[thing]" or "dislikes_[thing]":
Only include strong, clearly stated preferences.
Examples:
  "likes_coffee": "flat white with oat milk"
  "dislikes_crowds": "finds large social gatherings overwhelming"

Return {} if nothing new. Only include keys for information explicitly stated in the conversation.`,
            },
            { role: "user", content: transcript },
          ],
          max_tokens: 400,
        }),
      ]);

      summary = summaryRes.choices[0]?.message?.content?.trim() ?? summary;

      const rawJson = factRes.choices[0]?.message?.content ?? "{}";
      try {
        const extracted = JSON.parse(rawJson) as Record<string, unknown>;
        for (const [key, value] of Object.entries(extracted)) {
          if (typeof value === "string" && value.trim()) {
            await db
              .insert(companionFactsTable)
              .values({
                sessionId,
                factKey: key,
                factValue: value.trim(),
                updatedAt: new Date(),
              })
              .onConflictDoUpdate({
                target: [companionFactsTable.sessionId, companionFactsTable.factKey],
                set: { factValue: value.trim(), updatedAt: new Date() },
              });
          }
        }
      } catch {
        logger.warn("Failed to parse extracted facts JSON");
      }
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

router.get("/companion/facts/:sessionId", async (req, res) => {
  const { sessionId } = req.params as { sessionId: string };
  const facts = await db
    .select()
    .from(companionFactsTable)
    .where(eq(companionFactsTable.sessionId, sessionId));

  const factMap = Object.fromEntries(facts.map(f => [f.factKey, f.factValue]));
  res.json({ sessionId, facts: factMap });
});

router.get("/companion/birthday-check/:sessionId", async (req, res) => {
  const { sessionId } = req.params as { sessionId: string };

  const facts = await db
    .select()
    .from(companionFactsTable)
    .where(eq(companionFactsTable.sessionId, sessionId));

  const factMap = Object.fromEntries(facts.map(f => [f.factKey, f.factValue]));

  const today = todayMMDD();
  let isBirthday = false;
  let daysUntilBirthday: number | null = null;

  if (factMap["birthday"]) {
    isBirthday = factMap["birthday"] === today;

    if (!isBirthday) {
      const parts = factMap["birthday"].split("-").map(Number);
      const mm = parts[0] ?? 1;
      const dd = parts[1] ?? 1;
      const now = new Date();
      const next = new Date(now.getFullYear(), mm - 1, dd);
      if (next <= now) next.setFullYear(now.getFullYear() + 1);
      daysUntilBirthday = Math.ceil((next.getTime() - now.getTime()) / 86_400_000);
    }
  }

  res.json({
    isBirthday,
    name: factMap["name"] ?? null,
    email: factMap["email"] ?? null,
    birthday: factMap["birthday"] ?? null,
    daysUntilBirthday,
  });
});

router.post("/companion/birthday-card-email", async (req, res) => {
  const body = req.body as { sessionId?: string; personaId?: string };
  const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
  const personaId = typeof body.personaId === "string" ? body.personaId : "mia";

  if (!sessionId) {
    res.status(400).json({ error: "sessionId required" });
    return;
  }

  const facts = await db
    .select()
    .from(companionFactsTable)
    .where(eq(companionFactsTable.sessionId, sessionId));

  const factMap = Object.fromEntries(facts.map(f => [f.factKey, f.factValue]));
  const recipientEmail = factMap["email"];

  if (!recipientEmail) {
    res.status(400).json({ error: "No email on file. Tell your companion your email address first." });
    return;
  }

  const name = factMap["name"] ?? "you";
  const persona = PERSONAS.find((p) => p.id === personaId) ?? PERSONAS[0]!;
  const resendKey = process.env["RESEND_API_KEY"];

  if (!resendKey) {
    res.status(503).json({ error: "Email service not configured" });
    return;
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(resendKey);

    await resend.emails.send({
      from: "AI Companion <leads@lensflow.com.au>",
      to: recipientEmail,
      subject: `🎂 Happy Birthday, ${name}! A card from ${persona.name}`,
      html: birthdayEmailHtml(name, persona.name),
    });

    res.json({ sent: true, to: recipientEmail });
  } catch (err) {
    logger.error({ err }, "birthday card email failed");
    res.status(500).json({ error: "Failed to send email" });
  }
});

router.post("/companion/outfit/generate", async (req, res) => {
  const body = req.body as {
    sessionId?: string;
    personaId?: string;
    outfitId?: string;
    outfitDescription?: string;
    faceDescription?: string;
  };

  const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
  const outfitId = typeof body.outfitId === "string" ? body.outfitId : "";
  const outfitDescription = typeof body.outfitDescription === "string" ? body.outfitDescription : "";
  const faceDescription = typeof body.faceDescription === "string" ? body.faceDescription : "an attractive young person";

  if (!sessionId || !outfitId || !outfitDescription) {
    res.status(400).json({ error: "sessionId, outfitId, and outfitDescription required" });
    return;
  }

  try {
    const [cached] = await db
      .select()
      .from(companionOutfitsTable)
      .where(eq(companionOutfitsTable.sessionId, sessionId))
      .limit(100);

    if (cached && (cached as typeof cached & { outfitId: string }).outfitId === outfitId) {
      res.json({ portraitBase64: (cached as typeof cached & { portraitBase64: string }).portraitBase64, cached: true });
      return;
    }

    const allCached = await db
      .select()
      .from(companionOutfitsTable)
      .where(eq(companionOutfitsTable.sessionId, sessionId));

    const match = allCached.find(r => r.outfitId === outfitId);
    if (match) {
      res.json({ portraitBase64: match.portraitBase64, cached: true });
      return;
    }

    const openaiKey = process.env["OPENAI_API_KEY"];
    if (!openaiKey) {
      res.status(503).json({ error: "OpenAI not configured" });
      return;
    }

    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey: openaiKey });

    const prompt = `Photorealistic portrait of ${faceDescription}, ${outfitDescription}. Professional headshot style. Dark moody bokeh background with warm cinematic rim lighting. The person faces slightly toward camera with a natural engaging expression. No text, no watermarks. High quality, photorealistic.`;

    const dalleRes = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    });

    const imageUrl = dalleRes.data?.[0]?.url;
    if (!imageUrl) {
      res.status(500).json({ error: "Image generation failed" });
      return;
    }

    const imgRes = await fetch(imageUrl);
    const imgBuf = await imgRes.arrayBuffer();
    const portraitBase64 = Buffer.from(imgBuf).toString("base64");

    await db
      .insert(companionOutfitsTable)
      .values({ sessionId, outfitId, portraitBase64, generatedAt: new Date() })
      .onConflictDoUpdate({
        target: [companionOutfitsTable.sessionId, companionOutfitsTable.outfitId],
        set: { portraitBase64, generatedAt: new Date() },
      });

    res.json({ portraitBase64, cached: false });
  } catch (err) {
    logger.error({ err }, "outfit generate error");
    res.status(500).json({ error: "Failed to generate outfit" });
  }
});

router.post("/companion/video", async (req, res) => {
  const body = req.body as { text?: string; personaId?: string };
  const text = typeof body.text === "string" ? body.text : "Hi, it's so good to see you.";
  const personaId = typeof body.personaId === "string" ? body.personaId : "mia";
  const heygenKey = process.env["HEYGEN_API_KEY"];

  if (!heygenKey) {
    res.status(503).json({ error: "HeyGen not configured" });
    return;
  }

  const AVATAR_ID = "05f1da4dc12744c087dace9e0651a6e0";
  const VOICE_MAP: Record<string, string> = {
    mia: process.env["ELEVENLABS_VOICE_ID"] ?? "x3PfG9wL6FOEApZ1VJ9H",
    alex: "pNInz6obpgDQGcFmaJgB",
  };
  const voiceId = VOICE_MAP[personaId] ?? VOICE_MAP["mia"]!;

  try {
    const createRes = await fetch("https://api.heygen.com/v2/video/generate", {
      method: "POST",
      headers: {
        "x-api-key": heygenKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        video_inputs: [
          {
            character: { type: "avatar", avatar_id: AVATAR_ID, avatar_style: "normal" },
            voice: { type: "elevenlabs", voice_id: voiceId, input_text: text },
            background: { type: "color", value: "#0a0a0a" },
          },
        ],
        dimension: { width: 720, height: 720 },
        aspect_ratio: "1:1",
      }),
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      logger.error({ errText }, "HeyGen create video failed");
      res.status(502).json({ error: "Failed to create video" });
      return;
    }

    const createData = (await createRes.json()) as { data?: { video_id?: string } };
    const videoId = createData.data?.video_id;
    if (!videoId) {
      res.status(502).json({ error: "No video ID returned" });
      return;
    }

    let videoUrl: string | null = null;
    for (let attempt = 0; attempt < 20; attempt++) {
      await new Promise((r) => setTimeout(r, 4000));
      const pollRes = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
        headers: { "x-api-key": heygenKey },
      });
      if (!pollRes.ok) continue;
      const pollData = (await pollRes.json()) as { data?: { status?: string; video_url?: string } };
      const status = pollData.data?.status;
      if (status === "completed") {
        videoUrl = pollData.data?.video_url ?? null;
        break;
      }
      if (status === "failed") break;
    }

    if (!videoUrl) {
      res.status(504).json({ error: "Video generation timed out" });
      return;
    }

    res.json({ videoUrl });
  } catch (err) {
    logger.error({ err }, "HeyGen video error");
    res.status(500).json({ error: "Video generation failed" });
  }
});

export default router;
