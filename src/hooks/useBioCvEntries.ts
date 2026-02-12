import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type BioCvEntry = {
  id: string;
  section: string;
  year: string;
  title: string;
  venue: string | null;
  link: string | null;
  display_order: number;
};

export const useBioCvEntries = () => {
  return useQuery({
    queryKey: ["bio-cv-entries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bio_cv_entries")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as BioCvEntry[];
    },
  });
};

export const useCreateCvEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entry: Omit<BioCvEntry, "id">) => {
      const { error } = await supabase.from("bio_cv_entries").insert(entry);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bio-cv-entries"] });
      toast.success("CV entry added");
    },
    onError: () => toast.error("Failed to add CV entry"),
  });
};

export const useUpdateCvEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BioCvEntry> & { id: string }) => {
      const { error } = await supabase.from("bio_cv_entries").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bio-cv-entries"] });
      toast.success("CV entry updated");
    },
    onError: () => toast.error("Failed to update CV entry"),
  });
};

export const useDeleteCvEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bio_cv_entries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bio-cv-entries"] });
      toast.success("CV entry deleted");
    },
    onError: () => toast.error("Failed to delete CV entry"),
  });
};
