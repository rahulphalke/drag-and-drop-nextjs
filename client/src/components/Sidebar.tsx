import { useDraggable } from "@dnd-kit/core";
import { Type, List, CheckSquare, CircleDot, Calendar as CalendarIcon, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldType } from "@shared/schema";

interface SidebarItemProps {
  type: FieldType;
  label: string;
  icon: React.ElementType;
}

function SidebarItem({ type, label, icon: Icon }: SidebarItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-${type}`,
    data: {
      type: "sidebar-item",
      fieldType: type,
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "flex items-center gap-3 p-3 mb-3 bg-white border border-border rounded-xl shadow-sm cursor-grab hover:border-primary/50 hover:shadow-md transition-all active:cursor-grabbing group",
        isDragging && "opacity-50 border-dashed"
      )}
    >
      <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
        <Icon className="w-5 h-5" />
      </div>
      <span className="font-medium text-sm text-foreground">{label}</span>
      <GripVertical className="ml-auto w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

export function Sidebar() {
  return (
    <div className="w-[280px] border-r border-border bg-muted/30 p-6 flex flex-col h-full overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-lg font-bold font-display text-foreground mb-1">Toolbox</h2>
        <p className="text-xs text-muted-foreground">Drag fields to the canvas</p>
      </div>

      <div className="space-y-1">
        <SidebarItem type="text" label="Text Input" icon={Type} />
        <SidebarItem type="dropdown" label="Dropdown" icon={List} />
        <SidebarItem type="checkbox" label="Checkbox" icon={CheckSquare} />
        <SidebarItem type="radio" label="Radio Group" icon={CircleDot} />
        <SidebarItem type="date" label="Date Picker" icon={CalendarIcon} />
      </div>
    </div>
  );
}
