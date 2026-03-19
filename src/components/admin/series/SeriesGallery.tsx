import { useState, useMemo } from "react";
import { ZoomIn, ZoomOut, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CatalogArtwork } from "@/hooks/useCatalog";

interface SeriesGalleryProps {
  artworks: CatalogArtwork[];
}

const ZOOM_LEVELS = [
  { cols: "grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12", label: "XS" },
  { cols: "grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10", label: "S" },
  { cols: "grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8", label: "M" },
  { cols: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5", label: "L" },
];

type SortMode = "default" | "size-asc" | "size-desc";
type StatusFilter = "all" | "available" | "sold";

const SIZE_ORDER: Record<string, number> = { S: 1, M: 2, L: 3 };

export const SeriesGallery = ({ artworks }: SeriesGalleryProps) => {
  const [zoom, setZoom] = useState(1);
  const [sortMode, setSortMode] = useState<SortMode>("default");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    let result = artworks;
    if (statusFilter !== "all") {
      result = result.filter((a) => (a.status || "available") === statusFilter);
    }
    if (sortMode !== "default") {
      result = [...result].sort((a, b) => {
        const aVal = SIZE_ORDER[a.size_category || ""] || 0;
        const bVal = SIZE_ORDER[b.size_category || ""] || 0;
        return sortMode === "size-asc" ? aVal - bVal : bVal - aVal;
      });
    }
    return result;
  }, [artworks, sortMode, statusFilter]);

  // Group by catalog_sub_series
  const { ungrouped, sortedGroups } = useMemo(() => {
    const grouped = new Map<string, CatalogArtwork[]>();
    const ung: CatalogArtwork[] = [];
    for (const a of filtered) {
      if (a.catalog_sub_series) {
        const existing = grouped.get(a.catalog_sub_series) || [];
        existing.push(a);
        grouped.set(a.catalog_sub_series, existing);
      } else {
        ung.push(a);
      }
    }
    return {
      ungrouped: ung,
      sortedGroups: Array.from(grouped.entries()).sort(([a], [b]) => a.localeCompare(b)),
    };
  }, [filtered]);

  const gridCols = ZOOM_LEVELS[zoom].cols;

  return (
    <div className="space-y-3 pt-3 border-t border-border mt-3">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setZoom((z) => Math.min(z + 1, ZOOM_LEVELS.length - 1))}
            disabled={zoom === ZOOM_LEVELS.length - 1}
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setZoom((z) => Math.max(z - 1, 0))}
            disabled={zoom === 0}
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
        </div>

        <Select value={sortMode} onValueChange={(v) => setSortMode(v as SortMode)}>
          <SelectTrigger className="h-7 w-[130px] text-xs">
            <ArrowUpDown className="h-3 w-3 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default order</SelectItem>
            <SelectItem value="size-asc">Size ↑ (S→L)</SelectItem>
            <SelectItem value="size-desc">Size ↓ (L→S)</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="h-7 w-[110px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-[10px] text-muted-foreground ml-auto">
          {filtered.length} / {artworks.length} works
        </span>
      </div>

      {/* Ungrouped artworks */}
      {ungrouped.length > 0 && (
        <ThumbnailGrid artworks={ungrouped} gridCols={gridCols} />
      )}

      {/* Sub-series groups */}
      {sortedGroups.map(([subSeries, items]) => (
        <div key={subSeries}>
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
            {subSeries} <span className="font-normal">({items.length})</span>
          </p>
          <ThumbnailGrid artworks={items} gridCols={gridCols} />
        </div>
      ))}

      {filtered.length === 0 && (
        <p className="text-xs text-muted-foreground py-2">
          {artworks.length === 0 ? "No artworks in this series." : "No artworks match the current filter."}
        </p>
      )}
    </div>
  );
};

const ThumbnailGrid = ({ artworks, gridCols }: { artworks: CatalogArtwork[]; gridCols: string }) => (
  <div className={`grid ${gridCols} gap-2`}>
    {artworks.map((a) => (
      <div key={a.id} className="group relative">
        <div className="aspect-square flex items-center justify-center bg-muted/30 rounded overflow-hidden relative">
          <img
            src={a.image_url}
            alt={a.title}
            className="max-w-full max-h-full object-contain"
            loading="lazy"
          />
          {a.status === "sold" && (
            <span className="absolute top-0.5 right-0.5 bg-destructive/80 text-destructive-foreground text-[7px] px-1 rounded leading-tight">
              SOLD
            </span>
          )}
        </div>
        <p className="text-[9px] text-muted-foreground truncate mt-0.5 leading-tight">{a.title}</p>
      </div>
    ))}
  </div>
);

export default SeriesGallery;
