import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CatalogImageGallery } from "./CatalogImageGallery";
import type { CatalogArtwork, SizeCategory, MediumType, ArtworkStatus } from "@/hooks/useCatalog";

const STATUS_COLORS: Record<ArtworkStatus, string> = {
  available: "bg-emerald-100 text-emerald-800 border-emerald-200",
  sold: "bg-red-100 text-red-800 border-red-200",
  reserved: "bg-amber-100 text-amber-800 border-amber-200",
};

const THUMB_SIZES = {
  sm: "w-10 h-10",
  md: "w-20 h-20",
  lg: "w-32 h-32",
} as const;

export type ThumbSize = keyof typeof THUMB_SIZES;

interface CatalogRowProps {
  artwork: CatalogArtwork;
  thumbSize: ThumbSize;
  onFieldUpdate: (id: string, field: string, value: string | null) => void;
}

export const CatalogRow = ({ artwork, thumbSize, onFieldUpdate }: CatalogRowProps) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [imageOpen, setImageOpen] = useState(false);
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [imagesExpanded, setImagesExpanded] = useState(false);

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
    <>
      <tr className="border-b border-border hover:bg-muted/30 transition-colors">
        {/* Thumbnail */}
        <td className="py-2 px-3">
          <div className="flex flex-col items-center gap-1">
            <button onClick={() => setImageOpen(true)} className="block rounded overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all">
              <img
                src={artwork.image_url}
                alt={artwork.title}
                className={`${THUMB_SIZES[thumbSize]} object-cover rounded`}
                loading="lazy"
              />
            </button>
            <button
              onClick={() => setImagesExpanded(!imagesExpanded)}
              className="flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              {imagesExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {imagesExpanded ? "Hide" : "Images"}
            </button>
          </div>
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
        <td className="py-2 px-3 min-w-[180px] max-w-[260px]">
          {editingField === "notes" ? (
            <div className="flex flex-col gap-1">
              <Textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="text-xs min-h-[60px] resize-y"
                autoFocus
              />
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setEditingField(null)}>
                  Cancel
                </Button>
                <Button variant="default" size="sm" className="h-6 text-xs" onClick={saveField}>
                  <Check className="h-3 w-3 mr-1" /> Save
                </Button>
              </div>
            </div>
          ) : artwork.notes ? (
            <div>
              <p className={`text-xs whitespace-pre-wrap ${!notesExpanded ? "line-clamp-2" : ""}`}>
                {artwork.notes}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                {artwork.notes.length > 60 && (
                  <button
                    onClick={() => setNotesExpanded(!notesExpanded)}
                    className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5"
                  >
                    {notesExpanded ? <><ChevronUp className="h-3 w-3" /> Less</> : <><ChevronDown className="h-3 w-3" /> More</>}
                  </button>
                )}
                <button
                  onClick={() => startEditing("notes", artwork.notes || "")}
                  className="text-[10px] text-muted-foreground hover:text-foreground"
                >
                  Edit
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => startEditing("notes", "")}
              className="text-xs px-1.5 py-0.5 rounded hover:bg-muted transition-colors text-muted-foreground"
            >
              Add note...
            </button>
          )}
        </td>
      </tr>

      {/* Expanded images gallery row */}
      {imagesExpanded && (
        <tr className="border-b border-border bg-muted/20">
          <td colSpan={8} className="py-3 px-4">
            <CatalogImageGallery artworkId={artwork.id} />
          </td>
        </tr>
      )}

      <Dialog open={imageOpen} onOpenChange={setImageOpen}>
        <DialogContent className="max-w-3xl p-2 bg-background">
          <div className="flex flex-col items-center gap-3">
            <img
              src={artwork.image_url}
              alt={artwork.title}
              className="max-h-[80vh] w-auto object-contain rounded"
            />
            <div className="text-center">
              <p className="text-sm font-medium">{artwork.title}</p>
              {artwork.year && <p className="text-xs text-muted-foreground">{artwork.year}</p>}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
