import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import { useUser } from "@/hooks/useAuth";
import { LandingHeader } from "@/components/LandingHeader";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    MessageSquare,
    ArrowRight,
    Zap,
    Shield,
    Smartphone,
    Globe,
    ChevronDown,
    ExternalLink,
    Star,
    Calendar,
    Target,
    Share2,
    Layout,
    CheckCircle2,
    ChevronRight,
    XCircle,
    Settings2,
    Users2,
    Building2,
    TrendingUp,
    Facebook,
    Instagram,
    Linkedin,
    Youtube,
    Rocket,
    ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SiGoogle } from "react-icons/si";

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6 }
    }
};

const stagger = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

export default function Landing() {
    const { data: user } = useUser();
    const [, setLocation] = useLocation();

    useEffect(() => {
        if (user) {
            setLocation("/dashboard");
        }
    }, [user, setLocation]);

    if (user) return null;

    return (
        <div className="flex flex-col min-h-screen bg-white overflow-x-hidden">
            <LandingHeader />



            <main className="px-6 md:px-12 py-8">
                {/* MyForm Hero Section */}
                <section id="about" className="myform-hero-container">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                        <motion.div
                            initial="initial"
                            animate="animate"
                            variants={stagger}
                            className="flex flex-col"
                        >
                            <motion.h1
                                variants={fadeIn}
                                className="myform-hero-title"
                            >

                                Get Customers <br />
                                <span>On WhatsApp</span>
                            </motion.h1>

                            <motion.p
                                variants={fadeIn}
                                className="myform-hero-subtext"
                            >
                                Create your own form and get the data — Directly On WhatsApp.
                            </motion.p>

                            <motion.div
                                variants={fadeIn}
                                className="flex flex-wrap gap-4"
                            >
                                <Link href="/login">
                                    <Button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold h-14 px-10 rounded-full text-lg shadow-xl shadow-blue-900/40">
                                        Getting Started
                                    </Button>
                                </Link>
                                <Link href="/login">
                                    <Button className="bg-white hover:bg-slate-100 text-[#1e3a8a] font-bold h-14 px-10 rounded-full text-lg shadow-xl shadow-black/10">
                                        Get a Data on Whatsapp
                                    </Button>
                                </Link>
                            </motion.div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ duration: 0.8 }}
                            className="relative flex justify-center lg:justify-end"
                        >
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
                                <svg viewBox="0 0 500 500" className="w-full h-full opacity-25">
                                    <path d="M50,250 C150,50 350,50 450,250 C550,450 150,450 50,250" fill="none" stroke="#3b82f6" strokeWidth="2" />
                                </svg>
                            </div>
                            <img
                                src="/landing-hero-sawabot.png"
                                alt="Hand holding phone mockup"
                                className="max-w-[420px] md:max-w-full drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)]"
                            />
                        </motion.div>
                    </div>
                </section>

                {/* Agent Feature Cards Section */}
                <section id="features" className="max-w-7xl mx-auto -mt-24 relative z-20 px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                label: "Booking Form",
                                icon: <Calendar className="w-6 h-6 text-[#ef4444]" />,
                                bg: "bg-[#FFF5F5]",
                                desc: "Automate your appointments effortlessly."
                            },
                            {
                                label: "Support Form",
                                icon: <MessageSquare className="w-6 h-6 text-[#3b82f6]" />,
                                bg: "bg-[#eff6ff]",
                                desc: "24/7 customer support on WhatsApp."
                            },
                            {
                                label: "Lead Capture Form",
                                icon: <Target className="w-6 h-6 text-[#f59e0b]" />,
                                bg: "bg-[#F8FAFC]",
                                desc: "Convert chats into qualified leads."
                            }
                        ].map((agent, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className={cn("p-8 rounded-[2.5rem] flex flex-col items-start gap-5 transition-transform hover:-translate-y-2 group shadow-sm", agent.bg)}
                            >
                                <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:shadow-md transition-shadow">
                                    {agent.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{agent.label}</h3>
                                <p className="text-slate-500 font-medium leading-relaxed">Capture insights Directly on Whatsapp...</p>
                            </motion.div>
                        ))}
                    </div>
                </section>
                {/* Who It's For Section */}
                <section id="industry" className="py-24 px-6 bg-white border-t border-slate-50">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <span className="who-its-for-subtitle block mb-4 uppercase tracking-[0.2em]">WHO IT'S FOR</span>
                            <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 tracking-tight">
                                Built for businesses that run on WhatsApp
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                            {[
                                {
                                    label: "Small & Growing Business",
                                    icon: <Settings2 className="w-6 h-6 text-[#f87171]" />
                                },
                                {
                                    label: "Teams with Field staff",
                                    icon: <Users2 className="w-6 h-6 text-[#f87171]" />
                                },
                                {
                                    label: "Clinics, agencies, & service providers",
                                    icon: <Building2 className="w-6 h-6 text-[#f87171]" />
                                },
                                {
                                    label: "Companies in emerging markets",
                                    icon: <TrendingUp className="w-6 h-6 text-[#f87171]" />
                                }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="who-its-for-card flex flex-col items-center text-center group"
                                >
                                    <div className="who-its-for-icon-container group-hover:scale-110 transition-transform">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 leading-snug px-4">
                                        {item.label}
                                    </h3>
                                </motion.div>
                            ))}
                        </div>

                        <div className="text-center">
                            <p className="who-its-for-footer-text text-xl md:text-2xl font-medium text-slate-800 tracking-tight">
                                If your business already uses WhatsApp, MyForm <span>fits right in !</span>
                            </p>
                        </div>
                    </div>
                </section>

                {/* Social Proof / Brands */}
                <section className="py-12 bg-white border-y border-border/50 overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6">
                        <p className="text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground/60 mb-8">
                            Increase orders, get more bookings, and streamline interactions
                        </p>
                        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale contrast-125">
                            {/* Brands placeholders */}
                            <div className="text-2xl font-bold font-display italic text-slate-900">Shopify</div>
                            <div className="text-2xl font-bold font-display italic text-slate-900">Stripe</div>
                            <div className="text-2xl font-bold font-display italic text-slate-900">WhatsApp</div>
                            <div className="text-2xl font-bold font-display italic text-slate-900">Google</div>
                            <div className="text-2xl font-bold font-display italic text-slate-900">Meta</div>
                        </div>
                    </div>
                </section>

                {/* Redesigned How it Works - Vertical Workflow */}
                <section id="how-it-works" className="py-24 px-6 bg-white overflow-hidden">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-24">
                            <h2 className="text-4xl md:text-6xl font-display font-bold text-slate-900 tracking-tight leading-none mb-6">
                                How it works <span className="text-blue-600">?</span>
                            </h2>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
                                Three simple steps to transform your customer interaction from manual to magical.
                            </p>
                        </div>

                        <div className="workflow-container">
                            {[
                                {
                                    num: "01",
                                    title: "Build your form",
                                    desc: "Choose from 15+ field types and drag them into your canvas. Customize every detail from colors to logic with our intuitive builder.",
                                    icon: <Layout className="w-12 h-12 text-blue-600" />,
                                    color: "bg-blue-600"
                                },
                                {
                                    num: "02",
                                    title: "Share your link",
                                    desc: "Get a unique shareable link (or QR code) to post on your Instagram or send to customers. Your form lives everywhere your customers are.",
                                    icon: <Share2 className="w-12 h-12 text-purple-600" />,
                                    color: "bg-purple-600"
                                },
                                {
                                    num: "03",
                                    title: "Go live & Convert",
                                    desc: "Everything gets sent as a structured message to your WhatsApp and saved to Google Sheets. No missed leads, just instant growth.",
                                    icon: <Target className="w-12 h-12 text-amber-600" />,
                                    color: "bg-amber-600"
                                }
                            ].map((step, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: i * 0.1 }}
                                    className="workflow-step"
                                >
                                    <div className="workflow-content space-y-6 text-center md:text-left">
                                        <div className="workflow-step-marker mx-auto md:ml-0">
                                            {step.num}
                                        </div>
                                        <h3 className="text-3xl md:text-4xl font-display font-bold text-slate-900 leading-tight">
                                            {step.title}
                                        </h3>
                                        <p className="text-lg text-slate-500 font-medium leading-relaxed">
                                            {step.desc}
                                        </p>
                                    </div>

                                    <div className="workflow-visual">
                                        <div className="step-visual-box group hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500">
                                            <div className="relative z-10 p-6 bg-white rounded-3xl shadow-premium border border-slate-100 group-hover:scale-110 transition-transform duration-500">
                                                {step.icon}
                                            </div>
                                            {/* Decorative circles */}
                                            <div className={cn("absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-10 animate-pulse", step.color)} />
                                            <div className={cn("absolute -bottom-4 -left-4 w-16 h-16 rounded-full opacity-5", step.color)} />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 pt-12 border-t border-slate-100">
                            <div className="flex items-center gap-3 text-blue-600 font-bold">
                                <CheckCircle2 className="w-6 h-6" />
                                <span className="text-slate-700">Instant customer engagement</span>
                            </div>
                            <div className="flex items-center gap-3 text-blue-600 font-bold">
                                <CheckCircle2 className="w-6 h-6" />
                                <span className="text-slate-700">Zero technical setup required</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Experience the Difference Comparison Section */}
                <section className="py-24 px-6 bg-slate-50/50">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 tracking-tight mb-4">
                                Experience the difference
                            </h2>
                            <p className="text-slate-500 font-medium text-lg">
                                See how MyForm transforms your WhatsApp business communication.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Without Card */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="bg-white border border-slate-200 rounded-[2rem] p-8 md:p-10 shadow-sm"
                            >
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
                                        <XCircle className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-2xl font-display font-bold text-slate-800">Without MyForm</h3>
                                </div>

                                <ul className="space-y-6">
                                    {[
                                        "Asking same questions repeatedly",
                                        "Customers kept waiting while you are busy",
                                        "Forms get fake numbers & unreachable emails",
                                        "No way to collect info before the chat begins"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                            <span className="text-slate-600 font-medium">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>

                            {/* With Card */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="bg-blue-50/40 border border-blue-100 rounded-[2rem] p-8 md:p-10 shadow-lg shadow-blue-500/5"
                            >
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-2xl font-display font-bold text-slate-800">With MyForm</h3>
                                </div>

                                <ul className="space-y-6">
                                    {[
                                        "Faster Replies and 98% open rate",
                                        "Get only genuine phone numbers",
                                        "Personal connection with every customer",
                                        "Automated data collection on WhatsApp"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                            <span className="text-slate-700 font-semibold">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Core Features / Comparison */}
                {/* <section className="py-24 px-6 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="flex flex-col gap-8">
                            <h2 className="text-4xl md:text-6xl font-display font-bold leading-tight tracking-tight">
                                Translate to all major <span className="text-primary italic">languages</span>
                            </h2>
                            <p className="text-xl text-muted-foreground leading-relaxed">
                                Global reach for your local business. Enable multi-language forms so your customers can order comfortably in their native tongue.
                            </p>

                            <div className="flex flex-col gap-4">
                                {[
                                    "Instant translation for all fields",
                                    "Right-to-left (RTL) support included",
                                    "Region-specific phone number formatting",
                                    "Currency customization for localized pricing"
                                ].map((text, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                        <span className="font-medium text-foreground/80">{text}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4">
                                <Link href="/login">
                                    <Button variant="ghost" className="px-0 text-primary font-bold hover:bg-transparent hover:translate-x-1 transition-all">
                                        See how translation works <ChevronRight className="ml-1 w-5 h-5" />
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4 pt-12">
                                <div className="bg-white p-6 rounded-2xl border shadow-premium-hover">
                                    <Globe className="w-8 h-8 text-blue-500 mb-4" />
                                    <h4 className="font-bold mb-1">Global SEO</h4>
                                    <p className="text-xs text-muted-foreground">Indexed forms for more reach.</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border shadow-premium-hover">
                                    <Zap className="w-8 h-8 text-amber-500 mb-4" />
                                    <h4 className="font-bold mb-1">Ultra Fast</h4>
                                    <p className="text-xs text-muted-foreground">Loads in  1 second.</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-white p-6 rounded-2xl border shadow-premium-hover">
                                    <Smartphone className="w-8 h-8 text-purple-500 mb-4" />
                                    <h4 className="font-bold mb-1">Mobile First</h4>
                                    <p className="text-xs text-muted-foreground">Optimized for every screen.</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border shadow-premium-hover">
                                    <Star className="w-8 h-8 text-primary mb-4" />
                                    <h4 className="font-bold mb-1">5-Star UX</h4>
                                    <p className="text-xs text-muted-foreground">Loved by 10k+ customers.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section> */}

                {/* Templates Section */}
                {/* <section id="templates" className="py-24 px-6 bg-slate-900 text-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center max-w-3xl mx-auto mb-20">
                            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 tracking-tight">Choose from our ready-to-use templates</h2>
                            <p className="text-xl text-slate-400">Launch in seconds with our pre-built high-converting layouts.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                { name: "Coffee Shop Shop", category: "Food & Beverage", img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=400" },
                                { name: "Order a Cake", category: "Bakery", img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=400" },
                                { name: "Product Catalog", category: "E-Commerce", img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=400" },
                                { name: "Appointment Booking", category: "Services", img: "https://images.unsplash.com/photo-1600880212319-7524ebd8cb58?auto=format&fit=crop&q=80&w=400" },
                                { name: "Furniture Order", category: "Retail", img: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=400" },
                                { name: "Event Signup", category: "Events", img: "https://images.unsplash.com/photo-1540575861501-7ad0582371f3?auto=format&fit=crop&q=80&w=400" }
                            ].map((tmpl, i) => (
                                <div key={i} className="group cursor-pointer bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-primary/50 transition-colors">
                                    <div className="aspect-[4/3] overflow-hidden">
                                        <img src={tmpl.img} alt={tmpl.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div className="p-6">
                                        <div className="text-xs font-bold text-primary uppercase tracking-tighter mb-1">{tmpl.category}</div>
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xl font-bold">{tmpl.name}</h3>
                                            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="text-center mt-16">
                            <Link href="/login">
                                <Button className="h-14 px-10 rounded-full text-lg shadow-xl shadow-primary/20">Explore All Templates</Button>
                            </Link>
                        </div>
                    </div>
                </section> */}

                {/* Pricing Comparison Section */}
                <section id="pricing" className="py-32 px-6 pricing-section">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-20 space-y-4">
                            <h2 className="text-4xl md:text-6xl font-display font-bold text-slate-900 tracking-tight">
                                Compare our <span className="text-blue-600">plans</span>
                            </h2>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
                                Pick the perfect plan for your business growth. Simple, transparent pricing.
                            </p>
                        </div>

                        <div className="bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
                            <div className="pricing-table-container">
                                <table className="pricing-table">
                                    <thead>
                                        <tr>
                                            <th className="pricing-feature-label">Features</th>
                                            <th>
                                                <div className="pricing-plan-header">
                                                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Free</span>
                                                    <div className="pricing-price">$0</div>
                                                    <div className="pricing-period">Forever</div>
                                                </div>
                                            </th>
                                            <th className="pro-column-highlight">
                                                <div className="pricing-plan-header">
                                                    <span className="text-sm font-bold text-blue-500 uppercase tracking-widest flex items-center justify-center gap-1">
                                                        Pro
                                                        <Zap className="w-3 h-3 fill-current" />
                                                    </span>
                                                    <div className="pricing-price">$10</div>
                                                    <div className="pricing-period">Per Month</div>
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { label: "Responses via WhatsApp", free: "100 Per Month", pro: "Unlimited" },
                                            { label: "Number of forms", free: "100 Forms", pro: "Unlimited" },
                                            { label: "Responses in Dashboard", free: false, pro: true },
                                            { label: "Custom SEO meta data", free: false, pro: true },
                                            { label: "Total Upload Storage", free: "-", pro: "5GB" },
                                            { label: "Custom Domain & Link", free: false, pro: true },
                                            { label: "Custom Script & Integrations", free: false, pro: true },
                                            { label: "Remove MyForm branding", free: false, pro: true },
                                            { label: "Advanced questions in form", free: false, pro: true },
                                            { label: "Team routing", free: false, pro: true }
                                        ].map((row, i) => (
                                            <tr key={i}>
                                                <td className="pricing-feature-label">{row.label}</td>
                                                <td>
                                                    {typeof row.free === 'string' ? row.free : (row.free === true ? <CheckCircle2 className="check-icon-blue" /> : <span className="dash-icon-gray">—</span>)}
                                                </td>
                                                <td className="pro-column-highlight">
                                                    {typeof row.pro === 'string' ? (
                                                        <span className="text-blue-600 font-bold">{row.pro}</span>
                                                    ) : (
                                                        row.pro === true ? <CheckCircle2 className="check-icon-blue" /> : <span className="dash-icon-gray">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        <tr>
                                            <td className="pricing-feature-label"></td>
                                            <td className="py-10">
                                                <Link href="/login">
                                                    <Button variant="outline" className="h-12 px-8 rounded-xl font-bold border-2 border-slate-200 hover:bg-slate-50 text-slate-600">
                                                        Get Started
                                                    </Button>
                                                </Link>
                                            </td>
                                            <td className="pro-column-highlight py-10">
                                                <Link href="/login">
                                                    <Button className="h-12 px-8 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20">
                                                        Upgrade Now
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </section>
                <section id="minimalist-cta" className="py-32 px-6 bg-white border-t border-slate-50">
                    <div className="max-w-7xl mx-auto text-center space-y-12">
                        <div className="space-y-4">
                            <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
                                see sawabot in action
                            </span>
                            <div className="max-w-4xl mx-auto leading-tight">
                                <h2 className="text-3xl md:text-5xl font-sans font-medium text-slate-800 tracking-tight lowercase">
                                    begin your data gathering
                                    <span className="block mt-4 md:mt-2">
                                        journey today
                                        <Link href="/login" className="inline-pill-btn ml-4 align-middle normal-case tracking-normal scale-90 md:scale-100">
                                            Get started
                                            <div className="pill-arrow-circle">
                                                <ArrowRight className="w-4 h-4" />
                                            </div>
                                        </Link>
                                    </span>
                                </h2>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Redesigned Dark Footer */}
            <footer className="myform-footer-dark">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
                        {/* Column 1: Sitemap */}
                        <div>
                            <h4 className="footer-column-title">Sitemap</h4>
                            <div className="space-y-2">
                                <Link href="/" className="footer-link">About</Link>
                                <Link href="/" className="footer-link">Features</Link>
                                <Link href="/" className="footer-link">How it works ?</Link>
                                <Link href="/" className="footer-link">Pricing</Link>
                                <Link href="/" className="footer-link">Contact</Link>
                            </div>
                        </div>

                        {/* Column 2: Industries */}
                        <div>
                            <h4 className="footer-column-title">Industries</h4>
                            <div className="space-y-2">
                                <Link href="/" className="footer-link">Clinics & Hospitals</Link>
                                <Link href="/" className="footer-link">Real Estate</Link>
                                <Link href="/" className="footer-link">IT & Software</Link>
                                <Link href="/" className="footer-link">Online Services</Link>
                                <Link href="/" className="footer-link">eCommerce</Link>
                            </div>
                        </div>

                        {/* Column 3: Solutions */}
                        <div>
                            <h4 className="footer-column-title">Solutions</h4>
                            <div className="space-y-2">
                                <Link href="/" className="footer-link">Customer Services</Link>
                                <Link href="/" className="footer-link">Employee Experience</Link>
                                <Link href="/" className="footer-link">Support Tickets</Link>
                                <Link href="/" className="footer-link">Online Stores</Link>
                                <Link href="/" className="footer-link">General support</Link>
                            </div>
                        </div>

                        {/* Column 4: Branding & Social */}
                        <div className="flex flex-col items-start lg:items-end">
                            <div className="flex items-center gap-2 mb-8">
                                <div className="w-12 h-12 rounded-xl bg-[#3b82f6] flex items-center justify-center text-white">
                                    <Layout className="w-8 h-8" />
                                </div>
                            </div>

                            <div className="flex gap-4 mb-12">
                                <a href="#" className="footer-social-icon"><Facebook className="w-6 h-6" /></a>
                                <a href="#" className="footer-social-icon"><Youtube className="w-6 h-6" /></a>
                                <a href="#" className="footer-social-icon"><Linkedin className="w-6 h-6" /></a>
                                <a href="#" className="footer-social-icon"><Instagram className="w-6 h-6" /></a>
                            </div>

                            <div className="text-right text-[#94a3b8] font-medium space-y-1">
                                <p>© 2026 MyForm AI</p>
                                <p>Nanaimo, BC V9T 5H3,</p>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
