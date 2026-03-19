import { useState, useMemo } from "react";
import { ZoomIn, ZoomOut, Type, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { CatalogArtwork } from "@/hooks/useCatalog";

interface SeriesGalleryProps {
  artworks: CatalogArtwork[];
}

const ZOOM_LEVELS = [
  { cols: "grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12", titleClass: "text-[8px]" },
  { cols: "grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10", titleClass: "text-[9px]" },
  { cols: "grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8", titleClass: "text-[10px]" },
  { cols: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5", titleClass: "text-[11px]" },
  { cols: "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4", titleClass: "text-xs" },
  { cols: "grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3", titleClass: "text-xs" },
  { cols: "grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2", titleClass: "text-sm" },
];

type SortMode = "default" | "year-asc" | "year-desc";
type SizeFilter = "all" | "S" | "M" | "L";
type StatusFilter = "all" | "available" | "sold";

export const SeriesGallery = ({ artworks }: SeriesGalleryProps) => {
  const [zoom, setZoom] = useState(1);
  const [sortMode, setSortMode] = useState<SortMode>("default");
  const [sizeFilter, setSizeFilter] = useState<SizeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [showNames, setShowNames] = useState(true);

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    for (const a of artworks) {
      if (a.year) years.add(a.year);
    }
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [artworks]);

  const filtered = useMemo(() => {
    let result = artworks;
    if (sizeFilter !== "all") {
      result = result.filter((a) => a.size_category === sizeFilter);
    }
    if (statusFilter !== "all") {
      result = result.filter((a) => (a.status || "available") === statusFilter);
    }
    if (yearFilter !== "all") {
      result = result.filter((a) => a.year === yearFilter);
    }
    if (sortMode !== "default") {
      result = [...result].sort((a, b) => {
        const aYear = parseInt(a.year || "0") || 0;
        const bYear = parseInt(b.year || "0") || 0;
        return sortMode === "year-asc" ? aYear - bYear : bYear - aYear;
      });
    }
    return result;
  }, [artworks, sortMode, sizeFilter, statusFilter, yearFilter]);

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

  const zoomLevel = ZOOM_LEVELS[zoom];

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

        <div className="flex items-center gap-1">
          {(["all", "S", "M", "L"] as const).map((size) => (
            <Badge
              key={size}
              variant={sizeFilter === size ? "default" : "outline"}
              className="cursor-pointer text-[10px] px-2 py-0 h-6"
              onClick={() => setSizeFilter(size)}
            >
              {size === "all" ? "All" : size}
            </Badge>
          ))}
        </div>

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

        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="h-7 w-[100px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All years</SelectItem>
            {availableYears.map((y) => (
              <SelectItem key={y} value={y}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortMode} onValueChange={(v) => setSortMode(v as SortMode)}>
          <SelectTrigger className="h-7 w-[120px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default order</SelectItem>
            <SelectItem value="year-asc">Year ↑ oldest</SelectItem>
            <SelectItem value="year-desc">Year ↓ newest</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant={showNames ? "secondary" : "ghost"}
          size="icon"
          className="h-7 w-7"
          onClick={() => setShowNames((v) => !v)}
          title={showNames ? "Hide titles" : "Show titles"}
        >
          <Type className="h-3.5 w-3.5" />
        </Button>

        <span className="text-[10px] text-muted-foreground ml-auto">
          {filtered.length} / {artworks.length} works
        </span>
      </div>

      {ungrouped.length > 0 && (
        <ThumbnailGrid artworks={ungrouped} gridCols={zoomLevel.cols} titleClass={zoomLevel.titleClass} showNames={showNames} />
      )}

      {sortedGroups.map(([subSeries, items]) => (
        <div key={subSeries}>
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
            {subSeries} <span className="font-normal">({items.length})</span>
          </p>
          <ThumbnailGrid artworks={items} gridCols={zoomLevel.cols} titleClass={zoomLevel.titleClass} showNames={showNames} />
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

const ThumbnailCard = ({ artwork, titleClass, showNames }: { artwork: CatalogArtwork; titleClass: string; showNames: boolean }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="group relative">
      <div className="aspect-square flex items-center justify-center bg-muted/30 rounded overflow-hidden relative">
        <img
          src={artwork.image_url}
          alt={artwork.title}
          className="max-w-full max-h-full object-contain"
          loading="lazy"
        />
        {artwork.status === "sold" && (
          <span className="absolute top-0.5 right-0.5 bg-destructive/80 text-destructive-foreground text-[7px] px-1 rounded leading-tight">
            SOLD
          </span>
        )}
        {showNames && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="absolute bottom-0.5 left-0.5 bg-background/70 hover:bg-background/90 rounded p-0.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        )}
      </div>
      {showNames && (
        <div className="mt-0.5">
          <p className={`${titleClass} text-muted-foreground truncate leading-tight`}>{artwork.title}</p>
          {expanded && (
            <div className="text-[10px] text-muted-foreground space-y-0.5 mt-1 bg-muted/40 rounded p-1.5">
              {artwork.year && <p><span className="font-medium">Year:</span> {artwork.year}</p>}
              {artwork.dimensions && <p><span className="font-medium">Dim:</span> {artwork.dimensions}</p>}
              {artwork.materials && <p><span className="font-medium">Mat:</span> {artwork.materials}</p>}
              {artwork.size_category && <p><span className="font-medium">Size:</span> {artwork.size_category}</p>}
              {artwork.status && <p><span className="font-medium">Status:</span> {artwork.status}</p>}
              {artwork.location && <p><span className="font-medium">Location:</span> {artwork.location}</p>}
              {artwork.edition && <p><span className="font-medium">Edition:</span> {artwork.edition}</p>}
              {artwork.ref && <p><span className="font-medium">Ref:</span> {artwork.ref}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ThumbnailGrid = ({ artworks, gridCols, titleClass, showNames }: { artworks: CatalogArtwork[]; gridCols: string; titleClass: string; showNames: boolean }) => (
  <div className={`grid ${gridCols} gap-2`}>
    {artworks.map((a) => (
      <ThumbnailCard key={a.id} artwork={a} titleClass={titleClass} showNames={showNames} />
    ))}
  </div>
);

export default SeriesGallery;
