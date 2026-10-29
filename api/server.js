import express from "express";
import cors from "cors";
import coursesRouter from "./routes/courses.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use("/courses", coursesRouter);

const PORT = process.env.PORT || 6691;
app.listen(PORT, () => console.log(`CourseMate API running on :${PORT}`));