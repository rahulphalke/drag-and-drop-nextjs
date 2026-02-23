import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FormField, FieldType } from "@shared/schema";
import { cn } from "@/lib/utils";
import { Type, AlignLeft, Mail, Hash, Phone, Star, Heading, List, CheckSquare, CircleDot, Calendar as CalendarIcon, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";

interface SortableFieldProps {
  field: FormField;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
}

const icons: Record<FieldType, any> = {
  text: Type,
  textarea: AlignLeft,
  email: Mail,
  number: Hash,
  phone: Phone,
  rating: Star,
  title: Heading,
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
        {/* Hide icon+label header for title type — it renders its own content */}
        {field.type !== 'title' && (
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-md bg-primary/10 text-primary">
              <Icon className="w-4 h-4" />
            </div>
            <Label className="text-base font-semibold cursor-pointer">
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
          </div>
        )}

        {/* Field Previews - Non-interactive generally, just for show */}
        <div className="pointer-events-none space-y-4">
          {field.type === 'title' && (
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground">
                {field.label || <span className="text-muted-foreground italic font-normal">Add title here</span>}
              </h2>
              <p className="text-sm text-muted-foreground">
                {field.placeholder || <span className="italic">Description</span>}
              </p>
            </div>
          )}

          {(field.type === 'text' || field.type === 'email' || field.type === 'number') && (
            <Input
              type={field.type === 'number' ? 'number' : 'text'}
              placeholder={field.placeholder}
              disabled
              className="bg-muted/10 border-dashed"
            />
          )}

          {field.type === 'phone' && (
            <Input
              type="tel"
              placeholder={field.placeholder || '+1 (555) 000-0000'}
              disabled
              className="bg-muted/10 border-dashed"
            />
          )}

          {field.type === 'rating' && (
            <div className="flex gap-1">
              {Array.from({ length: parseInt(field.options?.[0] || '5', 10) }).map((_, i) => (
                <Star key={i} className="w-6 h-6 text-muted-foreground/40" />
              ))}
            </div>
          )}

          {field.type === 'textarea' && (
            <Textarea
              placeholder={field.placeholder}
              disabled
              className="bg-muted/10 border-dashed min-h-[100px]"
            />
          )}

          {field.type === 'dropdown' && (
            <Select disabled>
              <SelectTrigger className="bg-muted/10 border-dashed">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
            </Select>
          )}

          {field.type === 'checkbox' && (
            <div className="space-y-2">
              {field.options && field.options.length > 0 ? (
                field.options.map((opt, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <Checkbox id={`${field.id}-${i}`} disabled />
                    <Label className="text-sm font-medium leading-none text-muted-foreground">
                      {opt}
                    </Label>
                  </div>
                ))
              ) : (
                <div className="flex items-center space-x-2">
                  <Checkbox id={field.id} disabled />
                  <Label className="text-sm font-medium leading-none text-muted-foreground">
                    {field.label}
                  </Label>
                </div>
              )}
            </div>
          )}

          {field.type === 'radio' && (
            <RadioGroup disabled>
              {field.options?.map((opt, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt} id={`${field.id}-${i}`} />
                  <Label htmlFor={`${field.id}-${i}`} className="text-muted-foreground">{opt}</Label>
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
