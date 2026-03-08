import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useToggleCatalogVisibility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ imageId, artworkId, visible }: { imageId: string; artworkId: string; visible: boolean }) => {
      const { error } = await supabase
        .from("artwork_images")
        .update({ is_catalog_visible: visible } as any)
        .eq("id", imageId);
      if (error) throw error;
      return { artworkId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["artwork-images", data.artworkId] });
      queryClient.invalidateQueries({ queryKey: ["all-artwork-images"] });
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
};
