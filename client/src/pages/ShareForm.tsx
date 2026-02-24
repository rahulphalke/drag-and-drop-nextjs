import { useParams } from "wouter";
import { useForm, usePublicForm } from "@/hooks/use-forms";
import { type FormField, type Form } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, Send, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { api, buildUrl } from "@shared/routes";
import { useMutation } from "@tanstack/react-query";

export default function ShareForm() {
    const params = useParams<{ shareId: string }>();
    const { toast } = useToast();
    const shareId = params.shareId;
    const { data: form, isLoading, error } = usePublicForm(shareId);

    useEffect(() => {
        if (form) {
            document.title = `${form.title} | Form Builder`;
            let metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription) {
                metaDescription.setAttribute("content", `Fill out the ${form.title} form.`);
            } else {
                metaDescription = document.createElement('meta');
                (metaDescription as HTMLMetaElement).name = "description";
                (metaDescription as HTMLMetaElement).content = `Fill out the ${form.title} form.`;
                document.head.appendChild(metaDescription);
            }
        }
    }, [form]);

    const [formData, setFormData] = useState<Record<string, any>>({});
    const [dates, setDates] = useState<Record<string, Date>>({});
    const [submitted, setSubmitted] = useState(false);

    const submitMutation = useMutation({
        mutationFn: async (data: any) => {
            const url = buildUrl(api.submissions.create.path, { shareId });
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to submit form");
            return res.json();
        },
        onSuccess: () => {
            setSubmitted(true);
            toast({
                title: "Success!",
                description: "Your response has been recorded.",
            });

            // WhatsApp Redirect
            console.log("Submission success, checking for WhatsApp redirect. Form config:", form);
            if (form?.whatsappNumber) {
                console.log("WhatsApp number found:", form.whatsappNumber);
                const message = Object.entries(formData)
                    .map(([key, value]) => {
                        const field = form.fields.find((f: FormField) => f.id === key);
                        return `*${field?.label || key}*: ${value}`;
                    })
                    .join("\n");

                const fullMessage = `New Form Submission: *${form.title}*\n\n${message}`;
                const encodedMessage = encodeURIComponent(fullMessage);
                const whatsappUrl = `https://wa.me/${form.whatsappNumber}?text=${encodedMessage}`;

                // Redirect immediately
                window.location.href = whatsappUrl;
            }
        },
        onError: (err: any) => {
            toast({
                title: "Error",
                description: err.message,
                variant: "destructive",
            });
        },
    });

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-muted/30">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !form) {
        return (
            <div className="h-screen flex flex-col items-center justify-center gap-4 bg-muted/30 text-center px-4">
                <p className="text-destructive font-medium text-xl">Form not found</p>
                <p className="text-muted-foreground">The form you're looking for might have been deleted or the link is incorrect.</p>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-muted/30 flex items-center justify-center py-12 px-4">
                <Card className="max-w-md w-full border-none shadow-2xl text-center py-8">
                    <CardContent className="space-y-4">
                        {form?.whatsappNumber ? (
                            <>
                                <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Loader2 className="w-10 h-10 animate-spin" />
                                </div>
                                <h2 className="text-3xl font-display font-bold text-foreground">Redirecting...</h2>
                                <p className="text-muted-foreground">Opening WhatsApp to send your submission message.</p>
                            </>
                        ) : (
                            <>
                                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-10 h-10" />
                                </div>
                                <h2 className="text-3xl font-display font-bold text-foreground">Thank you!</h2>
                                <p className="text-muted-foreground">Your submission has been received. You can now close this tab.</p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitMutation.mutate({ ...formData, ...dates });
    };

    return (
        <div className="min-h-screen bg-background/50 py-8 px-4 sm:py-12 flex flex-col items-center">
            <div className="max-w-2xl w-full space-y-6">
                <Card className="border-none premium-shadow-hover glass-morphism overflow-hidden">
                    <CardHeader className="space-y-1 pb-8 border-b border-border/40">
                        <CardTitle className="text-3xl font-display font-bold text-foreground">
                            {form.title}
                        </CardTitle>
                        <CardDescription className="text-base text-muted-foreground">
                            Please fill out and submit this form.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8 text-left">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {form.fields.map((field: FormField) => (
                                <div key={field.id} className="space-y-3">
                                    {field.type !== 'title' && (
                                        <Label className="text-sm font-semibold text-foreground flex items-center gap-1">
                                            {field.label}
                                            {field.required && <span className="text-destructive">*</span>}
                                        </Label>
                                    )}

                                    {field.type === 'text' && (
                                        <Input
                                            placeholder={field.placeholder}
                                            required={field.required}
                                            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                                            className="h-11 input-premium rounded-xl"
                                        />
                                    )}

                                    {field.type === 'textarea' && (
                                        <Textarea
                                            placeholder={field.placeholder}
                                            required={field.required}
                                            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                                            className="min-h-[120px] input-premium rounded-xl"
                                        />
                                    )}

                                    {field.type === 'email' && (
                                        <Input
                                            type="email"
                                            placeholder={field.placeholder || 'you@example.com'}
                                            required={field.required}
                                            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                                            className="h-11 bg-white"
                                        />
                                    )}

                                    {field.type === 'number' && (
                                        <Input
                                            type="number"
                                            placeholder={field.placeholder || '0'}
                                            required={field.required}
                                            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                                            className="h-11 bg-white"
                                        />
                                    )}

                                    {field.type === 'phone' && (
                                        <Input
                                            type="tel"
                                            placeholder={field.placeholder || '+1 (555) 000-0000'}
                                            required={field.required}
                                            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                                            className="h-11 bg-white"
                                        />
                                    )}

                                    {field.type === 'title' && (
                                        <div className="space-y-1 pb-2 border-b">
                                            <h2 className="text-xl font-bold text-foreground">{field.label || 'Section Title'}</h2>
                                            {field.placeholder && (
                                                <p className="text-sm text-muted-foreground">{field.placeholder}</p>
                                            )}
                                        </div>
                                    )}

                                    {field.type === 'rating' && (
                                        <div className="flex gap-2">
                                            {Array.from({ length: parseInt(field.options?.[0] || '5', 10) }).map((_, i) => {
                                                const rating = formData[field.id] || 0;
                                                return (
                                                    <button
                                                        key={i}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, [field.id]: i + 1 })}
                                                        className="focus:outline-none"
                                                    >
                                                        <svg className={`w-8 h-8 transition-colors ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {field.type === 'dropdown' && (
                                        <Select
                                            required={field.required}
                                            onValueChange={(val) => setFormData({ ...formData, [field.id]: val })}
                                        >
                                            <SelectTrigger className="h-11 bg-white">
                                                <SelectValue placeholder={field.placeholder || "Select an option"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {field.options?.map((opt: string) => (
                                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}

                                    {field.type === 'checkbox' && (
                                        <>
                                            {field.options && field.options.length > 0 ? (
                                                <div className="space-y-2">
                                                    {field.options.map((opt: string, i: number) => (
                                                        <div key={i} className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 bg-white/50 hover:bg-white transition-colors cursor-pointer">
                                                            <Checkbox
                                                                id={`${field.id}-${i}`}
                                                                onCheckedChange={(checked) => {
                                                                    const current: string[] = formData[field.id] || [];
                                                                    setFormData({ ...formData, [field.id]: checked ? [...current, opt] : current.filter((v: string) => v !== opt) });
                                                                }}
                                                            />
                                                            <label htmlFor={`${field.id}-${i}`} className="text-sm font-medium leading-none cursor-pointer">{opt}</label>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 bg-white/50 hover:bg-white transition-colors cursor-pointer">
                                                    <Checkbox
                                                        id={field.id}
                                                        required={field.required}
                                                        onCheckedChange={(checked) => setFormData({ ...formData, [field.id]: checked })}
                                                    />
                                                    <label htmlFor={field.id} className="text-sm font-medium leading-none cursor-pointer">{field.label}</label>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {field.type === 'radio' && (
                                        <RadioGroup
                                            required={field.required}
                                            onValueChange={(val) => setFormData({ ...formData, [field.id]: val })}
                                            className="space-y-2"
                                        >
                                            {field.options?.map((opt: string, i: number) => (
                                                <div key={i} className="flex items-center space-x-3 p-2 rounded-md hover:bg-white/50 transition-colors">
                                                    <RadioGroupItem value={opt} id={`${field.id}-${i}`} />
                                                    <Label htmlFor={`${field.id}-${i}`} className="font-normal cursor-pointer">{opt}</Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    )}

                                    {field.type === 'date' && (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full h-11 justify-start text-left font-normal bg-white",
                                                        !dates[field.id] && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {dates[field.id] ? format(dates[field.id], "PPP") : (field.placeholder || "Pick a date")}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={dates[field.id]}
                                                    onSelect={(date) => date && setDates({ ...dates, [field.id]: date })}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                </div>
                            ))}

                            <Button
                                type="submit"
                                className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all mt-4 rounded-xl"
                                disabled={submitMutation.isPending}
                            >
                                {submitMutation.isPending ? (
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                ) : (
                                    <Send className="w-5 h-5 mr-2" />
                                )}
                                {(form as any).submitButtonText || "Submit Response"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
