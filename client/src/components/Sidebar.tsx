import { useDraggable } from "@dnd-kit/core";
import { Type, AlignLeft, Mail, Hash, Phone, Star, Heading, List, CheckSquare, CircleDot, Calendar as CalendarIcon, GripVertical, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldType } from "@shared/schema";

interface SidebarItemProps {
  type: FieldType;
  label: string;
  icon: React.ElementType;
  onAdd?: (type: FieldType) => void;
}

function SidebarItem({ type, label, icon: Icon, onAdd }: SidebarItemProps) {
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
      {/* Desktop: grip handle | Mobile: tap-to-add button */}
      <GripVertical className="ml-auto w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hidden md:block" />
      {onAdd && (
        <button
          onClick={(e) => { e.stopPropagation(); onAdd(type); }}
          className="ml-auto md:hidden p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
          aria-label={`Add ${label}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

interface SidebarProps {
  isActive?: boolean;
  onAddField?: (type: FieldType) => void;
}

export function Sidebar({ isActive = true, onAddField }: SidebarProps) {
  return (
    <div className={cn(
      "w-full md:w-[280px] border-r border-border bg-muted/30 p-4 md:p-6 flex flex-col h-full overflow-y-auto",
      !isActive && "hidden md:flex"
    )}>
      <div className="mb-6 md:mb-8">
        <h2 className="text-lg font-bold font-display text-foreground mb-1">Toolbox</h2>
        <p className="text-xs text-muted-foreground">Drag fields · Tap + to add on mobile</p>
      </div>

      <div className="space-y-1">
        <SidebarItem type="title" label="Title / Heading" icon={Heading} onAdd={onAddField} />
        <SidebarItem type="text" label="Text Input" icon={Type} onAdd={onAddField} />
        <SidebarItem type="textarea" label="Large Text" icon={AlignLeft} onAdd={onAddField} />
        <SidebarItem type="email" label="Email Address" icon={Mail} onAdd={onAddField} />
        <SidebarItem type="phone" label="Phone Number" icon={Phone} onAdd={onAddField} />
        <SidebarItem type="number" label="Number Field" icon={Hash} onAdd={onAddField} />
        <SidebarItem type="rating" label="Rating" icon={Star} onAdd={onAddField} />
        <SidebarItem type="dropdown" label="Dropdown" icon={List} onAdd={onAddField} />
        <SidebarItem type="checkbox" label="Checkbox" icon={CheckSquare} onAdd={onAddField} />
        <SidebarItem type="radio" label="Radio Group" icon={CircleDot} onAdd={onAddField} />
        <SidebarItem type="date" label="Date Picker" icon={CalendarIcon} onAdd={onAddField} />
      </div>
    </div>
  );
}
