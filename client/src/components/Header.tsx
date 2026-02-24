import { Link } from "wouter";
import { useUser, useLogout } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, LogOut, User, Layout } from "lucide-react";

export function Header() {
    const { data: user } = useUser();
    const logout = useLogout();

    if (!user) return null;

    return (
        <header className="h-16 border-b border-border bg-white px-4 sm:px-8 flex items-center justify-between shrink-0 z-50">
            <div className="flex items-center gap-2">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                        <Layout className="w-5 h-5" />
                    </div>
                    <span className="font-display font-bold text-xl tracking-tight text-foreground">
                        Form Builder
                    </span>
                </Link>
            </div>

            <div className="flex items-center gap-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden ring-offset-background transition-all hover:ring-2 hover:ring-primary/20">
                            <Avatar className="h-10 w-10 border border-border">
                                <AvatarImage src={user.avatar || ""} alt={user.name} />
                                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                    {user.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user.name}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-muted-foreground cursor-pointer focus:text-foreground"
                            onClick={() => { }} // Could link to profile in future
                        >
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive cursor-pointer"
                            onClick={() => logout.mutate()}
                            disabled={logout.isPending}
                        >
                            {logout.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <LogOut className="mr-2 h-4 w-4" />
                            )}
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
