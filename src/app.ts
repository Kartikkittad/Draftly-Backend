import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.route";
import templateRoutes from "./routes/template.route";
import fileRoutes from "./routes/file.route";
import setupSwagger from "./swagger";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/templates", templateRoutes);
app.use("/files", fileRoutes);

setupSwagger(app);

export default app;
