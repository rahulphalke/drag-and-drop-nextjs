import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { FormField, FieldType } from '@shared/schema';

interface FormBuilderState {
  fields: FormField[];
  selectedFieldId: string | null;
  formTitle: string;
  formSlug: string | null;
  whatsappNumber: string | null;
  googleSheetUrl: string | null;
  submitButtonText: string | null;

  // Actions
  setFields: (fields: FormField[]) => void;
  setTitle: (title: string) => void;
  setFormSlug: (slug: string | null) => void;
  setWhatsappNumber: (num: string | null) => void;
  setGoogleSheetUrl: (url: string | null) => void;
  setSubmitButtonText: (text: string | null) => void;
  addField: (type: FieldType) => void;
  removeField: (id: string) => void;
  updateField: (id: string, updates: Partial<FormField>) => void;
  selectField: (id: string | null) => void;
  reorderFields: (activeId: string, overId: string) => void;
  resetForm: () => void;
}

export const useFormBuilderStore = create<FormBuilderState>((set) => ({
  fields: [],
  selectedFieldId: null,
  formTitle: "Untitled Form",
  formSlug: null,
  whatsappNumber: null,
  googleSheetUrl: null,
  submitButtonText: null,

  setFields: (fields) => set({ fields }),

  setTitle: (title) => set({ formTitle: title }),
  setFormSlug: (formSlug) => set({ formSlug }),
  setWhatsappNumber: (whatsappNumber) => set({ whatsappNumber }),
  setGoogleSheetUrl: (googleSheetUrl) => set({ googleSheetUrl }),
  setSubmitButtonText: (submitButtonText) => set({ submitButtonText }),

  addField: (type) => set((state) => {
    const defaultLabels: Record<FieldType, string> = {
      text: 'Text Input',
      textarea: 'Large Text',
      email: 'Email Address',
      number: 'Number Field',
      phone: 'Phone Number',
      rating: 'Rating',
      title: 'Section Title',
      dropdown: 'Dropdown Select',
      checkbox: 'Checkbox Group',
      radio: 'Radio Group',
      date: 'Date Picker'
    };

    const newField: FormField = {
      id: nanoid(),
      type,
      label: defaultLabels[type] || `New ${type}`,
      placeholder: (type === 'text' || type === 'textarea' || type === 'email' || type === 'number') ? 'Enter text...'
        : type === 'phone' ? '+1 (555) 000-0000'
          : undefined,
      required: type === 'title' ? false : false,
      // For rating, store max stars in options[0]
      options: (type === 'dropdown' || type === 'radio' || type === 'checkbox') ? ['Option 1', 'Option 2']
        : type === 'rating' ? ['5']
          : undefined,
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

  resetForm: () => set({
    fields: [],
    formTitle: "Untitled Form",
    formSlug: null,
    selectedFieldId: null,
    whatsappNumber: null,
    googleSheetUrl: null,
    submitButtonText: null,
  }),
}));
