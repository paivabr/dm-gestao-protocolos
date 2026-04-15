import { COOKIE_NAME } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as auth from "../auth";
import { getSessionCookieOptions } from "./cookies";

function getBodyParam(req: Request, key: string): string | undefined {
  const value = (req.body as Record<string, unknown>)[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  /**
   * POST /api/auth/login - Login with username and password
   */
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const username = getBodyParam(req, "username");
    const password = getBodyParam(req, "password");

    if (!username || !password) {
      res.status(400).json({ error: "username and password are required" });
      return;
    }

    try {
      const result = await auth.loginUser(username, password);

      if (!result.success) {
        res.status(401).json({ error: result.error });
        return;
      }

      const cookieOptions = getSessionCookieOptions(req);
      const sessionDuration = 7 * 24 * 60 * 60 * 1000; // 7 days
      res.cookie(COOKIE_NAME, result.sessionToken, {
        ...cookieOptions,
        maxAge: sessionDuration,
      });

      res.json({ success: true, user: result.user });
    } catch (error) {
      console.error("[Auth] Login failed", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  /**
   * POST /api/auth/register - Register a new user
   */
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    const username = getBodyParam(req, "username");
    const email = getBodyParam(req, "email");
    const password = getBodyParam(req, "password");
    const name = getBodyParam(req, "name");

    if (!username || !email || !password || !name) {
      res.status(400).json({
        error: "username, email, password, and name are required",
      });
      return;
    }

    try {
      const result = await auth.registerUser(username, email, password, name);

      if (!result.success) {
        res.status(400).json({ error: result.error });
        return;
      }

      const cookieOptions = getSessionCookieOptions(req);
      const sessionDuration = 7 * 24 * 60 * 60 * 1000; // 7 days
      res.cookie(COOKIE_NAME, result.sessionToken, {
        ...cookieOptions,
        maxAge: sessionDuration,
      });

      res.json({ success: true, user: result.user });
    } catch (error) {
      console.error("[Auth] Register failed", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });
}
