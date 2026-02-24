
import { pgTable, text, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password"), // null for OAuth-only users
  name: text("name").notNull(),
  googleId: text("google_id").unique(),
  avatar: text("avatar"),
  googleRefreshToken: text("google_refresh_token"), // For Sheets API offline access
  googleAccessToken: text("google_access_token"),   // Cached access token
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true })
  .extend({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters").nullable().optional(),
    name: z.string().min(1, "Name is required"),
  });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// ─── Forms ────────────────────────────────────────────────────────────────────

export type FieldType = 'text' | 'textarea' | 'email' | 'number' | 'phone' | 'rating' | 'title' | 'dropdown' | 'checkbox' | 'radio' | 'date';

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

export const forms = pgTable("forms", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  shareId: text("share_id").notNull().unique(), // Added unique share token
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  fields: jsonb("fields").notNull().$type<FormField[]>(),
  whatsappNumber: text("whatsapp_number"),
  googleSheetId: text("google_sheet_id"),     // Direct sheet ID
  googleSheetName: text("google_sheet_name"),   // Display name for UI
  submitButtonText: text("submit_button_text"),
  createdAt: timestamp("created_at").defaultNow(),
});

const formFieldSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'textarea', 'email', 'number', 'phone', 'rating', 'title', 'dropdown', 'checkbox', 'radio', 'date']),
  label: z.string(),
  placeholder: z.string().optional(),
  required: z.boolean(),
  options: z.array(z.string()).optional(),
});

export const insertFormSchema = createInsertSchema(forms)
  .omit({ id: true, createdAt: true, userId: true, shareId: true })
  .extend({
    fields: z.array(formFieldSchema),
    slug: z.string().optional(),
    whatsappNumber: z.string().optional().nullable(),
    googleSheetId: z.string().optional().nullable(),
    googleSheetName: z.string().optional().nullable(),
    submitButtonText: z.string().optional().nullable(),
  });

export type Form = typeof forms.$inferSelect;
export type InsertForm = z.infer<typeof insertFormSchema>;

// ─── Submissions ──────────────────────────────────────────────────────────────

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  formId: integer("form_id").notNull(),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSubmissionSchema = createInsertSchema(submissions)
  .omit({ id: true, createdAt: true });

export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
