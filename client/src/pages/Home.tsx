import { useForms } from "@/hooks/use-forms";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Plus, Loader2, FileText, CalendarDays, Inbox, Copy, Check, QrCode } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useMemo } from "react";
import { useSubmissions } from "@/hooks/use-forms";
import { format } from "date-fns";
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { QRCodeDialog } from "@/components/QRCodeDialog";

export default function Home() {
  const { data: forms, isLoading, error } = useForms();
  const [viewSubmissionsId, setViewSubmissionsId] = useState<number | null>(null);
  const [qrCodeFormId, setQrCodeFormId] = useState<number | null>(null);
  const { toast } = useToast();

  const handleCopyLink = (id: number, slug: string) => {
    const url = `${window.location.host}/share/${id}/${slug}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied",
      description: "Share link has been copied to your clipboard.",
    });
  };

  const selectedForm = forms?.find(f => f.id === viewSubmissionsId);

  return (
    <div className="min-h-screen bg-muted/10 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-4xl font-display font-bold text-foreground mb-1 sm:mb-2">My Forms</h1>
            <p className="text-muted-foreground text-sm sm:text-lg">Manage and build your data collection forms.</p>
          </div>
          <Link href="/builder" className="self-start sm:self-auto">
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
                    <div className="flex gap-2 items-center">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium bg-muted px-2 py-1 rounded-full text-muted-foreground">
                        {form.fields.length} Fields
                      </span>
                    </div>

                    <TooltipProvider>
                      <div className="flex gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleCopyLink(form.id, form.slug);
                              }}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy Share Link</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setQrCodeFormId(form.id);
                              }}
                            >
                              <QrCode className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Show QR Code</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
                  </div>
                  <CardTitle className="font-display text-xl">{form.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <CalendarDays className="w-3 h-3" />
                    Created {format(new Date(form.createdAt || new Date()), 'MMM d, yyyy')}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-0 gap-2">
                  <Link href={`/builder/${form.id}`} className="flex-1">
                    <Button variant="outline" className="w-full group-hover:border-primary/30 group-hover:text-primary">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="flex-1 group-hover:border-primary/30 group-hover:text-primary"
                    onClick={() => setViewSubmissionsId(form.id)}
                  >
                    View Submissions
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <SubmissionsDialog
        form={selectedForm}
        open={viewSubmissionsId !== null}
        onOpenChange={(open) => !open && setViewSubmissionsId(null)}
      />

      {/* QR Code Dialog */}
      {(() => {
        const qrForm = forms?.find(f => f.id === qrCodeFormId);
        if (!qrForm) return null;
        const url = `${window.location.origin}/share/${qrForm.id}/${qrForm.slug}`;
        return (
          <QRCodeDialog
            open={qrCodeFormId !== null}
            onOpenChange={(open) => !open && setQrCodeFormId(null)}
            formTitle={qrForm.title}
            formUrl={url}
          />
        );
      })()}
    </div>
  );
}

function SubmissionsDialog({ form, open, onOpenChange }: { form?: any, open: boolean, onOpenChange: (open: boolean) => void }) {
  const { data: submissions, isLoading } = useSubmissions(form?.id ?? NaN);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Reset page on search or when dialog opens
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, open]);

  const filteredSubmissions = useMemo(() => {
    if (!submissions) return [];
    if (!searchQuery.trim()) return submissions;

    const query = searchQuery.toLowerCase();
    return submissions.filter((sub: any) => {
      // Search in dates
      if (format(new Date(sub.createdAt), 'MMM d, h:mm a').toLowerCase().includes(query)) return true;

      // Search in all field values
      return Object.values(sub.data).some(value =>
        String(value).toLowerCase().includes(query)
      );
    });
  }, [submissions, searchQuery]);

  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSubmissions = filteredSubmissions.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-8 sm:pr-0">
            <div className="space-y-1">
              <DialogTitle>Submissions: {form?.title}</DialogTitle>
              <DialogDescription>
                Actual responses received for this form.
              </DialogDescription>
            </div>
            <div className="relative w-full sm:w-64 sm:mr-8">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search submissions..."
                className="pl-9 h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-[300px]">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border mx-2">
              <Inbox className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>{searchQuery ? "No matching submissions found." : "No submissions yet."}</p>
            </div>
          ) : (
            <div className="rounded-md border mx-2">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[150px]">Date</TableHead>
                    {form?.fields.map((field: any) => (
                      <TableHead key={field.id}>{field.label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSubmissions.map((sub: any) => (
                    <TableRow key={sub.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="text-xs font-medium whitespace-nowrap">
                        {format(new Date(sub.createdAt), 'MMM d, h:mm a')}
                      </TableCell>
                      {form?.fields.map((field: any) => (
                        <TableCell key={field.id} className="text-sm">
                          {typeof sub.data[field.id] === 'boolean'
                            ? (sub.data[field.id] ? <span className="text-green-600 font-medium">Yes</span> : <span className="text-muted-foreground">No</span>)
                            : sub.data[field.id] || '-'}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {filteredSubmissions.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/10 rounded-b-lg">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-medium text-foreground">{startIndex + 1}</span> to <span className="font-medium text-foreground">{Math.min(startIndex + itemsPerPage, filteredSubmissions.length)}</span> of <span className="font-medium text-foreground">{filteredSubmissions.length}</span> results
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs font-medium px-2">
                Page {currentPage} of {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
