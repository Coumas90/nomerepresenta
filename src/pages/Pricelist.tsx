import { useState, useCallback } from "react";
import { usePricelist } from "@/hooks/usePricelist";
import { useAllArtworkImages } from "@/hooks/useAllArtworkImages";
import { useSeries } from "@/hooks/useSeries";
import { PricelistPasswordGate } from "@/components/pricelist/PricelistPasswordGate";
import { PricelistContent } from "@/components/pricelist/PricelistContent";

const PRICELIST_PASSWORD = "ivan123";

const Pricelist = () => {
  const [authenticated, setAuthenticated] = useState(() => {
    return sessionStorage.getItem("pricelist-auth") === "true";
  });

  const handleAuth = useCallback((password: string) => {
    if (password === PRICELIST_PASSWORD) {
      sessionStorage.setItem("pricelist-auth", "true");
      setAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const { data: items, isLoading: itemsLoading } = usePricelist();
  const { data: allImages, isLoading: imagesLoading } = useAllArtworkImages();
  const { data: series } = useSeries();

  if (!authenticated) {
    return <PricelistPasswordGate onSubmit={handleAuth} />;
  }

  const visibleItems = items?.filter((item) => item.is_visible) || [];
  const seriesMap = new Map(series?.map((s) => [s.id, s]) || []);

  // Group by series
  const grouped = new Map<string, typeof visibleItems>();
  for (const item of visibleItems) {
    const seriesId = item.artwork?.series_id;
    if (!seriesId) continue;
    if (!grouped.has(seriesId)) grouped.set(seriesId, []);
    grouped.get(seriesId)!.push(item);
  }

  return (
    <PricelistContent
      grouped={grouped}
      seriesMap={seriesMap}
      allImages={allImages}
      isLoading={itemsLoading || imagesLoading}
    />
  );
};

export default Pricelist;
