import dotenv from "dotenv";
import { RECOMMENDATION_SYSTEM_PROMPT, SYSTEM_PROMPT } from "./system_prompt";

export interface QuizAnswer {
  questionId: string;
  value: string;
}

export interface GiftRecommendation {
  title: string;
  description: string;
  priceRange: string;
  reason: string;
}

dotenv.config();

export async function generateFollowUpQuestionsFromAI(
  answers: QuizAnswer[],
): Promise<any[]> {
  const apiKey = process.env.AI_API_KEY;
  const endpoint = process.env.AI_ENDPOINT;
  if (!apiKey || !endpoint) {
    throw new Error("AI_API_KEY is not configured");
  }

  const userContent = answers
    .map((a) => `- ${a.questionId}: ${a.value}`)
    .join("\n");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "minimax/minimax-m3",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";

  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("AI response did not contain valid JSON");
  }

  return JSON.parse(jsonMatch[0]);
}

export async function getGiftRecommendationsFromAI(
  answers: QuizAnswer[],
): Promise<GiftRecommendation[]> {
  const apiKey = process.env.AI_API_KEY;
  const endpoint = process.env.AI_ENDPOINT;
  if (!apiKey || !endpoint) {
    throw new Error("AI_API_KEY is not configured");
  }

  const userContent = answers
    .map((a) => `- ${a.questionId}: ${a.value}`)
    .join("\n");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "minimax/minimax-m3",
      messages: [
        { role: "system", content: RECOMMENDATION_SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
    }),
  });
  if (!response.ok) {
    throw new Error(`AI API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";

  // Extract JSON from the response (sometimes the AI wraps it in markdown)
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("AI response did not contain valid JSON");
  }

  const recommendations: GiftRecommendation[] = JSON.parse(jsonMatch[0]);
  return recommendations;
}
