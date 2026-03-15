import { supabase } from "@/integrations/supabase/client";

const HTTP_URL_REGEX = /^https?:\/\//i;

/**
 * Normalizes artwork image values from DB into a browser-loadable public URL.
 * Handles full URLs, bucket-relative paths, and storage object-style paths.
 */
export const resolveArtworkImageUrl = (imageUrl?: string | null): string => {
  if (!imageUrl) return "";

  if (
    HTTP_URL_REGEX.test(imageUrl) ||
    imageUrl.startsWith("data:") ||
    imageUrl.startsWith("blob:")
  ) {
    return imageUrl;
  }

  let path = imageUrl.trim().replace(/^\/+/, "").split("?")[0];

  const objectPublicMarker = "object/public/artwork-images/";
  const markerIndex = path.indexOf(objectPublicMarker);
  if (markerIndex !== -1) {
    path = path.slice(markerIndex + objectPublicMarker.length);
  }

  if (path.startsWith("artwork-images/")) {
    path = path.slice("artwork-images/".length);
  }

  if (!path) return imageUrl;

  const { data } = supabase.storage.from("artwork-images").getPublicUrl(path);
  return data.publicUrl;
};
