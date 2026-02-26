import { Express } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { getStorage } from "./storage";

declare global {
    namespace Express {
        interface User {
            id: number;
            email: string;
            name: string;
            avatar?: string | null;
        }
    }
}

const PgSession = connectPgSimple(session);

// ─── Passport Strategies ──────────────────────────────────────────────────────

passport.use(
    new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
        const storage = await getStorage();
        try {
            const user = await storage.getUserByEmail(email);
            if (!user) return done(null, false, { message: "Incorrect email." });
            if (user.googleId && !user.password) return done(null, false, { message: "This account uses Google sign-in." });
            const valid = await bcrypt.compare(password, user.password!);
            if (!valid) return done(null, false, { message: "Incorrect password." });
            return done(null, { id: user.id, email: user.email, name: user.name, avatar: user.avatar });
        } catch (err) {
            return done(err);
        }
    })
);

// Google strategy — only configured if credentials are present
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: "/api/auth/google/callback",
                passReqToCallback: true,
                proxy: true, // Crucial for Vercel: tells passport to trust the X-Forwarded-* headers to build the correct absolute callback URL
            },
            async (req: any, accessToken: string, refreshToken: string, profile: any, done: any) => {
                try {
                    const email = profile.emails?.[0]?.value;
                    if (!email) return done(new Error("No email returned from Google"));

                    const storage = await getStorage();

                    // If user is already logged in, link the Google tokens to their CURRENT account
                    if (req.user) {
                        const existingAccount = await storage.getConnectedAccountByProviderId('google', profile.id);
                        if (existingAccount) {
                            if (existingAccount.userId !== req.user.id) {
                                return done(null, false, { message: "This Google account is already linked to another user." });
                            }
                            await storage.updateConnectedAccount(existingAccount.id, {
                                accessToken,
                                refreshToken: refreshToken || existingAccount.refreshToken,
                            });
                        } else {
                            await storage.createConnectedAccount({
                                userId: req.user.id,
                                provider: 'google',
                                providerId: profile.id,
                                email,
                                name: profile.displayName || email.split("@")[0],
                                accessToken,
                                refreshToken: refreshToken || null,
                            });
                        }
                        console.log(`[Auth] Linked Google account ${email} to user ${req.user.id}`);
                        // Keep current user session
                        return done(null, req.user);
                    }

                    // Otherwise, proceed with normal login/signup flow
                    const linkedin = await storage.getConnectedAccountByProviderId('google', profile.id);
                    if (linkedin) {
                        const user = await storage.getUser(linkedin.userId);
                        if (user) {
                            await storage.updateConnectedAccount(linkedin.id, {
                                accessToken,
                                refreshToken: refreshToken || linkedin.refreshToken,
                            });
                            return done(null, user);
                        }
                    }

                    // Check if email already exists
                    const byEmail = await storage.getUserByEmail(email);
                    if (byEmail) {
                        await storage.createConnectedAccount({
                            userId: byEmail.id,
                            provider: 'google',
                            providerId: profile.id,
                            email,
                            name: profile.displayName || email.split("@")[0],
                            accessToken,
                            refreshToken: refreshToken || null,
                        });
                        return done(null, byEmail);
                    }

                    // Create new user and connected_account
                    const created = await storage.createUser({
                        email,
                        name: profile.displayName || email.split("@")[0],
                        googleId: profile.id,
                        avatar: profile.photos?.[0]?.value || null,
                        password: null
                    });

                    await storage.createConnectedAccount({
                        userId: created.id,
                        provider: 'google',
                        providerId: profile.id,
                        email,
                        name: profile.displayName || email.split("@")[0],
                        accessToken,
                        refreshToken: refreshToken || null,
                    });

                    return done(null, created);
                } catch (err) {
                    return done(err as Error);
                }
            }
        )
    );
}

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id: number, done) => {
    const storage = await getStorage();
    try {
        const user = await storage.getUser(id);
        if (!user) return done(null, false);
        done(null, { id: user.id, email: user.email, name: user.name, avatar: user.avatar });
    } catch (err) {
        done(err);
    }
});

// ─── Setup Function ───────────────────────────────────────────────────────────

// Manually create the session table if it doesn't exist.
// We do this explicitly instead of using createTableIfMissing because
// connect-pg-simple uses __dirname to find table.sql, which breaks in
// bundled/tsx environments where __dirname points to dist/ instead of the package.
async function ensureSessionTable() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS "session" (
            "sid" varchar NOT NULL COLLATE "default",
            "sess" json NOT NULL,
            "expire" timestamp(6) NOT NULL,
            CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE
        ) WITH (OIDS=FALSE);
    `);
    await pool.query(`
        CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
    `);
}

export async function setupAuth(app: Express) {
    await ensureSessionTable();

    app.use(
        session({
            store: new PgSession({
                pool,
                tableName: "session",
            }),
            secret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
            proxy: true,
            resave: false,
            saveUninitialized: false,
            cookie: {
                httpOnly: true,
                secure: app.get("env") === "production" && !!process.env.VERCEL, // Set to true only on Vercel to avoid dropping on localhost http
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            },
        })
    );
    app.use(passport.initialize());
    app.use(passport.session());
}

export { passport };
