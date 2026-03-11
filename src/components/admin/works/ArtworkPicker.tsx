import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCatalogArtworks } from "@/hooks/useCatalog";
import { useSeries } from "@/hooks/useSeries";
import { Check } from "lucide-react";

interface ArtworkPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (artworkIds: string[]) => void;
  excludeIds?: string[];
  multiple?: boolean;
}

const ArtworkPicker = ({ open, onOpenChange, onSelect, excludeIds = [], multiple = false }: ArtworkPickerProps) => {
  const { data: artworks = [] } = useCatalogArtworks();
  const { data: series = [] } = useSeries();
  const [search, setSearch] = useState("");
  const [seriesFilter, setSeriesFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return artworks.filter((a) => {
      if (excludeIds.includes(a.id)) return false;
      if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (seriesFilter !== "all" && a.series_id !== seriesFilter) return false;
      return true;
    });
  }, [artworks, search, seriesFilter, excludeIds]);

  const toggleSelect = (id: string) => {
    if (multiple) {
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    } else {
      onSelect([id]);
      onOpenChange(false);
      setSearch("");
      setSeriesFilter("all");
      setSelected(new Set());
    }
  };

  const handleConfirm = () => {
    onSelect(Array.from(selected));
    onOpenChange(false);
    setSearch("");
    setSeriesFilter("all");
    setSelected(new Set());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Select Artwork{multiple ? "s" : ""} from Catalog</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 mb-3">
          <Input
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Select value={seriesFilter} onValueChange={setSeriesFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All series" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All series</SelectItem>
              {series.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <ScrollArea className="h-[400px]">
          <div className="space-y-1">
            {filtered.map((artwork) => {
              const isSelected = selected.has(artwork.id);
              return (
                <button
                  key={artwork.id}
                  onClick={() => toggleSelect(artwork.id)}
                  className={`w-full flex items-center gap-3 p-2 rounded-md text-left transition-colors hover:bg-muted/50 ${
                    isSelected ? "bg-primary/10 ring-1 ring-primary/30" : ""
                  }`}
                >
                  <img
                    src={artwork.image_url}
                    alt={artwork.title}
                    className="w-10 h-10 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{artwork.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {artwork.series_name} {artwork.year ? `· ${artwork.year}` : ""}
                    </p>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="text-center py-8 text-sm text-muted-foreground">No artworks found.</p>
            )}
          </div>
        </ScrollArea>
        {multiple && selected.size > 0 && (
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={() => setSelected(new Set())}>Clear</Button>
            <Button onClick={handleConfirm}>Add {selected.size} artwork{selected.size > 1 ? "s" : ""}</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ArtworkPicker;
