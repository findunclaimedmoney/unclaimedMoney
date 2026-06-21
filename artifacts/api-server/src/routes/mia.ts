import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { MiaChatBody } from "@workspace/api-zod";
import { MIA_SYSTEM_PROMPT, getMiaFallback } from "../lib/mia-knowledge";

const router: IRouter = Router();

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 15;
const hits = new Map<string, number[]>();

function rateLimit(req: Request, res: Response, next: NextFunction): void {
  const key = req.ip ?? "unknown";
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    req.log.warn({ ip: key }, "Mia chat rate limit exceeded");
    res.setHeader("Retry-After", "60");
    res.status(429).json({ error: "Too many requests. Please slow down and try again shortly." });
    return;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) hits.delete(k);
    }
  }
  next();
}

const streamFallback = (res: Response, messages: { role: string; content: string }[], clientGone: () => boolean) => {
  if (clientGone() || res.writableEnded) return;
  const answer = getMiaFallback(messages);
  for (const word of answer.split(" ")) {
    if (clientGone()) return;
    res.write(`data: ${JSON.stringify({ content: word + " " })}\n\n`);
  }
  if (!clientGone()) {
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  }
};

router.post("/mia/chat", rateLimit, async (req, res): Promise<void> => {
  const parsed = MiaChatBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid Mia chat body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let gone = false;
  res.on("close", () => { if (!res.writableEnded) gone = true; });
  const clientGone = () => gone;

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    req.log.info("No OPENAI_API_KEY — using Mia knowledge fallback");
    streamFallback(res, parsed.data.messages, clientGone);
    return;
  }

  try {
    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey });

    const controller = new AbortController();
    res.on("close", () => controller.abort());

    const stream = await openai.chat.completions.create(
      {
        model: "gpt-4o-mini",
        max_tokens: 1024,
        messages: [
          { role: "system", content: MIA_SYSTEM_PROMPT },
          ...parsed.data.messages,
        ],
        stream: true,
      },
      { signal: controller.signal },
    );

    let streamedAny = false;
    for await (const chunk of stream) {
      if (clientGone()) break;
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        streamedAny = true;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    if (clientGone()) return;
    if (!streamedAny) {
      req.log.warn("OpenAI returned empty stream, using fallback");
      streamFallback(res, parsed.data.messages, clientGone);
      return;
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    if (clientGone()) return;
    req.log.error({ err }, "Mia chat stream failed, using knowledge fallback");
    streamFallback(res, parsed.data.messages, clientGone);
  }
});

export default router;
