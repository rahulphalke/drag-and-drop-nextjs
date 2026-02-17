import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { FormField, FieldType } from '@shared/schema';

interface FormBuilderState {
  fields: FormField[];
  selectedFieldId: string | null;
  formTitle: string;
  
  // Actions
  setFields: (fields: FormField[]) => void;
  setTitle: (title: string) => void;
  addField: (type: FieldType) => void;
  removeField: (id: string) => void;
  updateField: (id: string, updates: Partial<FormField>) => void;
  selectField: (id: string | null) => void;
  reorderFields: (activeId: string, overId: string) => void;
}

export const useFormBuilderStore = create<FormBuilderState>((set) => ({
  fields: [],
  selectedFieldId: null,
  formTitle: "Untitled Form",

  setFields: (fields) => set({ fields }),
  
  setTitle: (title) => set({ formTitle: title }),

  addField: (type) => set((state) => {
    const newField: FormField = {
      id: nanoid(),
      type,
      label: `New ${type}`,
      placeholder: type === 'text' ? 'Enter text...' : undefined,
      required: false,
      options: (type === 'dropdown' || type === 'radio') ? ['Option 1', 'Option 2'] : undefined,
    };
    return { 
      fields: [...state.fields, newField],
      selectedFieldId: newField.id 
    };
  }),

  removeField: (id) => set((state) => ({
    fields: state.fields.filter((f) => f.id !== id),
    selectedFieldId: state.selectedFieldId === id ? null : state.selectedFieldId,
  })),

  updateField: (id, updates) => set((state) => ({
    fields: state.fields.map((f) => (f.id === id ? { ...f, ...updates } : f)),
  })),

  selectField: (id) => set({ selectedFieldId: id }),

  reorderFields: (activeId, overId) => set((state) => {
    const oldIndex = state.fields.findIndex((f) => f.id === activeId);
    const newIndex = state.fields.findIndex((f) => f.id === overId);
    
    const newFields = [...state.fields];
    const [movedItem] = newFields.splice(oldIndex, 1);
    newFields.splice(newIndex, 0, movedItem);

    return { fields: newFields };
  }),
}));
