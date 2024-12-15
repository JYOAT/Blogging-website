// src/middlewares/cors.ts
import { MiddlewareHandler } from "hono";

export const corsMiddleware: MiddlewareHandler = async (c, next) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "https://blog-git-master-jyotsna-kumars-projects.vercel.app",
  ];
  const origin = c.req.header("Origin");

  if (origin && allowedOrigins.includes(origin)) {
    c.header("Access-Control-Allow-Origin", origin);
    c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    c.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    c.header("Access-Control-Allow-Credentials", "true");
  }

  if (c.req.method === "OPTIONS") {
    return c.text("", 204);
  }

  await next();
};
