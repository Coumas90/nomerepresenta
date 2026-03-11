import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { ArtworkData } from "@/types";
import { compressImageWithDetails, formatFileSize } from "@/lib/imageCompression";
import { getCompressionOptions } from "@/hooks/useCompressionSettings";

export const useCreateArtwork = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (artwork: Omit<ArtworkData, "id">) => {
      // Calculate display_order automatically if not provided or is 0
      let displayOrder = artwork.display_order;
      if (displayOrder === 0 || displayOrder === undefined) {
        const { data: maxOrderData } = await supabase
          .from("artworks")
          .select("display_order")
          .eq("series_id", artwork.series_id)
          .order("display_order", { ascending: false })
          .limit(1);
        
        const maxOrder = maxOrderData?.[0]?.display_order ?? -1;
        displayOrder = maxOrder + 1;
      }

      const { data, error } = await supabase
        .from("artworks")
        .insert({ ...artwork, display_order: displayOrder })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artworks"] });
      queryClient.invalidateQueries({ queryKey: ["catalog-artworks"] });
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
      queryClient.invalidateQueries({ queryKey: ["catalog-artworks"] });
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
      // Get compression settings from admin panel
      const compressionOptions = getCompressionOptions();
      
      // Compress with AVIF fallback if WebP doesn't achieve enough savings
      const result = await compressImageWithDetails(file, compressionOptions);

      // Get the correct extension based on format used
      const extension = result.format === 'avif' ? '.avif' : 
                       result.format === 'webp' ? '.webp' : 
                       file.name.substring(file.name.lastIndexOf('.'));
      const optimizedFileName = fileName.replace(/\.(jpg|jpeg|png|gif|bmp|tiff?)$/i, extension);

      const { data, error } = await supabase.storage
        .from("artwork-images")
        .upload(optimizedFileName, result.file, {
          contentType: result.file.type,
          upsert: true,
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("artwork-images")
        .getPublicUrl(optimizedFileName);

      console.log(`[Upload] ${optimizedFileName}: ${formatFileSize(result.originalSize)} → ${formatFileSize(result.compressedSize)} (${result.savingsPercent.toFixed(1)}% saved, format: ${result.format})`);

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

export const useUpdateArtworksOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (artworks: { id: string; display_order: number; series_id: string }[]) => {
      const updates = artworks.map(a => 
        supabase
          .from("artworks")
          .update({ display_order: a.display_order })
          .eq("id", a.id)
      );

      const results = await Promise.all(updates);
      const error = results.find(r => r.error);
      if (error?.error) throw error.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artworks"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update artwork order",
        variant: "destructive",
      });
    },
  });
};
