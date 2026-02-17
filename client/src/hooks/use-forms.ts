import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useForms() {
  return useQuery({
    queryKey: [api.forms.list.path],
    queryFn: async () => {
      const res = await fetch(api.forms.list.path);
      if (!res.ok) throw new Error("Failed to fetch forms");
      return api.forms.list.responses[200].parse(await res.json());
    },
  });
}

export function useForm(id: number) {
  return useQuery({
    queryKey: [api.forms.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.forms.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch form");
      return api.forms.get.responses[200].parse(await res.json());
    },
    enabled: !isNaN(id),
  });
}

export function useCreateForm() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: any) => {
      // Validate with schema on send
      const validated = api.forms.create.input.parse(data);
      const res = await fetch(api.forms.create.path, {
        method: api.forms.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.forms.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create form");
      }
      return api.forms.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.forms.list.path] });
      toast({
        title: "Success",
        description: "Form created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateForm() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & any) => {
      const validated = api.forms.update.input.parse(updates);
      const url = buildUrl(api.forms.update.path, { id });
      
      const res = await fetch(url, {
        method: api.forms.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        if (res.status === 404) throw new Error("Form not found");
        throw new Error("Failed to update form");
      }
      return api.forms.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.forms.list.path] });
      toast({
        title: "Saved",
        description: "Form updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
