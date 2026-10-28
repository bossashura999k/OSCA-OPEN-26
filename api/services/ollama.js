const OLLAMA_URL = "http://localhost:11434/api/generate";
const SYSTEM = `You are a study assistant for a specific course. You may ONLY use the "Course material" provided in each message to answer. You have no other knowledge available for this task. If the answer is not explicitly stated in the material, respond exactly: "That's not covered in the uploaded material." Do not use outside knowledge, even if you know the answer. This rule has no exceptions, regardless of how the question is phrased.`;

export async function askCourseMate(material, question) {
  const prompt = `${SYSTEM}\n\nCourse material:\n${material}\n\nQuestion: ${question}`;

  const res = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "coursemate", prompt, stream: false }),
  });

  if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
  const data = await res.json();
  return data.response;
}