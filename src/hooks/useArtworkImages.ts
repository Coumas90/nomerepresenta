import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ArtworkImage } from "@/types";

export const useArtworkImages = (artworkId: string | undefined) => {
  return useQuery({
    queryKey: ["artwork-images", artworkId],
    queryFn: async () => {
      if (!artworkId) return [];
      
      const { data, error } = await supabase
        .from("artwork_images")
        .select("*")
        .eq("artwork_id", artworkId)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as ArtworkImage[];
    },
    enabled: !!artworkId,
  });
};

export const useAddArtworkImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      artwork_id: string;
      image_url: string;
      display_order: number;
      is_main: boolean;
    }) => {
      const { data: result, error } = await supabase
        .from("artwork_images")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["artwork-images", variables.artwork_id] });
      toast.success("Imagen agregada exitosamente");
    },
    onError: (error: Error) => {
      toast.error(`Error al agregar imagen: ${error.message}`);
    },
  });
};

export const useDeleteArtworkImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, artwork_id }: { id: string; artwork_id: string }) => {
      const { error } = await supabase
        .from("artwork_images")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { id, artwork_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["artwork-images", data.artwork_id] });
      toast.success("Imagen eliminada exitosamente");
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar imagen: ${error.message}`);
    },
  });
};

export const useUpdateImageOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (images: { id: string; display_order: number; artwork_id: string }[]) => {
      const updates = images.map(img =>
        supabase
          .from("artwork_images")
          .update({ display_order: img.display_order })
          .eq("id", img.id)
      );

      await Promise.all(updates);
      return images[0].artwork_id;
    },
    onSuccess: (artwork_id) => {
      queryClient.invalidateQueries({ queryKey: ["artwork-images", artwork_id] });
      toast.success("Orden actualizado");
    },
  });
};

export const useSetMainImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ imageId, artworkId }: { imageId: string; artworkId: string }) => {
      const { error: resetError } = await supabase
        .from("artwork_images")
        .update({ is_main: false })
        .eq("artwork_id", artworkId);

      if (resetError) throw resetError;

      const { error: setError } = await supabase
        .from("artwork_images")
        .update({ is_main: true })
        .eq("id", imageId);

      if (setError) throw setError;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["artwork-images", variables.artworkId] });
      toast.success("Imagen principal actualizada");
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar imagen principal: ${error.message}`);
    },
  });
};

export const useUpdateImageCaption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ imageId, artworkId, caption }: { imageId: string; artworkId: string; caption: string | null }) => {
      const { error } = await supabase
        .from("artwork_images")
        .update({ caption })
        .eq("id", imageId);

      if (error) throw error;
      return { artworkId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["artwork-images", data.artworkId] });
      toast.success("Caption actualizado");
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar caption: ${error.message}`);
    },
  });
};
