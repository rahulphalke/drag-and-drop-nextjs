import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FormField } from "@shared/schema";
import { cn } from "@/lib/utils";
import { Type, List, CheckSquare, CircleDot, Calendar as CalendarIcon, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface SortableFieldProps {
  field: FormField;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
}

const icons = {
  text: Type,
  dropdown: List,
  checkbox: CheckSquare,
  radio: CircleDot,
  date: CalendarIcon,
};

export function SortableField({ field, isSelected, onSelect, onRemove }: SortableFieldProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = icons[field.type];

  // Prevent drag when interacting with form elements
  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(field.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group mb-4 p-6 rounded-xl border-2 bg-white transition-all duration-200",
        isSelected 
          ? "border-primary ring-4 ring-primary/10 shadow-xl z-10" 
          : "border-transparent hover:border-border shadow-sm hover:shadow-md",
        isDragging && "opacity-50 z-50 shadow-2xl scale-[1.02]"
      )}
      onClick={handleSelect}
    >
      {/* Drag Handle */}
      <div 
        {...attributes} 
        {...listeners}
        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="w-5 h-5" />
      </div>

      {/* Field Content Wrapper */}
      <div className="pl-8 pr-8">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-md bg-primary/10 text-primary">
            <Icon className="w-4 h-4" />
          </div>
          <Label className="text-base font-semibold cursor-pointer">
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
        </div>

        {/* Field Previews - Non-interactive generally, just for show */}
        <div className="pointer-events-none">
          {field.type === 'text' && (
            <Input placeholder={field.placeholder} disabled className="bg-muted/10 border-dashed" />
          )}

          {field.type === 'dropdown' && (
            <Select disabled>
              <SelectTrigger className="bg-muted/10 border-dashed">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
            </Select>
          )}

          {field.type === 'checkbox' && (
            <div className="flex items-center space-x-2">
              <Checkbox id={field.id} disabled />
              <label className="text-sm font-medium leading-none text-muted-foreground">
                {field.label}
              </label>
            </div>
          )}

          {field.type === 'radio' && (
            <RadioGroup disabled>
              {field.options?.map((opt, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt} id={`${field.id}-${i}`} />
                  <Label htmlFor={`${field.id}-${i}`}>{opt}</Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {field.type === 'date' && (
            <Button variant="outline" className="w-full justify-start text-left font-normal bg-muted/10 border-dashed" disabled>
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>Pick a date</span>
            </Button>
          )}
        </div>
      </div>

      {/* Delete Button */}
      {isSelected && (
        <Button
          variant="destructive"
          size="icon"
          className="absolute -right-3 -top-3 w-8 h-8 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(field.id);
          }}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
