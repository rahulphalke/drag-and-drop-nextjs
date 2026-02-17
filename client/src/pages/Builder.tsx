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
import { arrayMove } from "@dnd-kit/sortable";
import { useState } from "react";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/Sidebar";
import { Canvas } from "@/components/Canvas";
import { SettingsPanel } from "@/components/SettingsPanel";
import { useFormBuilderStore } from "@/lib/store";
import { useCreateForm } from "@/hooks/use-forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Eye, Loader2 } from "lucide-react";
import { FieldType } from "@shared/schema";
import { createPortal } from "react-dom";

export default function Builder() {
  const [, setLocation] = useLocation();
  const { 
    fields, 
    addField, 
    reorderFields, 
    formTitle, 
    setTitle,
    setFields 
  } = useFormBuilderStore();
  
  const createForm = useCreateForm();
  const [activeDragType, setActiveDragType] = useState<FieldType | null>(null);

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

  const handleDragOver = (event: DragOverEvent) => {
    // We can add sophisticated preview logic here if needed
  };

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

  const handleSave = () => {
    createForm.mutate(
      {
        title: formTitle,
        fields: fields,
      },
      {
        onSuccess: () => {
          setLocation("/");
          // Reset store ideally here
        },
      }
    );
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-border bg-white px-6 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="h-6 w-px bg-border" />
          <Input 
            value={formTitle} 
            onChange={(e) => setTitle(e.target.value)}
            className="border-transparent hover:border-border focus:border-primary text-lg font-display font-bold w-[300px] h-9" 
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.alert("Preview mode not implemented yet")}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave} disabled={createForm.isPending || fields.length === 0}>
            {createForm.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Form
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
          <Sidebar />
          <Canvas />
          <SettingsPanel />

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
    </div>
  );
}
