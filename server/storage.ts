import { forms, submissions, type InsertForm, type Form, type Submission } from "@shared/schema";
import { nanoid } from "nanoid";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")     // Replace spaces with -
    .replace(/[^\w-]+/g, "")    // Remove all non-word chars
    .replace(/--+/g, "-");    // Replace multiple - with single -
}

export interface IStorage {
  getForms(userId?: number): Promise<Form[]>;
  getForm(id: number): Promise<Form | undefined>;
  getFormByShareId(shareId: string): Promise<Form | undefined>;
  createForm(form: InsertForm, userId: number): Promise<Form>;
  updateForm(id: number, updates: Partial<InsertForm>): Promise<Form>;
  // Submissions
  createSubmission(formId: number, data: any): Promise<Submission>;
  getSubmissions(formId: number): Promise<Submission[]>;
}

// --- In-memory storage (used when DATABASE_URL is not set) ---
export class MemoryStorage implements IStorage {
  private forms: Form[] = [];
  private submissions: Submission[] = [];
  private nextId = 1;
  private submissionId = 1;

  async getForms(userId?: number): Promise<Form[]> {
    if (userId !== undefined) {
      return this.forms.filter(f => f.userId === userId);
    }
    return this.forms;
  }

  async getForm(id: number): Promise<Form | undefined> {
    return this.forms.find((f) => f.id === id);
  }

  async getFormByShareId(shareId: string): Promise<Form | undefined> {
    return this.forms.find((f) => f.shareId === shareId);
  }

  async createForm(insertForm: InsertForm, userId: number): Promise<Form> {
    const form: Form = {
      createdAt: new Date(),
      whatsappNumber: insertForm.whatsappNumber ?? null,
      googleSheetId: insertForm.googleSheetId ?? null,
      googleSheetName: insertForm.googleSheetName ?? null,
      submitButtonText: (insertForm as any).submitButtonText ?? null,
      ...insertForm,
      id: this.nextId++,
      userId,
      shareId: nanoid(12),
      slug: (insertForm as any).slug || slugify(insertForm.title),
    };
    this.forms.push(form);
    return form;
  }

  async updateForm(id: number, updates: Partial<InsertForm>): Promise<Form> {
    const idx = this.forms.findIndex((f) => f.id === id);
    if (idx === -1) throw new Error(`Form ${id} not found`);

    const newUpdates: any = { ...updates };
    // Only auto-generate slug from title if no explicit slug provided
    if (updates.title && !(updates as any).slug) {
      newUpdates.slug = slugify(updates.title);
    }

    this.forms[idx] = { ...this.forms[idx], ...newUpdates };
    return this.forms[idx];
  }

  async createSubmission(formId: number, data: any): Promise<Submission> {
    const submission: Submission = {
      id: this.submissionId++,
      formId,
      data,
      createdAt: new Date(),
    };
    this.submissions.push(submission);
    return submission;
  }

  async getSubmissions(formId: number): Promise<Submission[]> {
    return this.submissions.filter(s => s.formId === formId);
  }
}

// --- Database storage (used when DATABASE_URL is set) ---
export class DatabaseStorage implements IStorage {
  private db: any;
  private formsTable: typeof forms;
  private submissionsTable: typeof submissions;
  private eq: any;

  constructor(db: any, formsTable: typeof forms, submissionsTable: typeof submissions, eq: any) {
    this.db = db;
    this.formsTable = formsTable;
    this.submissionsTable = submissionsTable;
    this.eq = eq;
  }

  async getForms(userId?: number): Promise<Form[]> {
    let query = this.db.select().from(this.formsTable);
    if (userId !== undefined) {
      query = query.where(this.eq(this.formsTable.userId, userId));
    }
    return await query;
  }

  async getForm(id: number): Promise<Form | undefined> {
    const [form] = await this.db
      .select()
      .from(this.formsTable)
      .where(this.eq(this.formsTable.id, id));
    return form;
  }

  async getFormByShareId(shareId: string): Promise<Form | undefined> {
    const [form] = await this.db
      .select()
      .from(this.formsTable)
      .where(this.eq(this.formsTable.shareId, shareId));
    return form;
  }

  async createForm(insertForm: InsertForm, userId: number): Promise<Form> {
    const [form] = await this.db
      .insert(this.formsTable)
      .values({
        ...insertForm,
        userId,
        shareId: nanoid(12),
        slug: (insertForm as any).slug || slugify(insertForm.title),
      })
      .returning();
    return form;
  }

  async updateForm(id: number, updates: Partial<InsertForm>): Promise<Form> {
    const dbUpdates: any = { ...updates };
    // Only auto-generate slug from title if no explicit slug provided
    if (updates.title && !(updates as any).slug) {
      dbUpdates.slug = slugify(updates.title);
    }

    const [updated] = await this.db
      .update(this.formsTable)
      .set(dbUpdates)
      .where(this.eq(this.formsTable.id, id))
      .returning();
    return updated;
  }

  async createSubmission(formId: number, data: any): Promise<Submission> {
    const [submission] = await this.db
      .insert(this.submissionsTable)
      .values({ formId, data })
      .returning();
    return submission;
  }

  async getSubmissions(formId: number): Promise<Submission[]> {
    return await this.db
      .select()
      .from(this.submissionsTable)
      .where(this.eq(this.submissionsTable.formId, formId));
  }
}

// --- Choose storage implementation at startup ---
async function createStorage(): Promise<IStorage> {
  if (!process.env.DATABASE_URL) {
    console.warn(
      "[storage] DATABASE_URL is not set — using in-memory storage. Data will not persist between restarts."
    );
    return new MemoryStorage();
  }

  const { drizzle } = await import("drizzle-orm/node-postgres");
  const pg = await import("pg");
  const { eq } = await import("drizzle-orm");
  const pool = new pg.default.Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const db = drizzle(pool, { schema: { forms, submissions } });
  return new DatabaseStorage(db, forms, submissions, eq);
}

// Lazy singleton — avoids top-level await (not supported in CommonJS modules)
let _storage: IStorage | null = null;

export async function getStorage(): Promise<IStorage> {
  if (!_storage) {
    _storage = await createStorage();
  }
  return _storage;
}
