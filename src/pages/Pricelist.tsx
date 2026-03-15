import { useState, useCallback, useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { usePricelistBySlug, usePricelistItems, useVerifyPricelistPassword } from "@/hooks/usePricelist";
import { useAllArtworkImages } from "@/hooks/useAllArtworkImages";
import { useSeries } from "@/hooks/useSeries";
import { useAnalytics } from "@/hooks/useAnalytics";
import { PricelistPasswordGate } from "@/components/pricelist/PricelistPasswordGate";
import { PricelistContent } from "@/components/pricelist/PricelistContent";

const Pricelist = () => {
  const { slug = "main" } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const magicToken = searchParams.get("token");
  const { data: pricelist, isLoading: plLoading, error: plError } = usePricelistBySlug(slug);
  const { trackPageView } = useAnalytics();
  const verifyPassword = useVerifyPricelistPassword();

  // Check magic token match
  const isMagicAuth = useMemo(() => {
    return !!(magicToken && pricelist?.magic_token && magicToken === pricelist.magic_token);
  }, [magicToken, pricelist?.magic_token]);

  const [authenticated, setAuthenticated] = useState(() => {
    return sessionStorage.getItem(`pricelist-auth-${slug}`) === "true";
  });

  const handleAuth = useCallback(
    async (password: string): Promise<boolean> => {
      try {
        const result = await verifyPassword.mutateAsync({ slug, password });
        if (result.success) {
          sessionStorage.setItem(`pricelist-auth-${slug}`, "true");
          setAuthenticated(true);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [slug, verifyPassword]
  );

  const { data: items, isLoading: itemsLoading } = usePricelistItems(pricelist?.id || "");
  const { data: allImages, isLoading: imagesLoading } = useAllArtworkImages();
  const { data: series } = useSeries();

  // Auto-authenticate via magic token
  useEffect(() => {
    if (isMagicAuth && !authenticated) {
      sessionStorage.setItem(`pricelist-auth-${slug}`, "true");
      setAuthenticated(true);
    }
  }, [isMagicAuth, authenticated, slug]);

  // Track page view once authenticated
  useEffect(() => {
    if ((authenticated || isMagicAuth) && pricelist) {
      trackPageView(`/selected/${slug}`, `Pricelist - ${pricelist.name}`);
    }
  }, [authenticated, isMagicAuth, pricelist, slug, trackPageView]);

  if (plLoading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-stone-400" />
      </div>
    );
  }

  if (plError || !pricelist) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <p className="text-stone-500 text-sm">Pricelist not found.</p>
      </div>
    );
  }

  if (!authenticated) {
    return <PricelistPasswordGate onSubmit={handleAuth} />;
  }

  const visibleItems = items?.filter((item) => item.is_visible) || [];
  const seriesMap = new Map(series?.map((s) => [s.id, s]) || []);

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
      pricelistName={pricelist.name}
      headerName={pricelist.header_name}
      seriesName={pricelist.series_name}
      activeCurrency={pricelist.active_currency || "USD"}
    />
  );
};

export default Pricelist;
