import { logger } from "./logger";

export interface SimulationResult {
  likelihood: "high" | "medium" | "low";
  expectedOutcome: string;
  risks: string[];
  recommendation: "proceed" | "adjust" | "defer";
  adjustedApproach: string | null;
  simulatedAt: Date;
}

const FALLBACK: Omit<SimulationResult, "simulatedAt"> = {
  likelihood: "medium",
  expectedOutcome: "Task should complete normally based on available data.",
  risks: ["Insufficient context to model specific risks"],
  recommendation: "proceed",
  adjustedApproach: null,
};

export async function simulateTask(
  taskDescription: string,
  context = "",
): Promise<SimulationResult> {
  try {
    const integrationBase = process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"];
    const integrationKey = process.env["AI_INTEGRATIONS_OPENAI_API_KEY"];
    const directKey = process.env["OPENAI_API_KEY"];
    const useIntegration = !!(integrationBase && integrationKey);
    const apiKey = useIntegration ? integrationKey : directKey;
    if (!apiKey) return { ...FALLBACK, simulatedAt: new Date() };

    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({
      ...(useIntegration ? { baseURL: integrationBase } : {}),
      apiKey,
    });

    const res = await openai.chat.completions.create({
      model: useIntegration ? "gpt-5.4" : "gpt-4o-mini",
      max_completion_tokens: 300,
      messages: [
        {
          role: "user",
          content: [
            `You are Mia's World Simulator — a planning module that predicts task outcomes before execution.`,
            ``,
            `Task: ${taskDescription}`,
            context ? `Context: ${context}` : "",
            ``,
            `Respond with JSON only (no markdown):`,
            `{`,
            `  "likelihood": "high" | "medium" | "low",`,
            `  "expectedOutcome": "one sentence",`,
            `  "risks": ["risk1", "risk2"],`,
            `  "recommendation": "proceed" | "adjust" | "defer",`,
            `  "adjustedApproach": "alternative if adjusting, else null"`,
            `}`,
          ].filter(Boolean).join("\n"),
        },
      ],
    });

    const raw = res.choices[0]?.message?.content ?? "";
    const parsed = JSON.parse(raw) as Omit<SimulationResult, "simulatedAt">;
    return { ...parsed, simulatedAt: new Date() };
  } catch (err) {
    logger.warn({ err }, "MiaWorldSimulator: failed, using fallback");
    return { ...FALLBACK, simulatedAt: new Date() };
  }
}
