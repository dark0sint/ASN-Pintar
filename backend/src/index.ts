import express from "express";
import cors from "cors";
import path from "path";
import { config } from "./config";

import { authRouter } from "./routes/auth.routes";
import { usersRouter } from "./routes/users.routes";
import { coursesRouter } from "./routes/courses.routes";
import { progressRouter } from "./routes/progress.routes";
import { quizRouter } from "./routes/quiz.routes";
import { catRouter } from "./routes/cat.routes";
import { certificatesRouter } from "./routes/certificates.routes";
import { forumRouter } from "./routes/forum.routes";
import { tasksRouter } from "./routes/tasks.routes";
import { mentoringRouter } from "./routes/mentoring.routes";
import { liveClassRouter } from "./routes/liveclass.routes";
import { gamificationRouter } from "./routes/gamification.routes";
import { adminRouter } from "./routes/admin.routes";

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

// berkas sertifikat PDF yang sudah diterbitkan
app.use("/storage", express.static(path.join(__dirname, "..", "storage")));

app.get("/health", (_req, res) => res.json({ ok: true, service: "asn-pintar-backend" }));

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/progress", progressRouter);
app.use("/api/quiz", quizRouter);
app.use("/api/cat", catRouter);
app.use("/api/certificates", certificatesRouter);
app.use("/api/forum", forumRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/mentoring", mentoringRouter);
app.use("/api/live-classes", liveClassRouter);
app.use("/api/gamification", gamificationRouter);
app.use("/api/admin", adminRouter);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Terjadi kesalahan pada server." });
});

app.listen(config.port, () => {
  console.log(`ASN Pintar backend berjalan di port ${config.port}`);
});
