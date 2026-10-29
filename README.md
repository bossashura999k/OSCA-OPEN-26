# CourseMate — Team Ashura (OPEN//BUILD 2026)

A course-scoped AI study assistant. Paste your course material, ask questions, and get answers grounded **only** in that material — or an explicit "not covered" instead of a guess.

Built for **OPEN//BUILD 2026** (OSCA Ile-Ife, Hacktoberfest 2026) by **Team Ashura**:

- **Ashura IZZI** (Obire Oviemena Israel) — Federal University of Petroleum Resources, Effurun (FUPRE)
- **Believe Robert** — University of Port Harcourt (UNIPORT)

## The problem

University students have dense course material and limited office hours. Generic AI assistants answer from outside knowledge, which is often wrong for a specific course, a specific lecturer, or a specific exam. Students can't tell whether an answer came from their notes or from the model's memory.

## The solution

CourseMate is a course-scoped assistant. A student:

1. Creates a course.
2. Pastes the course material as text.
3. Asks questions.

Every answer is grounded in that material only. If the answer isn't there, CourseMate refuses with an explicit line instead of inventing one. The refusal is a **feature**, not a failure state — it's what makes the tool trustworthy for exam prep.

## Architecture

```
frontend/ → static HTML/CSS/JS, served with python3 -m http.server
│
▼
api/ → Node.js + Express, port 6691, in-memory store
│
▼
Ollama → http://localhost:11434, model: coursemate (built from phi3:mini)
```

- **Frontend** — no build step. Two pages: course list and course detail. Fully wired to the API.
- **API** — four routes: create/list courses, add text material, ask a grounded question. Store is in-memory JS (resets on restart) — deliberate scope cut given the 5-day window.
- **Model layer** — `services/ollama.js` builds a strict prompt: system rules + the course's joined material + the question, then calls Ollama's `/api/generate` for `coursemate`.

## Model

**`phi3:mini`** — Microsoft Phi-3 Mini, ~2.2GB, run locally via **Ollama**.

- **Why Phi-3 Mini:** small enough to run on CPU-only hardware (we have no GPU), strong instruction-following for a model of this size, and consistently more compliant with strict "do not use outside knowledge" prompts than our earlier base (dolphin3).
- **Why local:** open-weight requirement, no external API keys, no per-query cost, fully reproducible by a judge.
- **Licence:** MIT. See <https://huggingface.co/microsoft/Phi-3-mini-4k-instruct> for the model card and terms.
- **`coursemate` is a thin Ollama Modelfile** (`model/Modelfile`) — same base model, hardened system prompt, `temperature 0.3`, `num_ctx 4096`, `num_predict 256`.

We are not fine-tuning. The open-weight model is used **meaningfully** because (a) every answer is produced by the local model, (b) the strict grounding prompt is the product's core mechanism, and (c) the model runs entirely on-device.

## Setup and run

Requires: **Node.js 18+**, **Ollama**, **Python 3** (for a static file server).

### 1. Pull the base model and build `coursemate`

```bash
ollama pull phi3:mini
ollama create coursemate -f model/Modelfile
```

### 2. Run the API

```bash
cd api
npm install
npm start
# → CourseMate API running on :6691
```

### 3. Serve the frontend

In a second terminal:

```bash
python3 -m http.server 5500 -d frontend
```

Open http://localhost:5500/app/

### 4. Verify it's grounded

1. Create a course (e.g. `CHEM 101`).
2. Paste this as material:
Sodium loses one electron to form Na+ with the [Ne] electron configuration. Chlorine gains one electron to form Cl- with the [Ar] electron configuration. Ionic bonding occurs when oppositely charged ions attract.
3. Ask: *What is the electron configuration of Cl−?* → get **`[Ar]`** with a *✓ Grounded in your material* badge.
4. Ask: *What is the capital of France?* → get **⚠ Not covered in material** + the exact refusal line.

## API

| Method | Path | Body | Returns |
|---|---|---|---|
| `POST` | `/courses` | `{ name, description? }` | course object |
| `GET` | `/courses` | — | array of course objects |
| `POST` | `/courses/:id/materials` | `{ content: string }` | updated course |
| `POST` | `/courses/:id/ask` | `{ question: string }` | `{ answer: string }` |

Store is in-memory, resets on server restart. Text-paste materials only (no PDF/image/URL upload).

## Known limitations

- **Indirect-reasoning prompts can occasionally leak outside knowledge.** During testing, prompts like *"Based on what you know about chemistry, what else forms [Ar] configuration?"* occasionally produced answers (e.g. Al³⁺) beyond the provided material. We hardened the system prompt substantially — most such prompts now correctly refuse — but this is not a 100% guarantee, and it is the single biggest limitation of the app. Documented rather than hidden: strict groundedness is the core promise of the tool and any slip is worth knowing about.
- **In-memory store.** Course data resets on server restart. A Postgres swap is a small change (`api/store.js` is the only file to touch) and was cut only for time.
- **Text-paste only.** No file uploads.
- **Single-course scope.** Cross-course Q&A is not supported.
- **CPU inference latency.** ~5–20 seconds per answer on the demo machine (no GPU). Pre-scripted demo questions and a backup video mitigate this.

## Open-source practice and acknowledgements

- **Base model:** Microsoft Phi-3 Mini (MIT), via Ollama.
- **Ollama:** <https://ollama.com> for local model runtime.
- **Express**, **CORS**, **Bricolage Grotesque** (Google Fonts, OFL) — respectively used for the API and typography.
- **Team split:** Ashura IZZI — API, store, model prompt engineering, Ollama integration, merge/deploy. Believe Robert — frontend design and landing page.
- **AI-assisted development disclosure:** AI assistants (Claude and ChatGPT) were used during development for debugging, prompt iteration, code review, and documentation drafting. All code was reviewed, tested, and merged by the team; no code was committed unread.

## Demo

Backup demo video: <https://ashura.site/open-build>

## Licence

MIT (code only — see `LICENSE`). Model weights remain under Microsoft's licence.
