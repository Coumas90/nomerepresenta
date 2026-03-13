import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, EyeOff, Check } from "lucide-react";
import type { ArtworkData } from "@/types";

interface PricelistAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artworks: ArtworkData[];
  seriesMap: Map<string, string>;
  onAdd: (artworkIds: string[]) => void;
}

export const PricelistAddDialog = ({
  open,
  onOpenChange,
  artworks,
  seriesMap,
  onAdd,
}: PricelistAddDialogProps) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return artworks;
    const q = search.toLowerCase();
    return artworks.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (seriesMap.get(a.series_id) || "").toLowerCase().includes(q) ||
        (a.year || "").includes(q)
    );
  }, [artworks, search, seriesMap]);

  // Group by series for easier browsing
  const grouped = useMemo(() => {
    const map = new Map<string, ArtworkData[]>();
    for (const a of filtered) {
      const name = seriesMap.get(a.series_id) || "Uncategorized";
      if (!map.has(name)) map.set(name, []);
      map.get(name)!.push(a);
    }
    return map;
  }, [filtered, seriesMap]);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSeries = (seriesArtworks: ArtworkData[]) => {
    const ids = seriesArtworks.map((a) => a.id);
    const allSelected = ids.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        ids.forEach((id) => next.delete(id));
      } else {
        ids.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleAdd = () => {
    if (selectedIds.size === 0) return;
    onAdd(Array.from(selectedIds));
    setSelectedIds(new Set());
    setSearch("");
  };

  const handleClose = (v: boolean) => {
    onOpenChange(v);
    if (!v) {
      setSearch("");
      setSelectedIds(new Set());
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Artworks to Pricelist</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Select Artworks</Label>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, series, or year…"
                className="pl-9"
              />
            </div>
            <div className="mt-3 space-y-4 max-h-[65vh] overflow-y-auto">
              {[...grouped.entries()].map(([seriesName, works]) => {
                const allSelected = works.every((w) => selectedIds.has(w.id));
                const someSelected = works.some((w) => selectedIds.has(w.id));
                return (
                  <div key={seriesName}>
                    <button
                      onClick={() => toggleSeries(works)}
                      className="flex items-center gap-2 mb-1.5 px-1 group w-full text-left"
                    >
                      <Checkbox
                        checked={allSelected ? true : someSelected ? "indeterminate" : false}
                        className="h-3.5 w-3.5"
                        tabIndex={-1}
                      />
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">
                        {seriesName}
                      </p>
                    </button>
                    <div className="space-y-1">
                      {works.map((artwork) => {
                        const isSelected = selectedIds.has(artwork.id);
                        return (
                          <button
                            key={artwork.id}
                            onClick={() => toggleSelection(artwork.id)}
                            className={`w-full flex items-center gap-3 p-2 rounded-lg border text-left transition-colors ${
                              isSelected
                                ? "border-primary bg-primary/5"
                                : "border-border hover:bg-muted/50"
                            }`}
                          >
                            <Checkbox
                              checked={isSelected}
                              className="h-4 w-4 shrink-0"
                              tabIndex={-1}
                            />
                            <img
                              src={artwork.image_url}
                              alt={artwork.title}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium truncate">{artwork.title}</p>
                                {!artwork.is_visible && (
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-1 shrink-0">
                                    <EyeOff className="h-3 w-3" />
                                    Hidden
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {artwork.year || ""}
                                {artwork.dimensions ? ` · ${artwork.dimensions}` : ""}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {artworks.length === 0
                    ? "All artworks are already in the pricelist."
                    : "No artworks match your search."}
                </p>
              )}
            </div>
          </div>

          <Button onClick={handleAdd} disabled={selectedIds.size === 0} className="w-full">
            <Check className="mr-2 h-4 w-4" />
            Add {selectedIds.size > 0 ? `${selectedIds.size} Artwork${selectedIds.size > 1 ? "s" : ""}` : "to Pricelist"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
