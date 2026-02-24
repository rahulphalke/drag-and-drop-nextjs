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
    googleSheetUrl,
    submitButtonText,
    formSlug,
    setWhatsappNumber,
    setGoogleSheetUrl,
    setSubmitButtonText,
    setFormSlug,
  } = useFormBuilderStore();

  const { toast } = useToast();
  const createForm = useCreateForm();
  const updateForm = useUpdateForm();
  const { data: existingForm, isLoading: isLoadingForm } = useForm(editId ?? NaN);

  const [activeDragType, setActiveDragType] = useState<FieldType | null>(null);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>("canvas");
  const [hydrated, setHydrated] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [localWhatsapp, setLocalWhatsapp] = useState(whatsappNumber || "");
  const [localGoogleSheet, setLocalGoogleSheet] = useState(googleSheetUrl || "");
  const [localSlug, setLocalSlug] = useState(formSlug || "");
  const [localSubmitText, setLocalSubmitText] = useState(submitButtonText || "");

  // Update local state when store changes (e.g. on load)
  useEffect(() => {
    setLocalWhatsapp(whatsappNumber || "");
    setLocalGoogleSheet(googleSheetUrl || "");
    setLocalSlug(formSlug || "");
    setLocalSubmitText(submitButtonText || "");
  }, [whatsappNumber, googleSheetUrl, formSlug, submitButtonText]);

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
        setGoogleSheetUrl(existingForm.googleSheetUrl || null);
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
          googleSheetUrl: currentState.googleSheetUrl,
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
          googleSheetUrl: currentState.googleSheetUrl,
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
    const link = `${window.location.host}/share/${shareId}/${slug}`;
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
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="h-14 sm:h-16 border-b border-border bg-white px-3 sm:px-6 flex items-center justify-between shrink-0 z-10">
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
                defaultValue={`${window.location.host}/share/${existingForm?.shareId}/${existingForm?.slug || slugify(formTitle)}`}
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
          <div className="space-y-5 pt-4">

            {/* Form Link */}
            <div className="space-y-2">
              <Label>Form Link</Label>
              <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 w-full overflow-hidden">
                <span className="text-xs text-muted-foreground truncate shrink min-w-[50px]">{window.location.host}/share/{editId || '...'}/</span>
                <input
                  className="flex-1 bg-transparent text-sm outline-none min-w-0"
                  placeholder={slugify(formTitle) || "form-link"}
                  value={localSlug}
                  onChange={(e) => setLocalSlug(slugify(e.target.value))}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">Changing this updates the shareable URL for your form.</p>
            </div>

            {/* WhatsApp Number */}
            <div className="space-y-2">
              <Label>WhatsApp Number</Label>
              <Input
                id="whatsapp"
                placeholder="e.g. 919876543210"
                value={localWhatsapp}
                onChange={(e) => setLocalWhatsapp(e.target.value)}
                className="bg-muted/30"
              />
              <p className="text-[10px] text-muted-foreground">Include country code, no "+" or spaces.</p>
            </div>

            {/* Google Sheet URL */}
            <div className="space-y-2">
              <Label>Google Sheet URL (Webhook)</Label>
              <Input
                id="gsheet"
                placeholder="https://script.google.com/..."
                value={localGoogleSheet}
                onChange={(e) => setLocalGoogleSheet(e.target.value)}
                className="bg-muted/30"
              />
              <p className="text-[10px] text-muted-foreground">POST request will be sent to this URL on submission.</p>
            </div>

            {/* Submit Button Text */}
            <div className="space-y-2">
              <Label>Submit Button Text</Label>
              <Input
                placeholder="Submit"
                value={localSubmitText}
                onChange={(e) => setLocalSubmitText(e.target.value)}
                className="bg-muted/30"
              />
              <p className="text-[10px] text-muted-foreground">Customise the label on the submit button.</p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setLocalWhatsapp(whatsappNumber || "");
                  setLocalGoogleSheet(googleSheetUrl || "");
                  setLocalSlug(formSlug || "");
                  setLocalSubmitText(submitButtonText || "");
                  setShowSettingsDialog(false);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                disabled={createForm.isPending || updateForm.isPending}
                onClick={async () => {
                  setWhatsappNumber(localWhatsapp || null);
                  setGoogleSheetUrl(localGoogleSheet || null);
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
                className="flex-1"
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
