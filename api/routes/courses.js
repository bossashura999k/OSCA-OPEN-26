import { Router } from "express";
import { createCourse, getCourse, addMaterial, listCourses } from "../store.js";
import { askCourseMate } from "../services/ollama.js";

const router = Router();

router.post("/:id/materials", (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: "content is required" });
  const course = addMaterial(req.params.id, content);
  if (!course) return res.status(404).json({ error: "course not found" });
  res.json(course);
});

router.post("/:id/ask", async (req, res) => {
  const { question } = req.body;
  const course = getCourse(req.params.id);
  if (!course) return res.status(404).json({ error: "course not found" });
  if (!question) return res.status(400).json({ error: "question is required" });

  const material = course.materials.join("\n\n");
  try {
    const answer = await askCourseMate(material, question);
    res.json({ answer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: "name is required" });
  res.json(createCourse(name, description));
});

router.get("/", (req, res) => {
  res.json(listCourses());
});

export default router;