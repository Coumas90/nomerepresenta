import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { useArtworks } from "@/hooks/useArtworks";
import { useSeries } from "@/hooks/useSeries";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProgressiveImage } from "@/components/ProgressiveImage";
import { useQueryClient } from "@tanstack/react-query";

const Works = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: artworks = [], isLoading: artworksLoading } = useArtworks();
  const { data: series = [], isLoading: seriesLoading } = useSeries();
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>("");

  const filteredArtworks = selectedSeriesId
    ? artworks.filter(a => a.series_id === selectedSeriesId)
    : artworks;

  const selectedSeries = series.find(s => s.id === selectedSeriesId);

  // Prefetch en hover
  const handleArtworkHover = (artworkId: string, imageUrl: string) => {
    // Prefetch data
    queryClient.prefetchQuery({
      queryKey: ["artwork", artworkId],
      queryFn: async () => {
        const { supabase } = await import("@/integrations/supabase/client");
        const { data } = await supabase
          .from("artworks")
          .select("*")
          .eq("id", artworkId)
          .single();
        return data;
      },
    });
    
    // Prefetch imagen principal
    const img = new Image();
    img.src = imageUrl;
  };

  if (artworksLoading || seriesLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">Loading...</div>
        </main>
      </>
    );
  }
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-background z-40 pt-24 pb-6 border-b">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-3xl font-bold tracking-tight">
                WORKS
                {selectedSeries && (
                  <>
                    <span className="mx-2">&gt;</span>
                    {selectedSeries.name}
                  </>
                )}
              </h1>
              <div className="flex items-center gap-3">
                <Select value={selectedSeriesId} onValueChange={setSelectedSeriesId}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All Series" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Series</SelectItem>
                    {series.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="container mx-auto px-6 py-12">
          {filteredArtworks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArtworks.map((artwork) => (
                <div
                  key={artwork.id}
                  className="group cursor-pointer"
                  onClick={() => navigate(`/artwork/${artwork.id}`)}
                  onMouseEnter={() => handleArtworkHover(artwork.id, artwork.image_url)}
                >
                  <div className="aspect-square bg-muted overflow-hidden mb-4 rounded-lg">
                    <ProgressiveImage
                      src={artwork.image_url}
                      alt={artwork.title}
                      className="w-full h-full transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium tracking-wide">{artwork.title}</h3>
                    <p className="text-xs text-muted-foreground">{artwork.year}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              No artworks found. {selectedSeries ? `Try selecting a different series.` : `Create some artworks in the admin panel.`}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Works;
