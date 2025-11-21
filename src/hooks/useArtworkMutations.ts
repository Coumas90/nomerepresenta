import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArtworkData } from "./useArtworks";

export const useCreateArtwork = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (artwork: Omit<ArtworkData, "id">) => {
      const { data, error } = await supabase
        .from("artworks")
        .insert(artwork)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artworks"] });
      toast({
        title: "Artwork Created",
        description: "The artwork has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create artwork",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateArtwork = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ArtworkData> & { id: string }) => {
      const { data, error } = await supabase
        .from("artworks")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artworks"] });
      toast({
        title: "Artwork Updated",
        description: "The artwork has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update artwork",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteArtwork = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("artworks")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artworks"] });
      toast({
        title: "Artwork Deleted",
        description: "The artwork has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete artwork",
        variant: "destructive",
      });
    },
  });
};

export const useUploadImage = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ file, fileName }: { file: File; fileName: string }) => {
      const { data, error } = await supabase.storage
        .from("artwork-images")
        .upload(fileName, file, {
          contentType: file.type,
          upsert: true,
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("artwork-images")
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    },
  });
};
