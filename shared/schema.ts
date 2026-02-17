
import { pgTable, text, serial, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Form Field Types definition for JSONB validation
export type FieldType = 'text' | 'dropdown' | 'checkbox' | 'radio' | 'date';

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For dropdown, radio
}

export const forms = pgTable("forms", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  fields: jsonb("fields").notNull().$type<FormField[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFormSchema = createInsertSchema(forms).omit({ id: true, createdAt: true });

export type Form = typeof forms.$inferSelect;
export type InsertForm = z.infer<typeof insertFormSchema>;
