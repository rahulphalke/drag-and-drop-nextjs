import { useState } from "react";
import { useUser } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Lock, FileSpreadsheet, CheckCircle2, XCircle, ExternalLink, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "password" | "google";

export default function Profile() {
    const { data: user } = useUser();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<Tab>("password");

    // Change Password Mutation
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const changePasswordMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/auth/password", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Failed to update password");
            }
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Success", description: "Password updated successfully" });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
            return;
        }
        changePasswordMutation.mutate({ currentPassword, newPassword });
    };

    // List Connected Accounts
    const { data: accounts, isLoading: isLoadingAccounts } = useQuery<any[]>({
        queryKey: ["/api/accounts"],
    });

    const deleteAccountMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`/api/accounts/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to disconnect account");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
            toast({ title: "Success", description: "Account disconnected successfully" });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    const isGoogleConnected = accounts && accounts.length > 0;

    const sidebarItems = [
        { id: "password", label: "Change Password", icon: Lock },
        { id: "google", label: "Google Sheet", icon: FileSpreadsheet },
    ];

    return (
        <div className="flex flex-col md:flex-row h-full min-h-[calc(100vh-4rem)] bg-background">
            {/* Sidebar */}
            <div className="w-full md:w-80 border-r border-border bg-muted/30 p-6 flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-bold font-display text-foreground mb-1">Account Settings</h1>
                    <p className="text-sm text-muted-foreground">Manage your security and integrations</p>
                </div>

                <nav className="flex flex-col gap-2">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as Tab)}
                            className={cn(
                                "flex items-center gap-3 p-3 rounded-xl transition-all font-medium text-sm group",
                                activeTab === item.id
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-white" : "text-muted-foreground group-hover:text-primary")} />
                            {item.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 md:p-12 max-w-4xl overflow-y-auto">
                {activeTab === "password" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-2xl font-bold font-display text-foreground">Change Password</h2>
                            <p className="text-muted-foreground">Update your account password to stay secure.</p>
                        </div>

                        <Card className="border-border/50 shadow-sm">
                            <form onSubmit={handlePasswordSubmit}>
                                <CardHeader>
                                    <CardTitle className="text-lg">Security Details</CardTitle>
                                    <CardDescription>Enter your current and new password below.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="current">Current Password</Label>
                                        <Input
                                            id="current"
                                            type="password"
                                            placeholder="••••••••"
                                            required
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new">New Password</Label>
                                        <Input
                                            id="new"
                                            type="password"
                                            placeholder="••••••••"
                                            required
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm">Confirm New Password</Label>
                                        <Input
                                            id="confirm"
                                            type="password"
                                            placeholder="••••••••"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-muted/30 border-t flex justify-end px-6 py-4">
                                    <Button type="submit" disabled={changePasswordMutation.isPending}>
                                        {changePasswordMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                        Update Password
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </div>
                )}

                {activeTab === "google" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-2xl font-bold font-display text-foreground">Google Sheet Integration</h2>
                            <p className="text-muted-foreground">Connect your Google account to sync form submissions to spreadsheets.</p>
                        </div>

                        <Card className={cn(
                            "border-2 transition-all duration-300",
                            isGoogleConnected ? "border-green-500/20 bg-green-50/10" : "border-border/50 shadow-sm"
                        )}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                <div className="space-y-1.5">
                                    <CardTitle className="text-lg">Connected Accounts</CardTitle>
                                    <CardDescription>
                                        Manage your linked Google accounts for spreadsheet integrations.
                                    </CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        className="shadow-sm"
                                        onClick={() => window.location.href = "/api/auth/google"}
                                    >
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        Link New
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isLoadingAccounts ? (
                                    <div className="flex justify-center p-8">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                    </div>
                                ) : isGoogleConnected ? (
                                    <div className="flex flex-col gap-3">
                                        {accounts?.map((account) => (
                                            <div key={account.id} className="px-4 py-3 bg-white border border-border rounded-lg flex items-center justify-between group hover:border-primary/30 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                        {account.email.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium">{account.name}</span>
                                                        <span className="text-xs text-muted-foreground">{account.email}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-100 px-2 py-1 rounded">ACTIVE</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                                                        onClick={() => {
                                                            if (confirm(`Are you sure you want to disconnect ${account.email}?`)) {
                                                                deleteAccountMutation.mutate(account.id);
                                                            }
                                                        }}
                                                        disabled={deleteAccountMutation.isPending}
                                                    >
                                                        {deleteAccountMutation.isPending ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 flex flex-col items-center justify-center text-center gap-4 border border-dashed border-border rounded-xl bg-muted/20">
                                        <div className="p-3 bg-white rounded-xl shadow-sm border border-border">
                                            <FileSpreadsheet className="w-8 h-8 text-primary" />
                                        </div>
                                        <div className="max-w-[280px]">
                                            <p className="text-sm font-medium">No Google accounts linked</p>
                                            <p className="text-xs text-muted-foreground mt-1">Connect your account to start syncing data to your preferred spreadsheets.</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="rounded-xl border border-blue-500/20 bg-blue-50/10 p-4 flex gap-4">
                            <div className="shrink-0 p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                <FileSpreadsheet className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-blue-900/80">How it works</p>
                                <p className="text-xs text-blue-800/60 leading-relaxed">
                                    Once connected, you'll be able to select specific Google Sheets in your form settings.
                                    Every new submission will be automatically appended as a new row in your chosen sheet.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
