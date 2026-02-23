
import type { Express } from "express";
import type { Server } from "http";
import { getStorage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { passport } from "./auth";

// ─── Auth middleware ──────────────────────────────────────────────────────────

function requireAuth(req: any, res: any, next: any) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "Unauthorized" });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const storage = await getStorage();

  // ── Auth routes ─────────────────────────────────────────────────────────────

  // POST /api/auth/register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, name } = z
        .object({
          email: z.string().email(),
          password: z.string().min(6),
          name: z.string().min(1),
        })
        .parse(req.body);

      const [existing] = await db.select().from(users).where(eq(users.email, email));
      if (existing) {
        return res.status(409).json({ message: "An account with this email already exists." });
      }

      const hashed = await bcrypt.hash(password, 12);
      const [user] = await db
        .insert(users)
        .values({ email, password: hashed, name })
        .returning();

      // Log in immediately after registration
      req.login({ id: user.id, email: user.email, name: user.name, avatar: user.avatar }, (err: any) => {
        if (err) return res.status(500).json({ message: "Login after registration failed." });
        res.status(201).json({ id: user.id, email: user.email, name: user.name, avatar: user.avatar });
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // POST /api/auth/login
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Login failed." });
      req.login(user, (loginErr: any) => {
        if (loginErr) return next(loginErr);
        res.json({ id: user.id, email: user.email, name: user.name, avatar: user.avatar });
      });
    })(req, res, next);
  });

  // POST /api/auth/logout
  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Logout failed." });
      res.json({ message: "Logged out successfully." });
    });
  });

  // GET /api/auth/me
  app.get("/api/auth/me", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    res.json(req.user);
  });

  // GET /api/auth/google
  app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

  // GET /api/auth/google/callback
  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login?error=google" }),
    (_req, res) => res.redirect("/")
  );

  // ── Form routes ──────────────────────────────────────────────────────────────

  // GET /api/forms
  app.get(api.forms.list.path, requireAuth, async (req, res) => {
    const forms = await storage.getForms(req.user!.id);
    res.json(forms);
  });

  // GET /api/forms/:id
  app.get(api.forms.get.path, async (req, res) => {
    const form = await storage.getForm(Number(req.params.id));
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Hide integration secrets from non-owners
    if (!req.user || (req.user as any).id !== form.userId) {
      const safeForm = { ...form, whatsappNumber: null, googleSheetUrl: null };
      return res.json(safeForm);
    }

    res.json(form);
  });

  // POST /api/forms
  app.post(api.forms.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.forms.create.input.parse(req.body);
      const form = await storage.createForm(input, req.user!.id);
      res.status(201).json(form);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // PUT /api/forms/:id
  app.put(api.forms.update.path, async (req, res) => {
    try {
      const input = api.forms.update.input.parse(req.body);
      const form = await storage.updateForm(Number(req.params.id), input);
      res.json(form);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      return res.status(404).json({ message: 'Form not found' });
    }
  });

  // POST /api/forms/save
  app.post('/api/forms/save', requireAuth, async (req, res) => {
    try {
      const body = req.body;
      if (body.id) {
        // Protect updates: ensure user owns the form
        const existingForm = await storage.getForm(Number(body.id));
        if (!existingForm || existingForm.userId !== req.user!.id) {
          return res.status(403).json({ message: "You don't have permission to edit this form" });
        }

        const input = api.forms.update.input.parse(body);
        const form = await storage.updateForm(Number(body.id), input);
        res.json(form);
      } else {
        const input = api.forms.create.input.parse(body);
        const form = await storage.createForm(input, req.user!.id);
        res.status(201).json(form);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // ── Submission routes ────────────────────────────────────────────────────────

  // POST /api/forms/:formId/submissions
  app.post(api.submissions.create.path, async (req, res) => {
    try {
      const formId = Number(req.params.formId);
      const form = await storage.getForm(formId);
      if (!form) {
        return res.status(404).json({ message: "Form not found" });
      }

      const submission = await storage.createSubmission(formId, req.body);

      console.log(`New submission for form ${formId}. Integration settings:`, {
        whatsappNumber: form.whatsappNumber,
        googleSheetUrl: form.googleSheetUrl
      });

      // Google Sheets Integration
      if (form.googleSheetUrl) {
        try {
          // Use global fetch (Node 18+)
          fetch(form.googleSheetUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              formTitle: form.title,
              submissionId: submission.id,
              submittedAt: submission.createdAt,
              data: req.body
            }),
          }).catch(err => console.error("Google Sheets async error:", err));
        } catch (err) {
          console.error("Failed to initiate Google Sheets POST:", err);
        }
      }

      res.status(201).json(submission);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // GET /api/forms/:formId/submissions
  app.get(api.submissions.list.path, requireAuth, async (req, res) => {
    try {
      const formId = Number(req.params.formId);
      const form = await storage.getForm(formId);

      if (!form) {
        return res.status(404).json({ message: "Form not found" });
      }
      if (form.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "You don't have permission to view these submissions" });
      }

      const submissions = await storage.getSubmissions(formId);
      res.json(submissions);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  await seedDatabase();
  return httpServer;
}

// Seed function to create an example form if none exist
export async function seedDatabase() {
  const storage = await getStorage();
  const forms = await storage.getForms();
  if (forms.length === 0) {
    const hashed = await bcrypt.hash("password123", 12);
    let user;
    try {
      [user] = await db
        .insert(users)
        .values({ email: "demo@example.com", password: hashed, name: "Demo User" })
        .returning();
    } catch {
      const [existing] = await db.select().from(users).where(eq(users.email, "demo@example.com"));
      user = existing;
    }

    if (user) {
      await storage.createForm({
        title: "Contact Us",
        fields: [
          { id: "name-field", type: "text", label: "Full Name", placeholder: "John Doe", required: true },
          { id: "email-field", type: "text", label: "Email Address", placeholder: "john@example.com", required: true },
          { id: "message-field", type: "text", label: "Message", placeholder: "How can we help you?", required: true },
        ],
      }, user.id);
      console.log("Seeded database with example form linked to Demo User");
    }
  }
}
