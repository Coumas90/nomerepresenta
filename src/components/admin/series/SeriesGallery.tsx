import type { CatalogArtwork } from "@/hooks/useCatalog";

interface SeriesGalleryProps {
  artworks: CatalogArtwork[];
}

export const SeriesGallery = ({ artworks }: SeriesGalleryProps) => {
  // Group by catalog_sub_series
  const grouped = new Map<string, CatalogArtwork[]>();
  const ungrouped: CatalogArtwork[] = [];

  for (const a of artworks) {
    if (a.catalog_sub_series) {
      const existing = grouped.get(a.catalog_sub_series) || [];
      existing.push(a);
      grouped.set(a.catalog_sub_series, existing);
    } else {
      ungrouped.push(a);
    }
  }

  const sortedGroups = Array.from(grouped.entries()).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="space-y-4 pt-3 border-t border-border mt-3">
      {/* Ungrouped artworks */}
      {ungrouped.length > 0 && (
        <ThumbnailGrid artworks={ungrouped} />
      )}

      {/* Sub-series groups */}
      {sortedGroups.map(([subSeries, items]) => (
        <div key={subSeries}>
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
            {subSeries} <span className="font-normal">({items.length})</span>
          </p>
          <ThumbnailGrid artworks={items} />
        </div>
      ))}

      {artworks.length === 0 && (
        <p className="text-xs text-muted-foreground py-2">No artworks in this series.</p>
      )}
    </div>
  );
};

const ThumbnailGrid = ({ artworks }: { artworks: CatalogArtwork[] }) => (
  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
    {artworks.map((a) => (
      <div key={a.id} className="group relative">
        <div className="aspect-square flex items-center justify-center bg-muted/30 rounded overflow-hidden">
          <img
            src={a.image_url}
            alt={a.title}
            className="max-w-full max-h-full object-contain"
            loading="lazy"
          />
        </div>
        <p className="text-[9px] text-muted-foreground truncate mt-0.5 leading-tight">{a.title}</p>
      </div>
    ))}
  </div>
);

export default SeriesGallery;
