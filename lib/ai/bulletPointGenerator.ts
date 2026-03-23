import OpenAI from "openai";

if (!process.env.OPEN_ROUTER_API_KEY!) {
  throw new Error(
    "OPENROUTER API KEY is not set in .env.local! Please add it.",
  );
}

const openai = new OpenAI({
  apiKey: process.env.OPEN_ROUTER_API_KEY!,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "Renhanced",
  },
});

interface GenerateBulletContext {
  jobTitle?: string;
  company?: string;
  skills?: string[];
  type?: "experience" | "project";
}

export async function generateSingleBullet(
  input: string,
  context?: GenerateBulletContext,
): Promise<string> {
  const typeContext =
    context?.type === "project"
      ? "This is for a project section. Focus on what was built and the technologies used."
      : "This is for a work experience section. Focus on responsibilities and impact.";

  const prompt = `You are an expert resume writer who writes in a natural, professional style without overusing buzzwords.

IMPORTANT: The user has already written something. Your job is to IMPROVE what they wrote, not create something completely new. Keep their original idea but make it more professional.

${typeContext}

User's original text: "${input}"
${context?.jobTitle ? `Their job title: ${context.jobTitle}` : ""}
${context?.company ? `Their company: ${context.company}` : ""}
${context?.skills?.length ? `Technologies they used: ${context.skills.join(", ")}` : ""}

Guidelines for IMPROVING their text:
- KEEP their main idea and what they actually did
- Use NATURAL action verbs (Built, Created, Improved, Worked on, Helped, Managed, Fixed, Updated, Developed)
- AVOID fancy buzzwords like "architected", "spearheaded", "leveraged", "facilitated", "orchestrated"
- Write like a normal person would describe their work - clear and honest
- Add specific results when possible (e.g., "improved load time by 30%", "reduced bugs by half")
- Keep it under 150 characters
- Be specific about what they actually did
- Make it ATS-friendly (clear, scannable)
- Sound confident but not pretentious
- If they mentioned technologies, keep them
- If they mentioned metrics, keep them and make them specific

Return ONLY the improved bullet point text, nothing else. No quotation marks, no preamble, no explanation.`;

  try {
    console.log(" Calling OpenRouter API to improve bullet...");

    const completion = await openai.chat.completions.create({
      model: "anthropic/claude-sonnet-4.5",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    console.log("✅ OpenRouter API responded successfully");

    const text = completion.choices[0]?.message?.content || "";

    if (!text || text.trim().length === 0) {
      throw new Error("OpenRouter returned empty response");
    }

    return text.trim();
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message?.includes("API key")) {
        throw new Error(
          "Invalid API key. Please check your OPENROUTER_API_KEY in .env.local",
        );
      }
      if (error.message?.includes("rate")) {
        throw new Error("Rate limit exceeded. Please try again in a moment.");
      }
      if (
        error.message?.includes("credit") ||
        error.message?.includes("insufficient")
      ) {
        throw new Error(
          "Insufficient credits. Please add funds to your OpenRouter account.",
        );
      }
      throw new Error(`Failed to generate bullet point: ${error.message}`);
    }
    throw new Error("Failed to generate bullet point");
  }
}
