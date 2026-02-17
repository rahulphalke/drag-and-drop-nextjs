import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useFormBuilderStore } from "@/lib/store";
import { SortableField } from "./SortableField";
import { cn } from "@/lib/utils";
import { Ghost } from "lucide-react";

export function Canvas() {
  const { fields, selectedFieldId, selectField, removeField } = useFormBuilderStore();
  
  const { setNodeRef, isOver } = useDroppable({
    id: "canvas-droppable",
    data: {
      type: "canvas",
    },
  });

  return (
    <div className="flex-1 bg-muted/10 p-8 h-full overflow-y-auto flex justify-center">
      <div
        ref={setNodeRef}
        className={cn(
          "w-full max-w-[600px] min-h-[800px] bg-white rounded-xl shadow-sm border border-border/50 p-8 transition-colors duration-200",
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
        )}
      </div>
    </div>
  );
}
