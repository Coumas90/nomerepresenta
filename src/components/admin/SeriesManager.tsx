import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Edit, Trash2, GripVertical, Plus, X, ChevronDown, ChevronUp } from "lucide-react";
import { CategoryFolder } from "@/components/admin/catalog/CategoryFolder";
import { useSeries } from "@/hooks/useSeries";
import { useCreateSeries, useUpdateSeries, useDeleteSeries, useUpdateSeriesOrder } from "@/hooks/useSeriesMutations";
import { useCatalogArtworks, type CatalogArtwork, type MediumType } from "@/hooks/useCatalog";
import { SeriesGallery } from "@/components/admin/series/SeriesGallery";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const MEDIUM_TYPES: MediumType[] = ["PAINTING", "POW", "PHOTO", "ARTIST_BOOK"];

interface SeriesItemProps {
  id: string;
  name: string;
  description: string | null;
  artworkCount: number;
  artworks: CatalogArtwork[];
  onEdit: () => void;
  onDelete: () => void;
}

const SortableSeriesItem = ({ id, name, description, artworkCount, artworks, onEdit, onDelete }: SeriesItemProps) => {
  const [expanded, setExpanded] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-2">
      <div className="border border-border rounded-lg p-3 bg-card">
        <div className="flex items-center gap-3">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm">{name}</h4>
              <span className="text-[10px] text-muted-foreground">({artworkCount})</span>
            </div>
            {description && (
              <p className="text-xs text-muted-foreground truncate">{description}</p>
            )}
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-0.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={onEdit}>
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </div>

        {expanded && (
          <SeriesGallery artworks={artworks} />
        )}
      </div>
    </div>
  );
};

const SeriesManager = () => {
  const { data: series = [], isLoading } = useSeries();
  const { data: catalogArtworks = [] } = useCatalogArtworks();
  const createMutation = useCreateSeries();
  const updateMutation = useUpdateSeries();
  const deleteMutation = useDeleteSeries();
  const updateOrderMutation = useUpdateSeriesOrder();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [seriesToDelete, setSeriesToDelete] = useState<string | null>(null);
  const [openCategories, setOpenCategories] = useState<Set<MediumType>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Map each series to its predominant medium_type based on artworks
  const seriesByMediumType = useMemo(() => {
    const result = new Map<MediumType, typeof series>();
    for (const mt of MEDIUM_TYPES) {
      result.set(mt, []);
    }

    for (const s of series) {
      const seriesArtworks = catalogArtworks.filter(a => a.series_id === s.id);
      // Determine predominant medium type
      const typeCounts = new Map<string, number>();
      for (const a of seriesArtworks) {
        const mt = a.medium_type || "PAINTING";
        typeCounts.set(mt, (typeCounts.get(mt) || 0) + 1);
      }
      let predominant: MediumType = "PAINTING";
      let maxCount = 0;
      for (const [mt, count] of typeCounts) {
        if (count > maxCount) {
          predominant = mt as MediumType;
          maxCount = count;
        }
      }
      const arr = result.get(predominant) || [];
      arr.push(s);
      result.set(predominant, arr);
    }

    return result;
  }, [series, catalogArtworks]);

  // Count artworks per medium type
  const artworkCountByMediumType = useMemo(() => {
    const counts = new Map<MediumType, number>();
    for (const mt of MEDIUM_TYPES) {
      counts.set(mt, catalogArtworks.filter(a => (a.medium_type || "PAINTING") === mt).length);
    }
    return counts;
  }, [catalogArtworks]);

  const getArtworkCount = (seriesId: string) => {
    return catalogArtworks.filter(a => a.series_id === seriesId).length;
  };

  const getSeriesArtworks = (seriesId: string) => {
    return catalogArtworks.filter(a => a.series_id === seriesId);
  };

  const toggleCategory = (mt: MediumType) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(mt)) next.delete(mt);
      else next.add(mt);
      return next;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = series.findIndex(s => s.id === active.id);
      const newIndex = series.findIndex(s => s.id === over.id);
      const newOrder = arrayMove(series, oldIndex, newIndex);
      const updates = newOrder.map((s, index) => ({ id: s.id, display_order: index }));
      updateOrderMutation.mutate(updates);
    }
  };

  const handleEdit = (id: string, name: string, description: string | null) => {
    setEditingId(id);
    setFormData({ name, description: description || "" });
    setShowForm(true);
  };

  const handleDeleteClick = (id: string) => {
    setSeriesToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (seriesToDelete) {
      await deleteMutation.mutateAsync(seriesToDelete);
      setDeleteDialogOpen(false);
      setSeriesToDelete(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, ...formData });
    } else {
      await createMutation.mutateAsync({ ...formData, display_order: series.length });
    }
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: "", description: "" });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: "", description: "" });
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading series...</div>;
  }

  return (
    <>
      <div className="space-y-6">
        {/* Form */}
        {showForm ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{editingId ? "Edit Series" : "Create New Series"}</CardTitle>
                <Button variant="ghost" size="icon" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Series Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., TRI-PEEL"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the series"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingId ? "Update" : "Create"} Series
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Button onClick={() => setShowForm(true)} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            New Series
          </Button>
        )}

        {/* Category Folders with Series inside */}
        <div className="space-y-3">
          {MEDIUM_TYPES.map((mt) => {
            const mtSeries = seriesByMediumType.get(mt) || [];
            const totalCount = artworkCountByMediumType.get(mt) || 0;

            return (
              <CategoryFolder
                key={mt}
                category={mt}
                count={totalCount}
                isOpen={openCategories.has(mt)}
                onToggle={() => toggleCategory(mt)}
              >
                <div className="p-3 space-y-1">
                  {mtSeries.length > 0 ? (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={mtSeries.map(s => s.id)} strategy={verticalListSortingStrategy}>
                        {mtSeries.map((s) => (
                          <SortableSeriesItem
                            key={s.id}
                            id={s.id}
                            name={s.name}
                            description={s.description}
                            artworkCount={getArtworkCount(s.id)}
                            artworks={getSeriesArtworks(s.id)}
                            onEdit={() => handleEdit(s.id, s.name, s.description)}
                            onDelete={() => handleDeleteClick(s.id)}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  ) : (
                    <p className="text-xs text-muted-foreground py-2">No series in this category yet.</p>
                  )}
                </div>
              </CategoryFolder>
            );
          })}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the series. Note: You cannot delete a series that has artworks associated with it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SeriesManager;
