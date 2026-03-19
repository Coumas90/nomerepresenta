import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface WorksSection {
  id: string;
  name: string;
  display_order: number;
  is_visible: boolean;
  show_in_header: boolean;
  created_at: string;
  updated_at: string;
}

export const useWorksSections = () => {
  return useQuery({
    queryKey: ["works-sections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("works_sections" as any)
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as unknown as WorksSection[];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateWorksSection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; display_order: number }) => {
      const { data: result, error } = await supabase
        .from("works_sections" as any)
        .insert(data as any)
        .select()
        .single();
      if (error) throw error;
      return result as unknown as WorksSection;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["works-sections"] }),
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useUpdateWorksSection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Pick<WorksSection, "name" | "is_visible">> }) => {
      const { error } = await supabase
        .from("works_sections" as any)
        .update(updates as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["works-sections"] }),
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useDeleteWorksSection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("works_sections" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["works-sections"] });
      qc.invalidateQueries({ queryKey: ["works-blocks"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useReorderWorksSections = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (items: { id: string; display_order: number }[]) => {
      await Promise.all(
        items.map((item) =>
          supabase
            .from("works_sections" as any)
            .update({ display_order: item.display_order } as any)
            .eq("id", item.id)
        )
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["works-sections"] }),
  });
};
