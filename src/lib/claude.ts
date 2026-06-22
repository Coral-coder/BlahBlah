import Anthropic from "@anthropic-ai/sdk";

import type { Language, LevelId } from "./languages";
import type { ChatMessage, Lesson, ModelId } from "./types";

/**
 * BlahBlah talks to the Claude API directly from the device.
 *
 * SECURITY NOTE: shipping an API key inside a mobile client exposes it to
 * anyone who inspects traffic. This is fine for personal use / a prototype.
 * For a real launch, proxy these calls through a small backend that holds the
 * key server-side and add per-user auth + rate limiting. See README.
 */
function client(apiKey: string): Anthropic {
  return new Anthropic({
    apiKey,
    // React Native is not a browser, but the SDK's environment guard treats any
    // non-Node runtime the same way. This opt-in is required to run on-device.
    dangerouslyAllowBrowser: true,
  });
}

function firstText(message: Anthropic.Message): string {
  for (const block of message.content) {
    if (block.type === "text") return block.text;
  }
  return "";
}

/**
 * Pull a JSON object out of a model reply, tolerating ```json fences or stray
 * prose around it. Keeps lesson generation working across SDK versions without
 * depending on the (newer/beta) structured-output request field.
 */
function extractJSON<T>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("The model did not return a lesson. Try again.");
  }
  return JSON.parse(candidate.slice(start, end + 1)) as T;
}

/** Shape the lesson generator is asked to produce. */
const LESSON_JSON_SHAPE = `{
  "title": string,
  "immersionText": string,
  "immersionTranslation": string,
  "vocabulary": [{ "term": string, "pronunciation": string, "translation": string, "example": string, "exampleTranslation": string }],
  "exercises": [{ "prompt": string, "answer": string, "hint": string }]
}`;

export async function generateLesson(params: {
  apiKey: string;
  model: ModelId;
  language: Language;
  level: LevelId;
  topic: string;
}): Promise<Lesson> {
  const { apiKey, model, language, level, topic } = params;

  const system = [
    `You are an expert ${language.name} teacher who designs immersion lessons.`,
    `The learner is at CEFR level ${level}. Calibrate vocabulary and grammar to that level.`,
    `Write the immersion passage entirely in ${language.name}, natural and engaging, ~4-6 sentences.`,
    `Provide 8 vocabulary items and 4 short exercises (mix comprehension and production).`,
    language.scriptHint ?? "",
    `Respond ONLY with a single JSON object of exactly this shape (no markdown, no commentary):`,
    LESSON_JSON_SHAPE,
  ]
    .filter(Boolean)
    .join(" ");

  const message = await client(apiKey).messages.create({
    model,
    max_tokens: 4000,
    system,
    messages: [
      {
        role: "user",
        content: `Create an immersion lesson about: "${topic}".`,
      },
    ],
  });

  const data = extractJSON<
    Omit<Lesson, "topic" | "language" | "level" | "createdAt">
  >(firstText(message));

  return {
    ...data,
    topic,
    language: language.name,
    level,
    createdAt: Date.now(),
  };
}

/**
 * Immersion conversation tutor. Replies in the target language at the learner's
 * level, with a short English gloss so beginners aren't lost. Returns the bubble
 * text plus an optional translation parsed from a lightweight `[[EN: ...]]` tag.
 */
export async function chatReply(params: {
  apiKey: string;
  model: ModelId;
  language: Language;
  level: LevelId;
  history: ChatMessage[];
}): Promise<ChatMessage> {
  const { apiKey, model, language, level, history } = params;

  const system = [
    `You are a friendly ${language.name} conversation partner for immersion practice.`,
    `The learner is at CEFR level ${level}. Keep your ${language.name} natural but level-appropriate, and keep replies to 1-3 sentences.`,
    `Gently correct mistakes when helpful, then continue the conversation with a question.`,
    `Reply in ${language.name}. On a NEW final line, add an English translation of your reply tagged exactly like: [[EN: your english translation]].`,
    language.scriptHint ?? "",
    `Respond with your final answer only — no meta commentary about your process.`,
  ]
    .filter(Boolean)
    .join(" ");

  const message = await client(apiKey).messages.create({
    model,
    max_tokens: 1000,
    system,
    messages: history.map((m) => ({ role: m.role, content: m.content })),
  });

  const raw = firstText(message).trim();
  const match = raw.match(/\[\[EN:\s*([\s\S]*?)\]\]/);
  const translation = match?.[1]?.trim();
  const content = raw.replace(/\[\[EN:[\s\S]*?\]\]/, "").trim();

  return { role: "assistant", content, translation };
}

/** Turns a thrown error into something safe to show a learner. */
export function describeError(err: unknown): string {
  if (err instanceof Anthropic.AuthenticationError) {
    return "Your API key was rejected. Check it in Settings.";
  }
  if (err instanceof Anthropic.RateLimitError) {
    return "Rate limited by the API. Wait a moment and try again.";
  }
  if (err instanceof Anthropic.APIConnectionError) {
    return "Network error. Check your connection and try again.";
  }
  if (err instanceof Anthropic.APIError) {
    return `API error (${err.status ?? "?"}): ${err.message}`;
  }
  return err instanceof Error ? err.message : "Something went wrong.";
}
