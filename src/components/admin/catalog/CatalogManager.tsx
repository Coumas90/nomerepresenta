import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useCatalogArtworks, useUpdateCatalogField } from "@/hooks/useCatalog";
import { CatalogFilters } from "./CatalogFilters";
import { CatalogRow, type ThumbSize } from "./CatalogRow";

const CatalogManager = () => {
  const { data: artworks = [], isLoading } = useCatalogArtworks();
  const updateField = useUpdateCatalogField();

  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [mediumFilter, setMediumFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [thumbSize, setThumbSize] = useState<ThumbSize>("sm");

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
      return true;
    });
  }, [artworks, search, yearFilter, sizeFilter, mediumFilter, statusFilter]);

  const handleFieldUpdate = (id: string, field: string, value: string | null) => {
    updateField.mutate({ id, field, value });
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
        years={years}
      />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {filtered.length} artwork{filtered.length !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
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
                  <th className="py-2 px-3 text-xs font-medium text-muted-foreground">Location</th>
                  <th className="py-2 px-3 text-xs font-medium text-muted-foreground">Notes</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((artwork) => (
                  <CatalogRow
                    key={artwork.id}
                    artwork={artwork}
                    thumbSize={thumbSize}
                    onFieldUpdate={handleFieldUpdate}
                  />
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="text-center py-12 text-sm text-muted-foreground">
                No artworks match the current filters.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CatalogManager;
