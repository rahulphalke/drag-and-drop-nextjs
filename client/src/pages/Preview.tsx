import { useParams, useLocation } from "wouter";
import { useForm } from "@/hooks/use-forms";
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
import { ArrowLeft, Calendar as CalendarIcon, Loader2, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function Preview() {
    const params = useParams<{ id: string }>();
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const formId = parseInt(params.id, 10);
    const { data: form, isLoading, error } = useForm(formId);

    useEffect(() => {
        if (form) {
            document.title = `Preview: ${form.title} | Form Builder`;
        }
    }, [form]);

    const [formData, setFormData] = useState<Record<string, any>>({});
    const [dates, setDates] = useState<Record<string, Date>>({});

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-muted/30">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !form) {
        return (
            <div className="h-screen flex flex-col items-center justify-center gap-4 bg-muted/30">
                <p className="text-destructive font-medium">Form not found</p>
                <Button onClick={() => setLocation("/")}>Go Home</Button>
            </div>
        );
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form Submitted:", { ...formData, ...dates });
        toast({
            title: "Preview Submission",
            description: "In a real app, this would be saved. Check console for data.",
        });
    };

    return (
        <div className="min-h-screen bg-background/50 py-8 px-4 sm:py-12 flex flex-col items-center">
            <div className="max-w-2xl w-full space-y-6">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.close()}
                    className="mb-2"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Editor
                </Button>

                <Card className="border-none premium-shadow-hover glass-morphism overflow-hidden">
                    <CardHeader className="space-y-1 pb-8 border-b border-border/40">
                        <CardTitle className="text-3xl font-display font-bold text-foreground">
                            {form.title}
                        </CardTitle>
                        <CardDescription className="text-base text-muted-foreground">
                            This is a preview of your published form.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {form.fields.map((field) => (
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
                                            className="h-11 bg-white border-border/50 focus:border-primary focus:ring-primary/20 transition-all"
                                        />
                                    )}

                                    {field.type === 'number' && (
                                        <Input
                                            type="number"
                                            placeholder={field.placeholder || '0'}
                                            required={field.required}
                                            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                                            className="h-11 bg-white border-border/50 focus:border-primary focus:ring-primary/20 transition-all"
                                        />
                                    )}

                                    {field.type === 'phone' && (
                                        <Input
                                            type="tel"
                                            placeholder={field.placeholder || '+1 (555) 000-0000'}
                                            required={field.required}
                                            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                                            className="h-11 bg-white border-border/50 focus:border-primary focus:ring-primary/20 transition-all"
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
                                            <SelectTrigger className="h-11 bg-white border-border/50">
                                                <SelectValue placeholder={field.placeholder || "Select an option"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {field.options?.map((opt) => (
                                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}

                                    {field.type === 'checkbox' && (
                                        <>
                                            {field.options && field.options.length > 0 ? (
                                                <div className="space-y-2">
                                                    {field.options.map((opt, i) => (
                                                        <div key={i} className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 bg-white/50 hover:bg-white transition-colors cursor-pointer">
                                                            <Checkbox
                                                                id={`${field.id}-${i}`}
                                                                onCheckedChange={(checked) => {
                                                                    const current: string[] = formData[field.id] || [];
                                                                    setFormData({ ...formData, [field.id]: checked ? [...current, opt] : current.filter((v: string) => v !== opt) });
                                                                }}
                                                            />
                                                            <label htmlFor={`${field.id}-${i}`} className="text-sm font-medium leading-none cursor-pointer select-none">{opt}</label>
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
                                                    <label htmlFor={field.id} className="text-sm font-medium leading-none cursor-pointer select-none">{field.label}</label>
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
                                            {field.options?.map((opt, i) => (
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
                                                        "w-full h-11 justify-start text-left font-normal bg-white border-border/50",
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

                            <Button type="submit" className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all mt-4">
                                <Send className="w-5 h-5 mr-2" />
                                {(form as any).submitButtonText || "Submit Form"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="text-center text-sm text-muted-foreground pt-4 mb-12">
                    This is a preview of how your form will look to users.
                </p>
            </div>
        </div>
    );
}
