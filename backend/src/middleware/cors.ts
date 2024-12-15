// src/middlewares/cors.ts
import { cors } from "hono/cors";

export const corsMiddleware = cors({
  origin: (origin) => {
    const allowedOrigins = [
      "https://blog-jyotsna-kumars-projects.vercel.app",
      "http://localhost:5173",
    ];
    return allowedOrigins.includes(origin) ? origin : "";
  },
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
});
