import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { CategoryFolder } from "@/components/admin/catalog/CategoryFolder";
import { useCatalogArtworks, type CatalogArtwork, type MediumType } from "@/hooks/useCatalog";
import { SeriesGallery } from "@/components/admin/series/SeriesGallery";

const MEDIUM_TYPES: MediumType[] = ["PAINTING", "POW", "PHOTO", "ARTIST_BOOK"];

/** Expandable row for a catalog_series (category) within a medium type */
const CategoryRow = ({ name, artworks }: { name: string; artworks: CatalogArtwork[] }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border rounded-lg bg-card mb-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 w-full px-3 py-2.5 text-left hover:bg-muted/30 transition-colors rounded-lg"
      >
        {expanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
        <span className="text-sm font-medium flex-1">{name}</span>
        <span className="text-[10px] text-muted-foreground">{artworks.length}</span>
      </button>
      {expanded && (
        <div className="px-3 pb-3">
          <SeriesGallery artworks={artworks} />
        </div>
      )}
    </div>
  );
};

const SeriesManager = () => {
  const { data: catalogArtworks = [], isLoading } = useCatalogArtworks();
  const [openCategories, setOpenCategories] = useState<Set<MediumType>>(new Set());

  const toggleCategory = (mt: MediumType) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(mt)) next.delete(mt);
      else next.add(mt);
      return next;
    });
  };

  // Group artworks: medium_type → catalog_series → artworks
  const structure = useMemo(() => {
    const result = new Map<MediumType, { series: Map<string, CatalogArtwork[]>; total: number }>();

    for (const mt of MEDIUM_TYPES) {
      result.set(mt, { series: new Map(), total: 0 });
    }

    for (const a of catalogArtworks) {
      const mt = (a.medium_type as MediumType) || "PAINTING";
      const entry = result.get(mt);
      if (!entry) continue;

      const seriesName = a.catalog_series || "(No category)";
      const list = entry.series.get(seriesName) || [];
      list.push(a);
      entry.series.set(seriesName, list);
      entry.total++;
    }

    return result;
  }, [catalogArtworks]);

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Series (Catalog)</h2>
        <p className="text-sm text-muted-foreground">
          Visual reflection of your Catalog structure. Categories and sub-categories are managed in the Catalog.
        </p>
      </div>

      <div className="space-y-3">
        {MEDIUM_TYPES.map((mt) => {
          const data = structure.get(mt);
          if (!data) return null;

          // Sort series alphabetically, "(No category)" last
          const sortedSeries = Array.from(data.series.entries()).sort(([a], [b]) => {
            if (a === "(No category)") return 1;
            if (b === "(No category)") return -1;
            return a.localeCompare(b);
          });

          return (
            <CategoryFolder
              key={mt}
              category={mt}
              count={data.total}
              isOpen={openCategories.has(mt)}
              onToggle={() => toggleCategory(mt)}
            >
              <div className="p-3 space-y-1">
                {sortedSeries.length > 0 ? (
                  sortedSeries.map(([seriesName, artworks]) => (
                    <CategoryRow key={seriesName} name={seriesName} artworks={artworks} />
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground py-2">No artworks in this category.</p>
                )}
              </div>
            </CategoryFolder>
          );
        })}
      </div>
    </div>
  );
};

export default SeriesManager;
