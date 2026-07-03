import dotenv from "dotenv";
import {
  DEEP_QUESTIONS_PROMPT,
  PRACTICAL_QUESTIONS_PROMPT,
  RECOMMENDATION_SYSTEM_PROMPT,
} from "./system_prompt.js";

export interface QuizAnswer {
  questionId: string;
  questionText: string;
  value: string;
}

export interface StoreLocation {
  name: string;
  address: string;
}
export interface GiftRecommendation {
  title: string;
  description: string;
  priceRange: string;
  reason: string;
  onlineLinks?: string[];
  stores?: StoreLocation[];
}

dotenv.config();

function buildUserContent(answers: QuizAnswer[]): string {
  return answers.map((a) => `Q: ${a.questionText}\nA: ${a.value}`).join("\n\n");
}

async function callAI(
  systemPrompt: string,
  userContent: string,
): Promise<string> {
  const apiKey = process.env.AI_API_KEY;
  const endpoint = process.env.AI_ENDPOINT;
  if (!apiKey || !endpoint) {
    throw new Error("AI_API_KEY or AI_ENDPOINT is not configured");
  }
  console.log(userContent);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "minimax/minimax-m3",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

function cleanAIContent(content: string): string {
  return content
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

function extractJSON(content: string): any[] {
  const cleaned = cleanAIContent(content);
  console.log("[Cleaned AI content]", cleaned);
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed;
    if (parsed.recommendations && Array.isArray(parsed.recommendations))
      return parsed.recommendations;
    if (parsed.questions && Array.isArray(parsed.questions))
      return parsed.questions;
    return [parsed];
  } catch {
    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  }
  throw new Error("AI response did not contain valid JSON");
}

// Phase 1: Generates 5 deep contextual questions based on static answers
export async function generateDeepQuestionsFromAI(
  answers: QuizAnswer[],
): Promise<any[]> {
  const content = await callAI(
    DEEP_QUESTIONS_PROMPT,
    buildUserContent(answers),
  );
  return extractJSON(content);
}

// Phase 2: Generates 5 practical questions (budget, occasion, etc.)
export async function generatePracticalQuestionsFromAI(
  answers: QuizAnswer[],
): Promise<any[]> {
  const content = await callAI(
    PRACTICAL_QUESTIONS_PROMPT,
    buildUserContent(answers),
  );
  return extractJSON(content);
}

// Phase 3: Generates 5 personalized gift recommendations
export async function getGiftRecommendationsFromAI(
  answers: QuizAnswer[],
): Promise<GiftRecommendation[]> {
  const content = await callAI(
    RECOMMENDATION_SYSTEM_PROMPT,
    buildUserContent(answers),
  );
  return extractJSON(content);
}
