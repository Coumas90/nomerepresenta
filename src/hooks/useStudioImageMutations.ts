import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { StudioImage } from "./useStudioImages";
import { compressImage, formatFileSize } from "@/lib/imageCompression";

export const useUploadStudioImage = () => {
  return useMutation({
    mutationFn: async ({ file, fileName }: { file: File; fileName: string }) => {
      const originalSize = file.size;
      
      // Compress and convert to WebP before upload
      const compressedFile = await compressImage(file, {
        maxSizeMB: 2,
        maxWidthOrHeight: 2400,
        fileType: 'image/webp',
        initialQuality: 0.85,
      });

      // Update filename to .webp extension
      const webpFileName = fileName.replace(/\.(jpg|jpeg|png|gif|bmp|tiff?)$/i, '.webp');

      const { data, error } = await supabase.storage
        .from("artwork-images")
        .upload(`studio/${webpFileName}`, compressedFile, {
          contentType: 'image/webp',
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("artwork-images")
        .getPublicUrl(data.path);

      // Log compression savings
      const savings = ((1 - compressedFile.size / originalSize) * 100).toFixed(1);
      console.log(`[Upload] studio/${webpFileName}: ${formatFileSize(originalSize)} → ${formatFileSize(compressedFile.size)} (${savings}% saved)`);

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
