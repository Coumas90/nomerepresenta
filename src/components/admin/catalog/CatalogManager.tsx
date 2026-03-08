import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useCatalogArtworks, useUpdateCatalogField, type MediumType } from "@/hooks/useCatalog";
import { useSeries } from "@/hooks/useSeries";
import { CatalogFilters } from "./CatalogFilters";
import { CatalogRow, type ThumbSize } from "./CatalogRow";
import { CategoryFolder } from "./CategoryFolder";

const CATEGORIES: MediumType[] = ["PAINTING", "POW", "PHOTO"];

const CatalogManager = () => {
  const { data: artworks = [], isLoading } = useCatalogArtworks();
  const { data: series = [] } = useSeries();
  const updateField = useUpdateCatalogField();

  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [mediumFilter, setMediumFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [seriesFilter, setSeriesFilter] = useState("all");
  const [thumbSize, setThumbSize] = useState<ThumbSize>("sm");
  const [openCategories, setOpenCategories] = useState<Set<MediumType>>(new Set());

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

  const renderTable = (items: typeof filtered, showEdition = false) => (
    <Card className="mt-2">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="py-2 px-3 text-xs font-medium text-muted-foreground" />
                <th className="py-2 px-3 text-xs font-medium text-muted-foreground">Title</th>
                <th className="py-2 px-3 text-xs font-medium text-muted-foreground text-center">Year</th>
                <th className="py-2 px-3 text-xs font-medium text-muted-foreground text-center">Size</th>
                <th className="py-2 px-3 text-xs font-medium text-muted-foreground text-center">Medium</th>
                <th className="py-2 px-3 text-xs font-medium text-muted-foreground text-center">Status</th>
                {showEdition && (
                  <th className="py-2 px-3 text-xs font-medium text-muted-foreground text-center">Edition</th>
                )}
                <th className="py-2 px-3 text-xs font-medium text-muted-foreground">Location</th>
                <th className="py-2 px-3 text-xs font-medium text-muted-foreground">Notes</th>
              </tr>
            </thead>
            <tbody>
              {items.map((artwork) => (
                <CatalogRow
                  key={artwork.id}
                  artwork={artwork}
                  thumbSize={thumbSize}
                  showEdition={showEdition}
                  onFieldUpdate={handleFieldUpdate}
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
