
import { db } from "./db";
import { forms, type InsertForm, type Form } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getForms(): Promise<Form[]>;
  getForm(id: number): Promise<Form | undefined>;
  createForm(form: InsertForm): Promise<Form>;
  updateForm(id: number, form: Partial<InsertForm>): Promise<Form>;
}

export class DatabaseStorage implements IStorage {
  async getForms(): Promise<Form[]> {
    return await db.select().from(forms);
  }

  async getForm(id: number): Promise<Form | undefined> {
    const [form] = await db.select().from(forms).where(eq(forms.id, id));
    return form;
  }

  async createForm(insertForm: InsertForm): Promise<Form> {
    const [form] = await db.insert(forms).values(insertForm).returning();
    return form;
  }

  async updateForm(id: number, updates: Partial<InsertForm>): Promise<Form> {
    const [updated] = await db
      .update(forms)
      .set(updates)
      .where(eq(forms.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
