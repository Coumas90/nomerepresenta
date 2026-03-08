import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Edit, Trash2, GripVertical, Plus, X, Eye, EyeOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useSeries } from "@/hooks/useSeries";
import { useCreateSeries, useUpdateSeries, useDeleteSeries, useUpdateSeriesOrder } from "@/hooks/useSeriesMutations";
import { useArtworks } from "@/hooks/useArtworks";
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

interface SortableSeriesItemProps {
  id: string;
  name: string;
  description: string | null;
  isVisible: boolean;
  showNameInMenu: boolean;
  artworkCount: number;
  onEdit: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
  onToggleNameInMenu: () => void;
}

const SortableSeriesItem = ({ id, name, description, isVisible, showNameInMenu, artworkCount, onEdit, onDelete, onToggleVisibility, onToggleNameInMenu }: SortableSeriesItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-3">
      <Card className={!isVisible ? "opacity-60" : ""}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base">{name}</h3>
              {description && (
                <p className="text-sm text-muted-foreground truncate">{description}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">{artworkCount} artworks</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Switch
                  checked={isVisible}
                  onCheckedChange={onToggleVisibility}
                  aria-label={isVisible ? "Hide series" : "Show series"}
                />
                <span className="text-xs text-muted-foreground">{isVisible ? "Visible" : "Hidden"}</span>
              </div>
              <Button variant="outline" size="icon" onClick={onEdit}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="icon" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const SeriesManager = () => {
  const { data: series = [], isLoading } = useSeries();
  const { data: artworks = [] } = useArtworks();
  const createMutation = useCreateSeries();
  const updateMutation = useUpdateSeries();
  const deleteMutation = useDeleteSeries();
  const updateOrderMutation = useUpdateSeriesOrder();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [seriesToDelete, setSeriesToDelete] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getArtworkCount = (seriesId: string) => {
    return artworks.filter(a => a.series_id === seriesId).length;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = series.findIndex(s => s.id === active.id);
      const newIndex = series.findIndex(s => s.id === over.id);

      const newOrder = arrayMove(series, oldIndex, newIndex);
      const updates = newOrder.map((s, index) => ({
        id: s.id,
        display_order: index,
      }));

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
      await createMutation.mutateAsync({
        ...formData,
        display_order: series.length,
      });
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
                    placeholder="e.g., TRI-PEEL (optional)"
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
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
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

        {/* Series List */}
        <Card>
          <CardHeader>
            <CardTitle>Series ({series.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {series.length > 0 ? (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={series.map(s => s.id)} strategy={verticalListSortingStrategy}>
                  {series.map((s) => (
                    <SortableSeriesItem
                      key={s.id}
                      id={s.id}
                      name={s.name}
                      description={s.description}
                      isVisible={s.is_visible !== false}
                      artworkCount={getArtworkCount(s.id)}
                      onEdit={() => handleEdit(s.id, s.name, s.description)}
                      onDelete={() => handleDeleteClick(s.id)}
                      onToggleVisibility={() => updateMutation.mutate({ id: s.id, is_visible: s.is_visible === false })}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No series found. Create your first series above.
              </div>
            )}
          </CardContent>
        </Card>
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
