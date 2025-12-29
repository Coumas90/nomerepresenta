import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { StudioImage } from "@/types";
import { compressImageWithDetails, formatFileSize } from "@/lib/imageCompression";
import { getCompressionOptions } from "@/hooks/useCompressionSettings";

export const useUploadStudioImage = () => {
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
        .upload(`studio/${optimizedFileName}`, result.file, {
          contentType: result.file.type,
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("artwork-images")
        .getPublicUrl(data.path);

      console.log(`[Upload] studio/${optimizedFileName}: ${formatFileSize(result.originalSize)} → ${formatFileSize(result.compressedSize)} (${result.savingsPercent.toFixed(1)}% saved, format: ${result.format})`);

      return urlData.publicUrl;
    },
    onError: () => {
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useCreateStudioImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (image: Omit<StudioImage, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("studio_images")
        .insert(image)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studio-images"] });
      toast({
        title: "Image added",
        description: "Studio image has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add studio image.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateStudioImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<StudioImage> & { id: string }) => {
      const { data, error } = await supabase
        .from("studio_images")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studio-images"] });
      toast({
        title: "Image updated",
        description: "Studio image has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update studio image.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteStudioImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("studio_images")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studio-images"] });
      toast({
        title: "Image deleted",
        description: "Studio image has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete studio image.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateStudioImagesOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (images: { id: string; display_order: number }[]) => {
      const updates = images.map((img) =>
        supabase
          .from("studio_images")
          .update({ display_order: img.display_order })
          .eq("id", img.id)
      );

      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studio-images"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reorder images.",
        variant: "destructive",
      });
    },
  });
};
