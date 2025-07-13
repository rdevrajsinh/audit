// auth.ts
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  return session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // use true if on HTTPS
      maxAge: sessionTtl,
    },
  });
}

export function setupAuth(app: Express) {
  app.use(getSession());

  // Simulated login route
  app.post("/api/login", async (req, res) => {
    // You can replace this with real form login in future
    const demoUser = {
      id: "demo-user-id",
      email: "demo@example.com",
      firstName: "Demo",
      lastName: "User",
      organizationId: 1,
    };

    req.session.user = demoUser;
    await storage.upsertUser(demoUser); // Create or update in DB
    res.json({ message: "Logged in", user: demoUser });
  });

  app.get("/api/auth/user", (req, res) => {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.json(req.session.user);
  });

  app.get("/api/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};
