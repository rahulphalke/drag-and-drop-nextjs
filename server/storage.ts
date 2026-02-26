import { users, forms, submissions, connectedAccounts, type User, type InsertUser, type InsertForm, type Form, type Submission, type ConnectedAccount, type InsertConnectedAccount } from "@shared/schema";
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
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getForms(userId?: number): Promise<Form[]>;
  getForm(id: number): Promise<Form | undefined>;
  getFormByShareId(shareId: string): Promise<Form | undefined>;
  createForm(form: InsertForm, userId: number): Promise<Form>;
  updateForm(id: number, updates: Partial<InsertForm>): Promise<Form>;
  deleteForm(id: number): Promise<void>;
  // Submissions
  createSubmission(formId: number, data: any): Promise<Submission>;
  getSubmissions(formId: number): Promise<Submission[]>;
  // Connected Accounts
  getConnectedAccounts(userId: number): Promise<ConnectedAccount[]>;
  getConnectedAccount(id: number): Promise<ConnectedAccount | undefined>;
  getConnectedAccountByProviderId(provider: string, providerId: string): Promise<ConnectedAccount | undefined>;
  createConnectedAccount(account: InsertConnectedAccount): Promise<ConnectedAccount>;
  updateConnectedAccount(id: number, updates: Partial<InsertConnectedAccount>): Promise<ConnectedAccount>;
  deleteConnectedAccount(id: number): Promise<void>;
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
      connectedAccountId: insertForm.connectedAccountId ?? null,
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

  async deleteForm(id: number): Promise<void> {
    const idx = this.forms.findIndex((f) => f.id === id);
    if (idx !== -1) {
      this.forms.splice(idx, 1);
      // Also delete submissions for this form
      this.submissions = this.submissions.filter(s => s.formId !== id);
    }
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

  // Connected Accounts
  private connectedAccounts: ConnectedAccount[] = [];
  private accountId = 1;

  async getConnectedAccounts(userId: number): Promise<ConnectedAccount[]> {
    return this.connectedAccounts.filter(a => a.userId === userId);
  }

  async getConnectedAccount(id: number): Promise<ConnectedAccount | undefined> {
    return this.connectedAccounts.find(a => a.id === id);
  }

  async getConnectedAccountByProviderId(provider: string, providerId: string): Promise<ConnectedAccount | undefined> {
    return this.connectedAccounts.find(a => a.provider === provider && a.providerId === providerId);
  }

  async createConnectedAccount(insertAccount: InsertConnectedAccount): Promise<ConnectedAccount> {
    const account: ConnectedAccount = {
      ...insertAccount,
      id: this.accountId++,
      accessToken: insertAccount.accessToken,
      refreshToken: insertAccount.refreshToken ?? null,
      provider: insertAccount.provider || 'google',
      createdAt: new Date(),
    };
    this.connectedAccounts.push(account);
    return account;
  }

  async updateConnectedAccount(id: number, updates: Partial<InsertConnectedAccount>): Promise<ConnectedAccount> {
    const idx = this.connectedAccounts.findIndex(a => a.id === id);
    if (idx === -1) throw new Error("Account not found");
    this.connectedAccounts[idx] = { ...this.connectedAccounts[idx], ...updates };
    return this.connectedAccounts[idx];
  }

  async deleteConnectedAccount(id: number): Promise<void> {
    this.connectedAccounts = this.connectedAccounts.filter(a => a.id !== id);
  }

  // Users
  private users: User[] = [];
  private nextUserId = 1;

  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find(u => u.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: this.nextUserId++,
      createdAt: new Date(),
      password: insertUser.password ?? null,
      googleId: insertUser.googleId ?? null,
      avatar: insertUser.avatar ?? null,
    };
    this.users.push(user);
    return user;
  }
}

// --- Database storage (used when DATABASE_URL is set) ---
export class DatabaseStorage implements IStorage {
  private db: any;
  private formsTable: typeof forms;
  private submissionsTable: typeof submissions;
  private accountsTable: typeof connectedAccounts;
  private eq: any;
  private and: any;

  constructor(db: any, formsTable: typeof forms, submissionsTable: typeof submissions, accountsTable: typeof connectedAccounts, usersTable: typeof users, eq: any, and: any) {
    this.db = db;
    this.formsTable = formsTable;
    this.submissionsTable = submissionsTable;
    this.accountsTable = accountsTable;
    this.usersTable = usersTable;
    this.eq = eq;
    this.and = and;
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

  async deleteForm(id: number): Promise<void> {
    // Submissions should be deleted too if we have a cascade, 
    // but manually deleting them here to be safe and explicit if not.
    await this.db
      .delete(this.submissionsTable)
      .where(this.eq(this.submissionsTable.formId, id));

    await this.db
      .delete(this.formsTable)
      .where(this.eq(this.formsTable.id, id));
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

  // Connected Accounts
  async getConnectedAccounts(userId: number): Promise<ConnectedAccount[]> {
    return await this.db
      .select()
      .from(this.accountsTable)
      .where(this.eq(this.accountsTable.userId, userId));
  }

  async getConnectedAccount(id: number): Promise<ConnectedAccount | undefined> {
    const [account] = await this.db
      .select()
      .from(this.accountsTable)
      .where(this.eq(this.accountsTable.id, id));
    return account;
  }

  async getConnectedAccountByProviderId(provider: string, providerId: string): Promise<ConnectedAccount | undefined> {
    const [account] = await this.db
      .select()
      .from(this.accountsTable)
      .where(
        this.and(
          this.eq(this.accountsTable.provider, provider),
          this.eq(this.accountsTable.providerId, providerId)
        )
      );
    return account;
  }

  async createConnectedAccount(insertAccount: InsertConnectedAccount): Promise<ConnectedAccount> {
    const [account] = await this.db
      .insert(this.accountsTable)
      .values(insertAccount)
      .returning();
    return account;
  }

  async updateConnectedAccount(id: number, updates: Partial<InsertConnectedAccount>): Promise<ConnectedAccount> {
    const [updated] = await this.db
      .update(this.accountsTable)
      .set(updates)
      .where(this.eq(this.accountsTable.id, id))
      .returning();
    return updated;
  }

  async deleteConnectedAccount(id: number): Promise<void> {
    await this.db
      .delete(this.accountsTable)
      .where(this.eq(this.accountsTable.id, id));
  }

  // Users
  private usersTable: typeof users;

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await this.db.select().from(this.usersTable).where(this.eq(this.usersTable.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(this.usersTable).where(this.eq(this.usersTable.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await this.db.insert(this.usersTable).values(insertUser).returning();
    return user;
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
  const { eq, and } = await import("drizzle-orm");
  const pool = new pg.default.Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const db = drizzle(pool, { schema: { forms, submissions, connectedAccounts, users } });
  return new DatabaseStorage(db, forms, submissions, connectedAccounts, users, eq, and);
}

// Lazy singleton — avoids top-level await (not supported in CommonJS modules)
let _storage: IStorage | null = null;

export async function getStorage(): Promise<IStorage> {
  if (!_storage) {
    _storage = await createStorage();
  }
  return _storage;
}
