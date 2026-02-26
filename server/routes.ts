
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
import { google } from "googleapis";

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
  app.get("/api/auth/google", passport.authenticate("google", {
    scope: [
      "profile",
      "email",
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive.metadata.readonly"
    ],
    accessType: "offline",
    prompt: "consent",
  }));

  // GET /api/auth/google/callback
  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login?error=google" }),
    (_req, res) => res.redirect("/")
  );

  // PATCH /api/auth/password
  app.patch("/api/auth/password", requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = z
        .object({
          currentPassword: z.string(),
          newPassword: z.string().min(6),
        })
        .parse(req.body);

      const [user] = await db.select().from(users).where(eq(users.id, req.user!.id));
      if (!user || !user.password) {
        return res.status(400).json({ message: "Current password verification failed or account type mismatch." });
      }

      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Incorrect current password" });
      }

      const hashed = await bcrypt.hash(newPassword, 12);
      await db.update(users).set({ password: hashed }).where(eq(users.id, req.user!.id));

      res.json({ message: "Password updated successfully" });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // GET /api/accounts
  app.get("/api/accounts", requireAuth, async (req, res) => {
    try {
      const storage = await getStorage();
      const accounts = await storage.getConnectedAccounts(req.user!.id);
      res.json(accounts.map(a => ({
        id: a.id,
        provider: a.provider,
        email: a.email,
        name: a.name,
        createdAt: a.createdAt
      })));
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch connected accounts" });
    }
  });

  // DELETE /api/accounts/:id
  app.delete("/api/accounts/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const storage = await getStorage();
      const account = await storage.getConnectedAccount(id);

      if (!account || account.userId !== req.user!.id) {
        return res.status(404).json({ message: "Account not found" });
      }

      await storage.deleteConnectedAccount(id);
      res.json({ message: "Account disconnected successfully" });
    } catch (err) {
      res.status(500).json({ message: "Failed to disconnect account" });
    }
  });

  // ── Form routes ──────────────────────────────────────────────────────────────

  // GET /api/forms
  app.get(api.forms.list.path, requireAuth, async (req, res) => {
    const forms = await storage.getForms(req.user!.id);
    res.json(forms);
  });

  // GET /api/forms/:id
  app.get(api.forms.get.path, requireAuth, async (req, res) => {
    const form = await storage.getForm(Number(req.params.id));
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Protect: ensure user owns the form
    if (form.userId !== (req.user as any).id) {
      return res.status(403).json({ message: "You don't have permission to access this form" });
    }

    res.json(form);
  });

  // GET /api/forms/public/:shareId
  app.get(api.forms.getPublic.path, async (req, res) => {
    const form = await storage.getFormByShareId(req.params.shareId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Strip sensitive integration secrets for public sharing, 
    // but keep whatsappNumber for client-side redirection
    console.log(`[GET public form] shareId: ${req.params.shareId}, whatsappNumber: ${form.whatsappNumber}`);
    const safeForm = { ...form, googleSheetId: null, googleSheetName: null };
    res.json(safeForm);
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

  // DELETE /api/forms/:id
  app.delete(api.forms.delete.path, requireAuth, async (req, res) => {
    const id = Number(req.params.id);
    const form = await storage.getForm(id);

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    if (form.userId !== req.user!.id) {
      return res.status(403).json({ message: "You don't have permission to delete this form" });
    }

    await storage.deleteForm(id);
    res.json({ message: "Form deleted successfully" });
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
        console.log(`[POST /api/forms/save] Updating form ${body.id}, whatsappNumber: ${input.whatsappNumber}`);
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

  // POST /api/forms/share/:shareId/submissions
  app.post(api.submissions.create.path, async (req, res) => {
    try {
      const shareId = req.params.shareId;
      const form = await storage.getFormByShareId(shareId);
      if (!form) {
        return res.status(404).json({ message: "Form not found" });
      }

      const formId = form.id;
      const submission = await storage.createSubmission(formId, req.body);

      // Handle Google Sheets integration if configured
      if (form.googleSheetId) {
        try {
          const storage = await getStorage();
          let tokens;
          let accountToUpdateId: number | null = null;

          if (form.connectedAccountId) {
            const account = await storage.getConnectedAccount(form.connectedAccountId);
            if (account) {
              tokens = {
                accessToken: account.accessToken,
                refreshToken: account.refreshToken
              };
              accountToUpdateId = account.id;
            }
          }

          if (form.connectedAccountId) {
            const account = await storage.getConnectedAccount(form.connectedAccountId);
            if (account) {
              const oauth2Client = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET
              );

              oauth2Client.setCredentials({
                access_token: account.accessToken,
                refresh_token: account.refreshToken || undefined,
              });

              // Handle token refresh events
              oauth2Client.on('tokens', async (newTokens) => {
                if (newTokens.access_token) {
                  await storage.updateConnectedAccount(account.id, {
                    accessToken: newTokens.access_token,
                    refreshToken: newTokens.refresh_token || undefined
                  });
                  console.log(`[Google Sheets] Updated tokens for account ${account.id}`);
                }
              });

              const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

              // 3. Prepare human-readable data
              const headers = [...form.fields.map(f => f.label || f.id), 'Submitted At'];

              const rowData = [
                ...form.fields.map(f => {
                  const val = (req.body as any)[f.id];
                  return Array.isArray(val) ? val.join(', ') : (val?.toString() || '');
                }),
                new Date(submission.createdAt!).toLocaleString()
              ];

              console.log(`[Google Sheets] Appending to sheet ${form.googleSheetId}`);

              // 4. Check if sheet is empty to see if we need to write headers
              try {
                const getRes = await sheets.spreadsheets.values.get({
                  spreadsheetId: form.googleSheetId as string,
                  range: 'A1:Z1', // Just check the first row
                });

                const hasHeaders = getRes.data.values && getRes.data.values.length > 0;
                const valuesToAppend = hasHeaders ? [rowData] : [headers, rowData];

                // 5. Append the data
                await sheets.spreadsheets.values.append({
                  spreadsheetId: form.googleSheetId as string,
                  range: 'A:Z',
                  valueInputOption: 'USER_ENTERED',
                  insertDataOption: 'INSERT_ROWS',
                  requestBody: {
                    values: valuesToAppend,
                  },
                });

                console.log(`[Google Sheets] Success for submission ${submission.id}`);
              } catch (err: any) {
                console.error(`[Google Sheets] Error appending to sheet:`, err.message);
              }
            } else {
              console.error(`[Google Sheets] Connected account ${form.connectedAccountId} not found.`);
            }
          } else if (form.googleSheetId) {
            console.error(`[Google Sheets] Form has sheet ID but no connected account ID.`);
          }
        } catch (err) {
          console.error("[Google Sheets] Complete error processing submission:", err);
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

  // GET /api/integrations/google/sheets
  // Fetches a list of the user's spreadsheets to show in the UI dropdown
  app.get("/api/integrations/google/sheets", requireAuth, async (req, res) => {
    try {
      const accountId = req.query.accountId ? parseInt(req.query.accountId as string) : null;
      const storage = await getStorage();

      let tokens;
      if (accountId) {
        const account = await storage.getConnectedAccount(accountId);
        if (!account || account.userId !== req.user!.id) {
          return res.status(404).json({ message: "Connected account not found" });
        }
        tokens = {
          accessToken: account.accessToken,
          refreshToken: account.refreshToken
        };
      } else {
        return res.status(400).json({ message: "No account selected" });
      }

      const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );

      auth.setCredentials({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken || undefined
      });

      // Handle token refreshes during listing
      auth.on('tokens', async (newTokens) => {
        if (newTokens.access_token) {
          await storage.updateConnectedAccount(accountId!, {
            accessToken: newTokens.access_token,
            refreshToken: newTokens.refresh_token || undefined
          });
          console.log(`[Google Sheets] Updated tokens for account ${accountId} during fetch`);
        }
      });

      console.log(`[Google Sheets] Starting fetch for account ${accountId}...`);
      const drive = google.drive({ version: 'v3', auth: auth });

      // Query Google Drive for files of type spreadsheet
      const response = await drive.files.list({
        q: "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
        fields: 'files(id, name)',
        orderBy: 'modifiedTime desc',
        pageSize: 50, // Let's limit to recent 50 for performance
      });

      console.log(`[Google Sheets] Successfully fetched ${response.data.files?.length || 0} sheets for account ${accountId}`);

      res.json(response.data.files || []);
    } catch (err: any) {
      console.error("[Google Sheets] Complete error fetching sheets:", err);
      // If token is expired and refresh failed, we might need them to re-auth
      if (err.message?.includes('invalid_grant')) {
        return res.status(401).json({ message: "Google connect expired. Please reconnect.", expires: true });
      }
      res.status(500).json({ message: "Failed to fetch Google Sheets" });
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
