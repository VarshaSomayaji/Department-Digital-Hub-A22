import axios from "axios";
import config from "../config";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyBKPvsAbGf4XFxnmGpnDFhGT2WwLM6QBUY";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

if (!GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not set. AI features will not work.");
}

const callGemini = async (prompt: string, retries = 3): Promise<string> => {
  if (!GEMINI_API_KEY) throw new Error("Gemini API key not configured");
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        { contents: [{ parts: [{ text: prompt }] }] },
        { headers: { "Content-Type": "application/json" } }
      );
      const candidates = response.data.candidates;
      if (!candidates || candidates.length === 0) {
        throw new Error("No response from Gemini");
      }
      return candidates[0].content.parts[0].text;
    } catch (error: any) {
      if (error.response?.status === 503 && i < retries - 1) {
        const delay = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      console.error("Gemini API error:", error.response?.data || error.message);
      throw new Error("AI service unavailable");
    }
  }
  throw new Error("AI service unavailable after retries");
};

export const extractProjectMetadata = async (title: string, description: string) => {
  const prompt = `
You are an AI assistant that extracts structured information from academic project descriptions.
Given the project title and description, provide the following:
- Domain: The broad area (e.g., Machine Learning, Web Development, IoT, etc.)
- Technology Stack: Comma-separated list of technologies used
- Keywords: Comma-separated list of relevant keywords
- Summary: A one-sentence summary of the project

Return ONLY a valid JSON object with keys: domain, techStack (as array), keywords (as array), summary.
Do not include any other text.

Title: ${title}
Description: ${description}
`;

  const result = await callGemini(prompt);
  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Could not parse JSON from Gemini response");
  } catch (error) {
    console.error("Failed to parse metadata:", error);
    return {
      domain: "Unknown",
      techStack: [],
      keywords: [],
      summary: description.substring(0, 100) + "...",
    };
  }
};

export const summarizeText = async (text: string): Promise<string> => {
  const prompt = `Summarize the following text concisely (max 3 sentences).\n\nText: ${text}`;
  return callGemini(prompt);
};

export const doubtResolution = async (question: string, context?: string): Promise<string> => {
  const prompt = context
    ? `Based on the following context, answer the question.\n\nContext: ${context}\n\nQuestion: ${question}`
    : `Answer the following academic question:\n${question}`;
  return callGemini(prompt);
};

export const intelligentSearch = async (query: string): Promise<string[]> => {
  const prompt = `
Given the following search query, extract a list of relevant keywords that could be used to search a database of academic projects and notes. Return only a JSON array of strings.

Query: "${query}"
`;
  const result = await callGemini(prompt);
  try {
    const arrayMatch = result.match(/\[[\s\S]*\]/);
    if (arrayMatch) return JSON.parse(arrayMatch[0]);
    return [query];
  } catch {
    return [query];
  }
};