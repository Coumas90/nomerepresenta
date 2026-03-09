import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { ShowData, ShowImage } from "@/types/show";
import { compressImageWithDetails, formatFileSize } from "@/lib/imageCompression";
import { getCompressionOptions } from "@/hooks/useCompressionSettings";

export const useCreateShow = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (input: Partial<ShowData>) => {
      const { data, error } = await supabase.from("shows").insert(input).select().single();
      if (error) throw error;
      return data as ShowData;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shows"] });
      toast({ title: "Show created" });
    },
    onError: (e) => toast({ title: "Error", description: (e as Error).message, variant: "destructive" }),
  });
};

export const useUpdateShow = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ShowData> & { id: string }) => {
      const { data, error } = await supabase.from("shows").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data as ShowData;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shows"] });
      toast({ title: "Show updated" });
    },
    onError: (e) => toast({ title: "Error", description: (e as Error).message, variant: "destructive" }),
  });
};

export const useDeleteShow = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("shows").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shows"] });
      toast({ title: "Show deleted" });
    },
    onError: (e) => toast({ title: "Error", description: (e as Error).message, variant: "destructive" }),
  });
};

export const useUploadShowImage = () => {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ file, fileName }: { file: File; fileName: string }) => {
      const compressionOptions = getCompressionOptions();
      const result = await compressImageWithDetails(file, compressionOptions);
      const extension = result.format === "avif" ? ".avif" : result.format === "webp" ? ".webp" : file.name.substring(file.name.lastIndexOf("."));
      const optimizedFileName = `shows/${fileName.replace(/\.(jpg|jpeg|png|gif|bmp|tiff?)$/i, extension)}`;
      const { error } = await supabase.storage.from("artwork-images").upload(optimizedFileName, result.file, { contentType: result.file.type, upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("artwork-images").getPublicUrl(optimizedFileName);
      console.log(`[Show Upload] ${optimizedFileName}: ${formatFileSize(result.originalSize)} → ${formatFileSize(result.compressedSize)} (${result.savingsPercent.toFixed(1)}% saved)`);
      return urlData.publicUrl;
    },
    onError: (e) => toast({ title: "Upload Failed", description: (e as Error).message, variant: "destructive" }),
  });
};

export const useAddShowImage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { show_id: string; image_url: string; display_order?: number; caption?: string }) => {
      const { data, error } = await supabase.from("show_images").insert(input).select().single();
      if (error) throw error;
      return data as ShowImage;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["show-images", vars.show_id] });
      qc.invalidateQueries({ queryKey: ["all-show-images"] });
    },
  });
};

export const useDeleteShowImage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, showId }: { id: string; showId: string }) => {
      const { error } = await supabase.from("show_images").delete().eq("id", id);
      if (error) throw error;
      return showId;
    },
    onSuccess: (showId) => {
      qc.invalidateQueries({ queryKey: ["show-images", showId] });
      qc.invalidateQueries({ queryKey: ["all-show-images"] });
    },
  });
};

export const useUpdateShowImageOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (images: { id: string; display_order: number }[]) => {
      const updates = images.map((img) => supabase.from("show_images").update({ display_order: img.display_order }).eq("id", img.id));
      await Promise.all(updates);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["show-images"] });
      qc.invalidateQueries({ queryKey: ["all-show-images"] });
    },
  });
};
