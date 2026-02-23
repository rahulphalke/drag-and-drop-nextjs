import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useFormBuilderStore } from "@/lib/store";
import { SortableField } from "./SortableField";
import { cn } from "@/lib/utils";
import { Ghost, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CanvasProps {
  isActive?: boolean;
}

export function Canvas({ isActive = true }: CanvasProps) {
  const { fields, selectedFieldId, selectField, removeField, submitButtonText } = useFormBuilderStore();

  const { setNodeRef, isOver } = useDroppable({
    id: "canvas-droppable",
    data: {
      type: "canvas",
    },
  });

  return (
    <div className={cn(
      "flex-1 bg-muted/10 p-2 sm:p-8 h-full overflow-y-auto flex justify-center items-start",
      !isActive && "hidden md:flex"
    )}>
      <div
        ref={setNodeRef}
        className={cn(
          "w-full max-w-[600px] bg-white rounded-xl shadow-sm border border-border/50 p-4 sm:p-8 pb-12 transition-colors duration-200",
          isOver && "bg-primary/5 ring-2 ring-primary ring-inset border-primary/50"
        )}
      >
        {fields.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground space-y-4 opacity-50">
            <Ghost className="w-16 h-16" />
            <div>
              <p className="text-lg font-medium">Your canvas is empty</p>
              <p className="text-sm">Drag items from the toolbox to start building.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
              {fields.map((field) => (
                <SortableField
                  key={field.id}
                  field={field}
                  isSelected={field.id === selectedFieldId}
                  onSelect={selectField}
                  onRemove={removeField}
                />
              ))}
            </SortableContext>

            {/* Preview of the Submit Button */}
            <div className="pt-6 border-t border-border/50 mt-8">
              <Button
                type="button"
                className="w-full h-12 text-lg font-bold shadow-sm pointer-events-none"
              >
                <Send className="w-5 h-5 mr-2" />
                {submitButtonText || "Submit Form"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
