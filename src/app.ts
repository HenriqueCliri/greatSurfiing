import express from "express";
import beachRoutes from "./routes/beach.routes";

const app = express();

app.use(express.json());
app.use(beachRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

export default app;
