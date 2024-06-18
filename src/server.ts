import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { corsConfig } from "./config/cors";
import morgan from "morgan";
import { connectDB } from "./config/db";
import projectRoutes from "./routes/projectRoutes";
import { authRoutes } from "./routes/authRoutes";

dotenv.config();

connectDB();

const app = express();

app.use(cors(corsConfig));

// LOGGING
app.use(morgan("dev"));

//READ FORMDATA

app.use(express.json());

// DEFAULT
app.get('/test', (req, res) => {
    res.send('Prueba')
})

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

export default app;
