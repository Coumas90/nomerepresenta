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
import { Search, EyeOff } from "lucide-react";
import type { ArtworkData } from "@/types";

interface PricelistAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artworks: ArtworkData[];
  seriesMap: Map<string, string>;
  onAdd: (artworkId: string, price: string) => void;
}

export const PricelistAddDialog = ({
  open,
  onOpenChange,
  artworks,
  seriesMap,
  onAdd,
}: PricelistAddDialogProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [price, setPrice] = useState("");
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

  const handleAdd = () => {
    if (!selectedId) return;
    onAdd(selectedId, price);
    setSelectedId(null);
    setPrice("");
    setSearch("");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setSearch(""); }}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Artwork to Pricelist</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Price</Label>
            <Input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 1.500 USD"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Select Artwork</Label>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, series, or year…"
                className="pl-9"
              />
            </div>
            <div className="mt-3 space-y-4 max-h-[50vh] overflow-y-auto">
              {[...grouped.entries()].map(([seriesName, works]) => (
                <div key={seriesName}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 px-1">
                    {seriesName}
                  </p>
                  <div className="space-y-1">
                    {works.map((artwork) => (
                      <button
                        key={artwork.id}
                        onClick={() => setSelectedId(artwork.id)}
                        className={`w-full flex items-center gap-3 p-2 rounded-lg border text-left transition-colors ${
                          selectedId === artwork.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-muted/50"
                        }`}
                      >
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
                    ))}
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {artworks.length === 0
                    ? "All artworks are already in the pricelist."
                    : "No artworks match your search."}
                </p>
              )}
            </div>
          </div>

          <Button onClick={handleAdd} disabled={!selectedId} className="w-full">
            Add to Pricelist
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
