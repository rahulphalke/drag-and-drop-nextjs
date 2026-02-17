import { useForms } from "@/hooks/use-forms";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Plus, Loader2, FileText, CalendarDays } from "lucide-react";
import { format } from "date-fns";

export default function Home() {
  const { data: forms, isLoading, error } = useForms();

  return (
    <div className="min-h-screen bg-muted/10 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-display font-bold text-foreground mb-2">My Forms</h1>
            <p className="text-muted-foreground text-lg">Manage and build your data collection forms.</p>
          </div>
          <Link href="/builder">
            <Button size="lg" className="shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all">
              <Plus className="w-5 h-5 mr-2" />
              Create New Form
            </Button>
          </Link>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center h-[400px]">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="bg-destructive/10 text-destructive p-6 rounded-xl border border-destructive/20 text-center">
            Failed to load forms. Please try again.
          </div>
        ) : forms?.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-border">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
              <FileText className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold font-display mb-2">No forms created yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Get started by creating your first form with our drag-and-drop builder.
            </p>
            <Link href="/builder">
              <Button>Start Building</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms?.map((form) => (
              <Card key={form.id} className="hover:shadow-lg transition-all hover:border-primary/50 group cursor-pointer bg-white">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium bg-muted px-2 py-1 rounded-full text-muted-foreground">
                      {form.fields.length} Fields
                    </span>
                  </div>
                  <CardTitle className="font-display text-xl">{form.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <CalendarDays className="w-3 h-3" />
                    Created {format(new Date(form.createdAt || new Date()), 'MMM d, yyyy')}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-0">
                  <Button variant="outline" className="w-full group-hover:border-primary/30 group-hover:text-primary">
                    View Submissions
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
