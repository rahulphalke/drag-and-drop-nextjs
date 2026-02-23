import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useLogin, useRegister, useUser } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
    const [, navigate] = useLocation();
    const { data: user, isLoading } = useUser();
    const { toast } = useToast();

    const [tab, setTab] = useState<"login" | "register">("login");
    const [form, setForm] = useState({ name: "", email: "", password: "" });

    const loginMutation = useLogin();
    const registerMutation = useRegister();

    // Redirect if already logged in
    useEffect(() => {
        if (!isLoading && user) navigate("/");
    }, [user, isLoading, navigate]);

    const pending = loginMutation.isPending || registerMutation.isPending;

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            if (tab === "login") {
                await loginMutation.mutateAsync({ email: form.email, password: form.password });
            } else {
                await registerMutation.mutateAsync({ email: form.email, password: form.password, name: form.name });
            }
            navigate("/");
        } catch (err: any) {
            toast({
                title: tab === "login" ? "Login failed" : "Registration failed",
                description: err.message || "Something went wrong.",
                variant: "destructive",
            });
        }
    }

    function handleGoogle() {
        window.location.href = "/api/auth/google";
    }

    if (isLoading) {
        return (
            <div className="login-loading">
                <div className="login-spinner" />
            </div>
        );
    }

    return (
        <div className="login-root">
            {/* Background blobs */}
            <div className="login-blob login-blob-1" />
            <div className="login-blob login-blob-2" />
            <div className="login-blob login-blob-3" />

            <div className="login-card">
                {/* Logo / Brand */}
                <div className="login-brand">
                    <div className="login-logo">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="3" width="7" height="7" rx="1.5" fill="white" opacity="0.9" />
                            <rect x="14" y="3" width="7" height="7" rx="1.5" fill="white" opacity="0.6" />
                            <rect x="3" y="14" width="7" height="7" rx="1.5" fill="white" opacity="0.6" />
                            <rect x="14" y="14" width="7" height="7" rx="1.5" fill="white" opacity="0.9" />
                        </svg>
                    </div>
                    <span className="login-brand-name">FormCraft</span>
                </div>

                <h1 className="login-title">
                    {tab === "login" ? "Welcome back" : "Create your account"}
                </h1>
                <p className="login-subtitle">
                    {tab === "login"
                        ? "Sign in to access your form builder"
                        : "Start building beautiful forms for free"}
                </p>

                {/* Tab switcher */}
                <div className="login-tabs">
                    <button
                        className={`login-tab ${tab === "login" ? "login-tab--active" : ""}`}
                        onClick={() => setTab("login")}
                        type="button"
                    >
                        Sign In
                    </button>
                    <button
                        className={`login-tab ${tab === "register" ? "login-tab--active" : ""}`}
                        onClick={() => setTab("register")}
                        type="button"
                    >
                        Create Account
                    </button>
                </div>

                {/* Google button */}
                <button className="login-google-btn" onClick={handleGoogle} type="button">
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </button>

                {/* Divider */}
                <div className="login-divider">
                    <span>or continue with email</span>
                </div>

                {/* Form */}
                <form className="login-form" onSubmit={handleSubmit}>
                    {tab === "register" && (
                        <div className="login-field">
                            <label htmlFor="name" className="login-label">Full Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                placeholder="John Doe"
                                className="login-input"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    <div className="login-field">
                        <label htmlFor="email" className="login-label">Email address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            className="login-input"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="login-field">
                        <label htmlFor="password" className="login-label">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete={tab === "login" ? "current-password" : "new-password"}
                            placeholder={tab === "register" ? "Min. 6 characters" : "••••••••"}
                            className="login-input"
                            value={form.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                        />
                    </div>

                    <button className="login-submit-btn" type="submit" disabled={pending}>
                        {pending ? (
                            <span className="login-btn-spinner" />
                        ) : tab === "login" ? (
                            "Sign In"
                        ) : (
                            "Create Account"
                        )}
                    </button>
                </form>

                <p className="login-footer">
                    {tab === "login" ? "Don't have an account? " : "Already have an account? "}
                    <button
                        className="login-footer-link"
                        onClick={() => setTab(tab === "login" ? "register" : "login")}
                        type="button"
                    >
                        {tab === "login" ? "Create one" : "Sign in"}
                    </button>
                </p>
            </div>
        </div>
    );
}
