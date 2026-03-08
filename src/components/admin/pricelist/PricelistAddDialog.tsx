import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  const handleAdd = () => {
    if (!selectedId) return;
    onAdd(selectedId, price);
    setSelectedId(null);
    setPrice("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <div className="mt-2 space-y-2 max-h-[50vh] overflow-y-auto">
              {artworks.map((artwork) => (
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
                    <p className="text-sm font-medium truncate">{artwork.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {seriesMap.get(artwork.series_id) || ""} · {artwork.year || ""}
                    </p>
                  </div>
                </button>
              ))}
              {artworks.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  All artworks are already in the pricelist.
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
