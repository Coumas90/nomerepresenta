import { useState, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useCatalogArtworks, useUpdateCatalogField, type MediumType, type CatalogArtwork } from "@/hooks/useCatalog";
import { useDeleteArtwork } from "@/hooks/useArtworkMutations";
import { useSeries } from "@/hooks/useSeries";
import { CatalogFilters } from "./CatalogFilters";
import { CatalogRow, type ThumbSize } from "./CatalogRow";
import { CategoryFolder } from "./CategoryFolder";
import { CatalogSeriesManager, useCatalogSeriesNames, useCatalogSeriesHierarchy } from "./CatalogSeriesManager";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

type SortField = "title" | "year" | "size_category" | "status" | null;
type SortDir = "asc" | "desc";

const SIZE_ORDER: Record<string, number> = { S: 1, M: 2, L: 3 };
const STATUS_ORDER: Record<string, number> = { available: 1, reserved: 2, sold: 3 };

const CATEGORIES: MediumType[] = ["PAINTING", "POW", "PHOTO", "ARTIST_BOOK"];

interface CatalogManagerProps {
  onEdit?: (artwork: any) => void;
}

const CatalogManager = ({ onEdit }: CatalogManagerProps = {}) => {
  const { data: artworks = [], isLoading } = useCatalogArtworks();
  const { data: series = [] } = useSeries();
  const updateField = useUpdateCatalogField();
  const deleteMutation = useDeleteArtwork();
  const managedCatalogSeries = useCatalogSeriesNames();
  const seriesHierarchy = useCatalogSeriesHierarchy();

  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [mediumFilter, setMediumFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [seriesFilter, setSeriesFilter] = useState("all");
  const [thumbSize, setThumbSize] = useState<ThumbSize>("md");
  const [openCategories, setOpenCategories] = useState<Set<MediumType>>(new Set(CATEGORIES));
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const toggleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      if (sortDir === "asc") setSortDir("desc");
      else { setSortField(null); setSortDir("asc"); }
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }, [sortField, sortDir]);

  const sortItems = useCallback((items: CatalogArtwork[]) => {
    if (!sortField) return items;
    return [...items].sort((a, b) => {
      let cmp = 0;
      if (sortField === "title") {
        cmp = (a.title || "").localeCompare(b.title || "", undefined, { sensitivity: "base", numeric: true });
      } else if (sortField === "year") {
        cmp = (a.year || "").localeCompare(b.year || "");
      } else if (sortField === "size_category") {
        cmp = (SIZE_ORDER[a.size_category || ""] || 0) - (SIZE_ORDER[b.size_category || ""] || 0);
      } else if (sortField === "status") {
        cmp = (STATUS_ORDER[a.status || "available"] || 0) - (STATUS_ORDER[b.status || "available"] || 0);
      }
      return sortDir === "desc" ? -cmp : cmp;
    });
  }, [sortField, sortDir]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />;
    return sortDir === "asc"
      ? <ArrowUp className="h-3 w-3 ml-1" />
      : <ArrowDown className="h-3 w-3 ml-1" />;
  };

  const years = useMemo(() => {
    const set = new Set(artworks.map((a) => a.year).filter(Boolean) as string[]);
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [artworks]);

  const filtered = useMemo(() => {
    return artworks.filter((a) => {
      if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (yearFilter !== "all" && a.year !== yearFilter) return false;
      if (sizeFilter !== "all" && a.size_category !== sizeFilter) return false;
      if (mediumFilter !== "all" && a.medium_type !== mediumFilter) return false;
      if (statusFilter !== "all" && (a.status || "available") !== statusFilter) return false;
      if (seriesFilter !== "all" && a.series_id !== seriesFilter) return false;
      return true;
    });
  }, [artworks, search, yearFilter, sizeFilter, mediumFilter, statusFilter, seriesFilter]);

  const catalogSeriesNames = useMemo(() => {
    const set = new Set([
      ...managedCatalogSeries,
      ...(artworks.map((a) => a.catalog_series).filter(Boolean) as string[]),
    ]);
    return Array.from(set).sort();
  }, [artworks, managedCatalogSeries]);

  const grouped = useMemo(() => {
    const map: Record<string, typeof filtered> = {};
    for (const cat of CATEGORIES) {
      map[cat] = filtered.filter((a) => a.medium_type === cat);
    }
    map["UNCATEGORIZED"] = filtered.filter((a) => !a.medium_type || !CATEGORIES.includes(a.medium_type as MediumType));
    return map;
  }, [filtered]);

  const toggleCategory = (cat: MediumType) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const handleFieldUpdate = (id: string, field: string, value: string | null) => {
    updateField.mutate({ id, field, value });
  };

  const renderTable = (items: typeof filtered, showEdition = false) => {
    const sorted = sortItems(items);
    return (
    <Card className="mt-2">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="py-2 px-3 text-xs font-medium text-muted-foreground" />
                <th
                  className="py-2 px-3 text-xs font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors"
                  onClick={() => toggleSort("title")}
                >
                  <span className="inline-flex items-center">Title <SortIcon field="title" /></span>
                </th>
                <th className="py-2 px-3 text-xs font-medium text-muted-foreground">Ref</th>
                <th className="py-2 px-3 text-xs font-medium text-muted-foreground">Series</th>
                <th
                  className="py-2 px-3 text-xs font-medium text-muted-foreground text-center cursor-pointer select-none hover:text-foreground transition-colors"
                  onClick={() => toggleSort("year")}
                >
                  <span className="inline-flex items-center justify-center">Year <SortIcon field="year" /></span>
                </th>
                <th
                  className="py-2 px-3 text-xs font-medium text-muted-foreground text-center cursor-pointer select-none hover:text-foreground transition-colors"
                  onClick={() => toggleSort("size_category")}
                >
                  <span className="inline-flex items-center justify-center">Size <SortIcon field="size_category" /></span>
                </th>
                <th className="py-2 px-3 text-xs font-medium text-muted-foreground text-center">Medium</th>
                <th
                  className="py-2 px-3 text-xs font-medium text-muted-foreground text-center cursor-pointer select-none hover:text-foreground transition-colors"
                  onClick={() => toggleSort("status")}
                >
                  <span className="inline-flex items-center justify-center">Status <SortIcon field="status" /></span>
                </th>
                {showEdition && (
                  <th className="py-2 px-3 text-xs font-medium text-muted-foreground text-center">Edition</th>
                )}
                <th className="py-2 px-3 text-xs font-medium text-muted-foreground">Location</th>
                <th className="py-2 px-3 text-xs font-medium text-muted-foreground">Notes</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((artwork) => (
                  <CatalogRow
                    key={artwork.id}
                    artwork={artwork}
                    thumbSize={thumbSize}
                    showEdition={showEdition}
                    onFieldUpdate={handleFieldUpdate}
                    onEdit={onEdit ? (a) => onEdit(a as any) : undefined}
                    onDelete={(id) => deleteMutation.mutate(id)}
                    catalogSeriesSuggestions={catalogSeriesNames}
                  />
              ))}
            </tbody>
          </table>
          {items.length === 0 && (
            <p className="text-center py-8 text-sm text-muted-foreground">
              No artworks in this category.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Catalog</h2>
          <p className="text-sm text-muted-foreground">
            Full inventory of all paintings. Click any thumbnail to expand.
          </p>
        </div>
        <ToggleGroup
          type="single"
          value={thumbSize}
          onValueChange={(v) => v && setThumbSize(v as ThumbSize)}
          className="border rounded-md"
        >
          <ToggleGroupItem value="sm" className="text-xs px-2.5 h-8">S</ToggleGroupItem>
          <ToggleGroupItem value="md" className="text-xs px-2.5 h-8">M</ToggleGroupItem>
          <ToggleGroupItem value="lg" className="text-xs px-2.5 h-8">L</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <CatalogSeriesManager />

      <CatalogFilters
        search={search}
        onSearchChange={setSearch}
        yearFilter={yearFilter}
        onYearFilterChange={setYearFilter}
        sizeFilter={sizeFilter}
        onSizeFilterChange={setSizeFilter}
        mediumFilter={mediumFilter}
        onMediumFilterChange={setMediumFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        seriesFilter={seriesFilter}
        onSeriesFilterChange={setSeriesFilter}
        years={years}
        seriesList={series.map((s) => ({ id: s.id, name: s.name }))}
      />

      {/* Category folders */}
      <div className="space-y-3">
        {CATEGORIES.map((cat) => (
          <CategoryFolder
            key={cat}
            category={cat}
            count={grouped[cat].length}
            isOpen={openCategories.has(cat)}
            onToggle={() => toggleCategory(cat)}
          >
            {renderTable(grouped[cat], cat === "PHOTO")}
          </CategoryFolder>
        ))}

        {/* Uncategorized artworks */}
        {grouped["UNCATEGORIZED"].length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground px-1 mb-2">
              Uncategorized ({grouped["UNCATEGORIZED"].length})
            </p>
            {renderTable(grouped["UNCATEGORIZED"])}
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogManager;
