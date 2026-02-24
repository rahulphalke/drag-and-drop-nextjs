import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent
} from "@dnd-kit/core";
import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { Sidebar } from "@/components/Sidebar";
import { Canvas } from "@/components/Canvas";
import { SettingsPanel } from "@/components/SettingsPanel";
import { useFormBuilderStore } from "@/lib/store";
import { useCreateForm, useUpdateForm, useForm } from "@/hooks/use-forms";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Save, Eye, Loader2, Layers, Settings, Wrench, Share2, Copy } from "lucide-react";
import { FieldType } from "@shared/schema";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")     // Replace spaces with -
    .replace(/[^\w-]+/g, "")    // Remove all non-word chars
    .replace(/--+/g, "-");    // Replace multiple - with single -
}

type MobilePanel = "toolbox" | "canvas" | "settings";

export default function Builder() {
  const [, setLocation] = useLocation();
  const params = useParams<{ id?: string }>();
  const editId = params.id ? parseInt(params.id, 10) : undefined;
  const isEditing = editId !== undefined && !isNaN(editId);

  const {
    fields,
    addField,
    reorderFields,
    formTitle,
    setTitle,
    setFields,
    resetForm,
    whatsappNumber,
    googleSheetId,
    googleSheetName,
    submitButtonText,
    formSlug,
    setWhatsappNumber,
    setGoogleSheet,
    setSubmitButtonText,
    setFormSlug,
  } = useFormBuilderStore();

  const { toast } = useToast();
  const createForm = useCreateForm();
  const updateForm = useUpdateForm();
  const { data: existingForm, isLoading: isLoadingForm } = useForm(editId ?? NaN);

  const { data: googleSheets, isLoading: isLoadingSheets, refetch: refetchSheets } = useQuery({
    queryKey: ['/api/integrations/google/sheets'],
    retry: false, // Don't retry auth errors
    refetchOnWindowFocus: true,
  });

  const [activeDragType, setActiveDragType] = useState<FieldType | null>(null);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>("canvas");
  const [hydrated, setHydrated] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [localWhatsapp, setLocalWhatsapp] = useState(whatsappNumber || "");
  const [localGoogleSheetId, setLocalGoogleSheetId] = useState(googleSheetId || "");
  const [localGoogleSheetName, setLocalGoogleSheetName] = useState(googleSheetName || "");
  const [localSlug, setLocalSlug] = useState(formSlug || "");
  const [localSubmitText, setLocalSubmitText] = useState(submitButtonText || "");

  // Update local state when store changes (e.g. on load)
  useEffect(() => {
    setLocalWhatsapp(whatsappNumber || "");
    setLocalGoogleSheetId(googleSheetId || "");
    setLocalGoogleSheetName(googleSheetName || "");
    setLocalSlug(formSlug || "");
    setLocalSubmitText(submitButtonText || "");
  }, [whatsappNumber, googleSheetId, googleSheetName, formSlug, submitButtonText]);

  // Reset hydrated state when switching between forms or between edit/create
  useEffect(() => {
    setHydrated(false);
  }, [editId, isEditing]);

  // Handle editId/mode changes - only populate once
  useEffect(() => {
    if (isEditing) {
      if (existingForm && !hydrated) {
        setTitle(existingForm.title);
        setFields(existingForm.fields);
        setWhatsappNumber(existingForm.whatsappNumber || null);
        setGoogleSheet((existingForm as any).googleSheetId || null, (existingForm as any).googleSheetName || null);
        setFormSlug(existingForm.slug || null);
        setSubmitButtonText((existingForm as any).submitButtonText || null);
        setHydrated(true);
      }
    } else {
      // For new forms, we just need to ensure we're reset and "hydrated" (ready)
      resetForm();
      setHydrated(true);
    }
  }, [isEditing, existingForm, hydrated, setTitle, setFields, resetForm]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetForm();
    };
  }, [resetForm]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === "sidebar-item") {
      setActiveDragType(active.data.current.fieldType);
    }
  };

  const handleDragOver = (_event: DragOverEvent) => { };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragType(null);

    if (!over) return;

    // Dropping sidebar item into canvas
    if (active.data.current?.type === "sidebar-item" && over.id === "canvas-droppable") {
      addField(active.data.current.fieldType);
      return;
    }

    // Reordering fields
    if (active.id !== over.id) {
      reorderFields(active.id as string, over.id as string);
    }
  };

  const handleSave = (skipRedirect = false) => {
    const currentState = useFormBuilderStore.getState();

    if (isEditing && editId !== undefined) {
      updateForm.mutate(
        {
          id: editId,
          title: currentState.formTitle,
          fields: currentState.fields,
          whatsappNumber: currentState.whatsappNumber,
          googleSheetId: currentState.googleSheetId,
          googleSheetName: currentState.googleSheetName,
          slug: currentState.formSlug || undefined,
          submitButtonText: currentState.submitButtonText,
        },
        {
          onSuccess: () => {
            if (!skipRedirect) setLocation("/");
          }
        }
      );
    } else {
      createForm.mutate(
        {
          title: currentState.formTitle,
          fields: currentState.fields,
          whatsappNumber: currentState.whatsappNumber,
          googleSheetId: currentState.googleSheetId,
          googleSheetName: currentState.googleSheetName,
          submitButtonText: currentState.submitButtonText,
        },
        {
          onSuccess: () => {
            if (!skipRedirect) setLocation("/");
          }
        }
      );
    }
  };

  const handleMobileAddField = (type: FieldType) => {
    addField(type);
    setMobilePanel("canvas");
  };

  const handleCopyLink = () => {
    const shareId = existingForm?.shareId;
    const slug = existingForm?.slug || slugify(formTitle);
    const link = `${window.location.protocol}//${window.location.host}/share/${shareId}/${slug}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied",
      description: "Shareable link copied to clipboard!",
    });
  };

  const mobileTabs: { key: MobilePanel; label: string; icon: React.ElementType }[] = [
    { key: "toolbox", label: "Toolbox", icon: Wrench },
    { key: "canvas", label: "Canvas", icon: Layers },
    { key: "settings", label: "Properties", icon: Settings },
  ];

  const isSaving = createForm.isPending || updateForm.isPending;

  // Show spinner while fetching an existing form
  if (isEditing && (isLoadingForm || !hydrated)) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background/50 overflow-hidden">
      {/* Header */}
      <header className="h-14 sm:h-16 border-b border-border/40 glass-morphism px-3 sm:px-6 flex items-center justify-between shrink-0 z-50 sticky top-0">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="h-6 w-px bg-border hidden sm:block" />
          <Input
            value={formTitle}
            onChange={(e) => setTitle(e.target.value)}
            className="border-transparent hover:border-border focus:border-primary font-display font-bold text-sm sm:text-lg w-[120px] sm:w-[300px] h-9"
          />
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <Button
            variant="outline"
            className="hidden sm:flex border-green-200 text-green-700 bg-green-50 hover:bg-green-100 hover:text-green-800"
            onClick={() => {
              if (googleSheets) {
                refetchSheets(); // Ensure we have the latest sheets when opening
                setShowSettingsDialog(true);
              } else {
                window.location.href = '/api/auth/google';
              }
            }}
          >
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4">
                <path fill="#11823B" d="M41.5,4h-35C4.01,4,2,6.01,2,8.5v31C2,41.99,4.01,44,6.5,44h35c2.49,0,4.5-2.01,4.5-4.5v-31C46,6.01,43.99,4,41.5,4z" />
                <path fill="#FFF" d="M37.5,14h-27v4h27V14z M37.5,22h-27v4h27V22z M37.5,30h-27v4h27V30z" />
              </svg>
              <span className="hidden sm:inline">
                {googleSheetId ? "Sheet Connected" : "Connect Google"}
              </span>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              if (isEditing) {
                setShowShareDialog(true);
              } else {
                toast({
                  title: "Save Required",
                  description: "Please save your form first to publish it.",
                });
              }
            }}
            className="hidden sm:flex"
          >
            <Share2 className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Publish</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (isEditing) {
                window.open(`/preview/${editId}`, "_blank");
              } else {
                toast({
                  title: "Save Required",
                  description: "Please save your form first to preview it.",
                });
              }
            }}
            className="hidden sm:flex"
          >
            <Eye className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Preview</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowSettingsDialog(true)}
            className="hidden sm:flex"
          >
            <Settings className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
          <Button onClick={() => handleSave(false)} disabled={isSaving || fields.length === 0}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 sm:mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 sm:mr-2" />
            )}
            <span className="hidden sm:inline">{isEditing ? "Update Form" : "Save Form"}</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <Sidebar
            isActive={mobilePanel === "toolbox"}
            onAddField={handleMobileAddField}
          />
          <Canvas isActive={mobilePanel === "canvas"} />
          <SettingsPanel
            isActive={mobilePanel === "settings"}
            onOpenSettings={() => setShowSettingsDialog(true)}
          />

          {createPortal(
            <DragOverlay>
              {activeDragType ? (
                <div className="p-3 bg-white border border-primary rounded-lg shadow-xl opacity-90 cursor-grabbing w-[200px] flex items-center gap-2">
                  <span className="font-medium text-primary">Adding {activeDragType}...</span>
                </div>
              ) : null}
            </DragOverlay>,
            document.body
          )}
        </DndContext>
      </div>

      {/* Mobile Bottom Tab Bar — hidden on md+ */}
      <nav className="md:hidden shrink-0 border-t border-border bg-white flex safe-area-inset-bottom">
        {mobileTabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setMobilePanel(key)}
            className={cn(
              "relative flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors",
              mobilePanel === key
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className={cn("w-5 h-5", mobilePanel === key && "text-primary")} />
            <span>{label}</span>
            {mobilePanel === key && (
              <span className="absolute bottom-0 w-8 h-0.5 bg-primary rounded-t-full" />
            )}
          </button>
        ))}
      </nav>

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Form</DialogTitle>
            <DialogDescription>
              Anyone with this link can view and submit your form.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 pt-4">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="link" className="sr-only">
                Link
              </Label>
              <Input
                id="link"
                defaultValue={`${window.location.protocol}//${window.location.host}/share/${existingForm?.shareId}/${existingForm?.slug || slugify(formTitle)}`}
                readOnly
                className="h-10 px-3 bg-muted"
              />
            </div>
            <Button size="sm" className="px-3" onClick={handleCopyLink}>
              <span className="sr-only">Copy</span>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Form Settings</DialogTitle>
            <DialogDescription>
              Configure your form link, integrations, and submission behaviour.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-4">

            {/* Form Link */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Form Link</Label>
              <div className="flex flex-col gap-1.5 rounded-xl border border-border/50 bg-muted/20 p-3 w-full">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="text-[11px] text-muted-foreground/60 whitespace-nowrap">{window.location.protocol}//{window.location.host}/share/</span>
                  <span className="text-[11px] font-mono text-primary/70 bg-primary/5 px-1.5 py-0.5 rounded truncate">
                    {existingForm?.shareId || '...'}
                  </span>
                  <span className="text-[11px] text-muted-foreground/60">/</span>
                </div>
                <input
                  className="w-full bg-white/50 border border-border/50 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-medium"
                  placeholder={slugify(formTitle) || "form-link"}
                  value={localSlug}
                  onChange={(e) => setLocalSlug(slugify(e.target.value))}
                />
              </div>
              <p className="text-[10px] text-muted-foreground/60 italic">Changing this updates the shareable URL for your form.</p>
            </div>

            {/* WhatsApp Number */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">WhatsApp Number</Label>
              <Input
                id="whatsapp"
                placeholder="e.g. 919876543210"
                value={localWhatsapp}
                onChange={(e) => setLocalWhatsapp(e.target.value)}
                className="input-premium h-11 rounded-xl"
              />
              <p className="text-[10px] text-muted-foreground/60">Include country code, no "+" or spaces.</p>
            </div>

            {/* Google Sheet Direct Integration */}
            <div className="space-y-2">
              <Label>Google Sheet Data Sink</Label>
              {isLoadingSheets ? (
                <div className="flex items-center text-sm text-muted-foreground"><Loader2 className="w-3 h-3 mr-2 animate-spin" /> Loading sheets...</div>
              ) : googleSheets && Array.isArray(googleSheets) ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={localGoogleSheetId}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        const selectedSheet = googleSheets.find((s: any) => s.id === selectedId);
                        setLocalGoogleSheetId(selectedId);
                        setLocalGoogleSheetName(selectedSheet ? selectedSheet.name : "");
                      }}
                    >
                      <option value="">Select a Spreadsheet...</option>
                      {googleSheets.map((sheet: any) => (
                        <option key={sheet.id} value={sheet.id}>
                          {sheet.name}
                        </option>
                      ))}
                    </select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => refetchSheets()}
                      title="Refresh Sheets"
                      type="button"
                    >
                      <Loader2 className={cn("w-4 h-4", isLoadingSheets && "animate-spin")} />
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground pr-4">Submissions will be automatically added as new rows in this spreadsheet.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground">Google account not connected or authorization expired.</p>
                  <Button variant="outline" size="sm" onClick={() => window.location.href = '/api/auth/google'}>
                    Connect Google Account
                  </Button>
                </div>
              )}
            </div>

            {/* Submit Button Text */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Submit Button Text</Label>
              <Input
                placeholder="Submit"
                value={localSubmitText}
                onChange={(e) => setLocalSubmitText(e.target.value)}
                className="input-premium h-11 rounded-xl"
              />
              <p className="text-[10px] text-muted-foreground/60">Customise the label on the submit button.</p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setLocalWhatsapp(whatsappNumber || "");
                  setLocalGoogleSheetId(googleSheetId || "");
                  setLocalGoogleSheetName(googleSheetName || "");
                  setLocalSlug(formSlug || "");
                  setLocalSubmitText(submitButtonText || "");
                  setShowSettingsDialog(false);
                }}
                className="flex-1 rounded-xl hover:bg-muted"
              >
                Cancel
              </Button>
              <Button
                disabled={createForm.isPending || updateForm.isPending}
                onClick={async () => {
                  setWhatsappNumber(localWhatsapp || null);
                  setGoogleSheet(localGoogleSheetId || null, localGoogleSheetName || null);
                  setFormSlug(localSlug || null);
                  setSubmitButtonText(localSubmitText || null);

                  // Wait for state updates to batch, then trigger handleSave
                  setTimeout(() => {
                    handleSave(true); // skip redirect to home page
                    setShowSettingsDialog(false);
                    toast({
                      title: "Settings Saved",
                      description: "Your form and integrations have been updated.",
                    });
                  }, 0);
                }}
                className="flex-[2] rounded-xl shadow-lg shadow-primary/20"
              >
                {(createForm.isPending || updateForm.isPending) ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Save Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
