import Anthropic from "@anthropic-ai/sdk";

import type { ModelId } from "@/lib/types";
import type { Story } from "@/stories/types";

function extractJson(text: string): string {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fence ? fence[1] : text;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  return start >= 0 && end > start ? body.slice(start, end + 1) : body;
}

export async function generateAIStory(params: {
  apiKey: string;
  model: ModelId;
  courseCode: string;
  languageName: string;
  level: string;
  topic?: string;
}): Promise<Story> {
  const { apiKey, model, courseCode, languageName, level, topic } = params;
  const needPron = courseCode === "zh" || courseCode === "th";
  const pronField = needPron
    ? courseCode === "zh"
      ? `, "pinyin": "toned pinyin"`
      : `, "pinyin": "romanization"`
    : "";

  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  const prompt =
    `Write a short, fun ${languageName} story for a ${level} language learner` +
    `${topic ? ` about ${topic}` : ""}. Keep sentences short and level-appropriate.\n\n` +
    `Return ONLY JSON (no prose) shaped exactly:\n` +
    `{"title": "...", "emoji": "single emoji", "lines": [ {"speaker": "🧑 Name", "target": "${languageName} sentence", "en": "English translation"${pronField}} ], "questions": [ {"question": "English comprehension question", "options": ["a","b","c"], "answer": 0} ]}\n` +
    `Use 8-12 lines and exactly 2 questions. "target" must be in ${languageName}.` +
    (needPron ? ` Every line must include the pronunciation field.` : "");

  const res = await client.messages.create({
    model,
    max_tokens: 1600,
    messages: [{ role: "user", content: prompt }],
  });
  const text = res.content
    .map((c) => (c.type === "text" ? c.text : ""))
    .join("");
  const parsed = JSON.parse(extractJson(text)) as Omit<Story, "id" | "courseCode" | "cefr" | "blurb">;

  return {
    id: `ai-${Date.now()}`,
    courseCode,
    cefr: level,
    blurb: "Made just for you",
    title: parsed.title ?? "Your story",
    emoji: parsed.emoji ?? "✨",
    lines: parsed.lines ?? [],
    questions: parsed.questions ?? [],
  };
}
