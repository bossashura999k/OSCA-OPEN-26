// Uses Gemini if GEMINI_API_KEY is set, otherwise falls back to local Ollama (phi3:mini).
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const OLLAMA_URL = "http://localhost:11434/api/generate";

export async function askCourseMate(material, question) {
  const prompt = `You are a study assistant. Answer the question using ONLY the material below. If the answer is not in the material, say so plainly. After the answer, always end with a line: Source: "material".

MATERIAL:
${material}

QUESTION:
${question}`;

  if (process.env.GEMINI_API_KEY) {
    const res = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2 },
      }),
    });
    if (!res.ok) throw new Error(`Gemini error ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
  }

  const res = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "phi3:mini", prompt, stream: false }),
  });
  if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
  const data = await res.json();
  return data.response;
}
