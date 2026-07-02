import { Router } from "express";
import { logger } from "../lib/logger";

const router = Router();

const HEYGEN_AVATAR_ID = "05f1da4dc12744c087dace9e0651a6e0";
const HEYGEN_API = "https://api.heygen.com";

router.post("/companion/video", async (req, res) => {
  const body = req.body as { text?: string; personaId?: string };
  const { text, personaId = "mia" } = body;

  if (!text?.trim()) {
    res.status(400).json({ error: "text required" });
    return;
  }

  const heygenKey = process.env["HEYGEN_API_KEY"];
  if (!heygenKey) {
    res.status(503).json({ error: "HeyGen not configured" });
    return;
  }

  const avatarId = HEYGEN_AVATAR_ID;
  const voiceId = personaId === "alex" ? "en-US-ChristopherNeural" : "en-US-AriaNeural";

  try {
    const createRes = await fetch(`${HEYGEN_API}/v2/video/generate`, {
      method: "POST",
      headers: {
        "X-Api-Key": heygenKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        video_inputs: [
          {
            character: {
              type: "avatar",
              avatar_id: avatarId,
              avatar_style: "normal",
            },
            voice: {
              type: "text",
              input_text: text.slice(0, 500),
              voice_id: voiceId,
              speed: 1.0,
            },
            background: {
              type: "color",
              value: "#09090b",
            },
          },
        ],
        dimension: { width: 512, height: 512 },
        aspect_ratio: "1:1",
      }),
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      logger.error({ status: createRes.status, errText }, "HeyGen video create failed");
      res.status(502).json({ error: "Video generation failed" });
      return;
    }

    const createData = await createRes.json() as { data?: { video_id?: string }; error?: string };
    const videoId = createData.data?.video_id;

    if (!videoId) {
      res.status(502).json({ error: "No video ID returned" });
      return;
    }

    let attempts = 0;
    let videoUrl: string | null = null;

    while (attempts < 40) {
      await new Promise((r) => setTimeout(r, 3000));
      attempts++;

      const statusRes = await fetch(`${HEYGEN_API}/v1/video_status.get?video_id=${videoId}`, {
        headers: { "X-Api-Key": heygenKey },
      });

      if (!statusRes.ok) continue;

      const statusData = await statusRes.json() as {
        data?: { status?: string; video_url?: string; video_url_caption?: string };
      };

      const status = statusData.data?.status;

      if (status === "completed") {
        videoUrl = statusData.data?.video_url ?? null;
        break;
      }

      if (status === "failed") {
        break;
      }
    }

    if (!videoUrl) {
      res.status(504).json({ error: "Video generation timed out or failed" });
      return;
    }

    res.json({ videoUrl, videoId });
  } catch (err) {
    logger.error({ err }, "companion video error");
    res.status(500).json({ error: "Video generation error" });
  }
});

export default router;
