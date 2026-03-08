import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CatalogArtwork, SizeCategory, MediumType, ArtworkStatus } from "@/hooks/useCatalog";

const STATUS_COLORS: Record<ArtworkStatus, string> = {
  available: "bg-emerald-100 text-emerald-800 border-emerald-200",
  sold: "bg-red-100 text-red-800 border-red-200",
  reserved: "bg-amber-100 text-amber-800 border-amber-200",
};

interface CatalogRowProps {
  artwork: CatalogArtwork;
  onFieldUpdate: (id: string, field: string, value: string | null) => void;
}

export const CatalogRow = ({ artwork, onFieldUpdate }: CatalogRowProps) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const startEditing = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const saveField = () => {
    if (editingField) {
      onFieldUpdate(artwork.id, editingField, editValue || null);
      setEditingField(null);
    }
  };

  const status = (artwork.status || "available") as ArtworkStatus;

  return (
    <tr className="border-b border-border hover:bg-muted/30 transition-colors">
      {/* Thumbnail */}
      <td className="py-2 px-3 w-14">
        <img
          src={artwork.image_url}
          alt={artwork.title}
          className="w-10 h-10 object-cover rounded"
          loading="lazy"
        />
      </td>

      {/* Title */}
      <td className="py-2 px-3">
        <p className="text-sm font-medium truncate max-w-[200px]">{artwork.title}</p>
        <p className="text-xs text-muted-foreground">{artwork.series_name}</p>
      </td>

      {/* Year */}
      <td className="py-2 px-3 text-sm text-center">{artwork.year || "—"}</td>

      {/* Size */}
      <td className="py-2 px-3 text-center">
        <Select
          value={artwork.size_category || "none"}
          onValueChange={(v) => onFieldUpdate(artwork.id, "size_category", v === "none" ? null : v)}
        >
          <SelectTrigger className="h-7 w-16 text-xs mx-auto">
            <SelectValue placeholder="—" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">—</SelectItem>
            <SelectItem value="S">S</SelectItem>
            <SelectItem value="M">M</SelectItem>
            <SelectItem value="L">L</SelectItem>
          </SelectContent>
        </Select>
      </td>

      {/* Medium */}
      <td className="py-2 px-3 text-center">
        <Select
          value={artwork.medium_type || "none"}
          onValueChange={(v) => onFieldUpdate(artwork.id, "medium_type", v === "none" ? null : v)}
        >
          <SelectTrigger className="h-7 w-[100px] text-xs mx-auto">
            <SelectValue placeholder="—" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">—</SelectItem>
            <SelectItem value="PHOTO">Photo</SelectItem>
            <SelectItem value="POW">POW</SelectItem>
            <SelectItem value="PAINTING">Painting</SelectItem>
          </SelectContent>
        </Select>
      </td>

      {/* Status */}
      <td className="py-2 px-3 text-center">
        <Select
          value={status}
          onValueChange={(v) => onFieldUpdate(artwork.id, "status", v)}
        >
          <SelectTrigger className="h-7 w-[100px] text-xs mx-auto border-0 p-0">
            <Badge variant="outline" className={`${STATUS_COLORS[status]} text-[10px] px-2`}>
              {status}
            </Badge>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
            <SelectItem value="reserved">Reserved</SelectItem>
          </SelectContent>
        </Select>
      </td>

      {/* Location */}
      <td className="py-2 px-3">
        {editingField === "location" ? (
          <div className="flex items-center gap-1">
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="h-7 w-32 text-xs"
              onKeyDown={(e) => e.key === "Enter" && saveField()}
              autoFocus
            />
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={saveField}>
              <Check className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <button
            onClick={() => startEditing("location", artwork.location || "")}
            className="text-xs px-1.5 py-0.5 rounded hover:bg-muted transition-colors min-w-[48px] text-left"
          >
            {artwork.location || "—"}
          </button>
        )}
      </td>

      {/* Notes */}
      <td className="py-2 px-3">
        {editingField === "notes" ? (
          <div className="flex items-center gap-1">
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="h-7 w-40 text-xs"
              onKeyDown={(e) => e.key === "Enter" && saveField()}
              autoFocus
            />
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={saveField}>
              <Check className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <button
            onClick={() => startEditing("notes", artwork.notes || "")}
            className="text-xs px-1.5 py-0.5 rounded hover:bg-muted transition-colors min-w-[48px] text-left truncate max-w-[160px] block"
          >
            {artwork.notes || "—"}
          </button>
        )}
      </td>
    </tr>
  );
};
