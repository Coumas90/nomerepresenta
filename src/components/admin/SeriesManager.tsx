import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { CategoryFolder } from "@/components/admin/catalog/CategoryFolder";
import { useCatalogArtworks, type CatalogArtwork, type MediumType } from "@/hooks/useCatalog";
import { SeriesGallery } from "@/components/admin/series/SeriesGallery";

const MEDIUM_TYPES: MediumType[] = ["PAINTING", "POW", "PHOTO", "ARTIST_BOOK"];

/** Sub-series row — indented under its parent series */
const SubSeriesRow = ({ name, artworks }: { name: string; artworks: CatalogArtwork[] }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="ml-6 border-l-2 border-border/50">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-muted/30 transition-colors"
      >
        {expanded ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
        <span className="text-xs font-medium text-muted-foreground flex-1">{name}</span>
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

/** Main series row (e.g. TRI-PEEL) with nested sub-series */
const MainSeriesRow = ({
  name,
  allArtworks,
  subSeries,
}: {
  name: string;
  allArtworks: CatalogArtwork[];
  subSeries: [string, CatalogArtwork[]][];
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border rounded-lg bg-card mb-2 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 w-full px-3 py-2.5 text-left hover:bg-muted/30 transition-colors"
      >
        {expanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
        <span className="text-sm font-semibold flex-1">{name}</span>
        <span className="text-[10px] text-muted-foreground">{allArtworks.length}</span>
      </button>
      {expanded && (
        <div className="pb-2">
          {/* Full series gallery with all works */}
          <div className="px-3 pb-3">
            <SeriesGallery artworks={allArtworks} />
          </div>

          {/* Sub-series nested underneath */}
          {subSeries.length > 0 && (
            <div className="border-t border-border/50 pt-1">
              {subSeries.map(([subName, subArtworks]) => (
                <SubSeriesRow key={subName} name={subName} artworks={subArtworks} />
              ))}
            </div>
          )}
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

  // Build 3-level hierarchy: medium_type → catalog_series → catalog_sub_series
  const structure = useMemo(() => {
    const result = new Map<
      MediumType,
      {
        total: number;
        seriesList: {
          name: string;
          allArtworks: CatalogArtwork[];
          subSeries: [string, CatalogArtwork[]][];
        }[];
      }
    >();

    for (const mt of MEDIUM_TYPES) {
      result.set(mt, { total: 0, seriesList: [] });
    }

    // Group by medium_type → catalog_series
    const byMtAndSeries = new Map<string, CatalogArtwork[]>();

    for (const a of catalogArtworks) {
      const mt = (a.medium_type as MediumType) || "PAINTING";
      const series = a.catalog_series || "(No series)";
      const key = `${mt}::${series}`;
      const list = byMtAndSeries.get(key) || [];
      list.push(a);
      byMtAndSeries.set(key, list);

      const entry = result.get(mt);
      if (entry) entry.total++;
    }

    // Build seriesList for each medium type
    for (const mt of MEDIUM_TYPES) {
      const entry = result.get(mt)!;
      const seriesNames = new Set<string>();

      for (const [key] of byMtAndSeries) {
        if (key.startsWith(`${mt}::`)) {
          seriesNames.add(key.split("::")[1]);
        }
      }

      const sorted = Array.from(seriesNames).sort((a, b) => {
        if (a === "(No series)") return 1;
        if (b === "(No series)") return -1;
        return a.localeCompare(b);
      });

      entry.seriesList = sorted.map((seriesName) => {
        const allArtworks = byMtAndSeries.get(`${mt}::${seriesName}`) || [];

        // Group sub-series
        const subMap = new Map<string, CatalogArtwork[]>();
        for (const a of allArtworks) {
          if (a.catalog_sub_series) {
            const list = subMap.get(a.catalog_sub_series) || [];
            list.push(a);
            subMap.set(a.catalog_sub_series, list);
          }
        }
        const subSeries = Array.from(subMap.entries()).sort(([a], [b]) => a.localeCompare(b));

        return { name: seriesName, allArtworks, subSeries };
      });
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

          return (
            <CategoryFolder
              key={mt}
              category={mt}
              count={data.total}
              isOpen={openCategories.has(mt)}
              onToggle={() => toggleCategory(mt)}
            >
              <div className="p-3 space-y-1">
                {data.seriesList.length > 0 ? (
                  data.seriesList.map((series) => (
                    <MainSeriesRow
                      key={series.name}
                      name={series.name}
                      allArtworks={series.allArtworks}
                      subSeries={series.subSeries}
                    />
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
