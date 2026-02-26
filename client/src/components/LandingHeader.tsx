import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MessageSquare, ExternalLink, ChevronDown } from "lucide-react";

export function LandingHeader() {
    return (
        <header className="h-20 bg-white px-6 md:px-12 flex items-center justify-between sticky top-0 z-[100]">
            <div className="flex items-center gap-2">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-[#3b82f6] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                        <MessageSquare className="w-5 h-5 fill-white" />
                    </div>
                    <span className="font-display font-bold text-2xl tracking-tight flex items-center">
                        <span className="text-[#1e3a8a]">My</span>
                        <span className="text-[#3b82f6]">Form</span>
                    </span>
                </Link>
            </div>

            <nav className="hidden lg:flex items-center gap-10">
                <a href="#about" className="text-slate-800 font-semibold text-sm hover:text-[#3b82f6] transition-colors">
                    About
                </a>
                <a href="#features" className="text-slate-800 font-semibold text-sm hover:text-[#3b82f6] transition-colors">
                    Features
                </a>
                <a href="#industry" className="text-slate-800 font-semibold text-sm hover:text-[#3b82f6] transition-colors">
                    Industry
                </a>
                <a href="#how-it-works" className="text-slate-800 font-semibold text-sm hover:text-[#3b82f6] transition-colors">
                    How It Works
                </a>
                <a href="#pricing" className="text-slate-800 font-semibold text-sm hover:text-[#3b82f6] transition-colors">
                    Pricing
                </a>
            </nav>

            <div className="flex items-center gap-4">
                <Link href="/login">
                    <Button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold px-8 h-12 rounded-full text-xs tracking-widest uppercase shadow-lg shadow-blue-500/20">
                        GET STARTED
                    </Button>
                </Link>
            </div>
        </header>
    );
}
