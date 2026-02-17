import { useFormBuilderStore } from "@/lib/store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";

export function SettingsPanel() {
  const { fields, selectedFieldId, updateField } = useFormBuilderStore();
  
  const selectedField = fields.find((f) => f.id === selectedFieldId);

  if (!selectedField) {
    return (
      <div className="w-[320px] bg-white border-l border-border p-6 flex flex-col items-center justify-center text-center h-full">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <span className="text-2xl">🎨</span>
        </div>
        <h3 className="text-lg font-bold font-display text-foreground">No Field Selected</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-[200px]">
          Click on a field in the canvas to edit its properties.
        </p>
      </div>
    );
  }

  return (
    <div className="w-[320px] bg-white border-l border-border flex flex-col h-full overflow-y-auto">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-bold font-display">Properties</h2>
        <p className="text-xs text-muted-foreground">Edit field configuration</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Common Properties */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Field Label</Label>
            <Input
              value={selectedField.label}
              onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
              className="bg-muted/30"
            />
          </div>

          {(selectedField.type === 'text' || selectedField.type === 'dropdown') && (
            <div className="space-y-2">
              <Label>Placeholder</Label>
              <Input
                value={selectedField.placeholder || ''}
                onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                className="bg-muted/30"
              />
            </div>
          )}

          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
            <div className="space-y-0.5">
              <Label>Required</Label>
              <div className="text-xs text-muted-foreground">Is this field mandatory?</div>
            </div>
            <Switch
              checked={selectedField.required}
              onCheckedChange={(checked) => updateField(selectedField.id, { required: checked })}
            />
          </div>
        </div>

        <Separator />

        {/* Options for Dropdown/Radio */}
        {(selectedField.type === 'dropdown' || selectedField.type === 'radio') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Options</Label>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  const newOptions = [...(selectedField.options || []), `Option ${(selectedField.options?.length || 0) + 1}`];
                  updateField(selectedField.id, { options: newOptions });
                }}
              >
                <Plus className="w-3 h-3 mr-1" /> Add
              </Button>
            </div>
            
            <div className="space-y-2">
              {selectedField.options?.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(selectedField.options || [])];
                      newOptions[index] = e.target.value;
                      updateField(selectedField.id, { options: newOptions });
                    }}
                    className="h-8 text-sm"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      const newOptions = (selectedField.options || []).filter((_, i) => i !== index);
                      updateField(selectedField.id, { options: newOptions });
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
