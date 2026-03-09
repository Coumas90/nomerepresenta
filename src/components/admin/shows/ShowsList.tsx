import { useState, useEffect } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { useShows } from "@/hooks/useShows";
import { useDeleteShow, useUpdateShowOrder } from "@/hooks/useShowMutations";
import { useSiteSettings, useUpdateSiteSetting } from "@/hooks/useSiteSettings";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import type { ShowData } from "@/types/show";
import SortableShowItem from "./SortableShowItem";

interface ShowsListProps {
  onEdit: (show: ShowData) => void;
  onCreate: () => void;
}

const ShowsList = ({ onEdit, onCreate }: ShowsListProps) => {
  const { data: shows, isLoading } = useShows();
  const { data: siteSettings } = useSiteSettings();
  const updateSetting = useUpdateSiteSetting();
  const deleteShow = useDeleteShow();
  const updateOrder = useUpdateShowOrder();

  const [localShows, setLocalShows] = useState<ShowData[]>([]);

  useEffect(() => {
    if (shows) setLocalShows(shows);
  }, [shows]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const showsVisibleInMenu = siteSettings?.shows_visible_in_menu === "true";

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = localShows.findIndex((s) => s.id === active.id);
    const newIndex = localShows.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(localShows, oldIndex, newIndex);
    setLocalShows(reordered);

    updateOrder.mutate(reordered.map((s, i) => ({ id: s.id, display_order: i })));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Shows</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Manage exhibitions and shows. Drag to reorder.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Show in public menu</Label>
              <p className="text-xs text-muted-foreground mt-1">
                When enabled, SHOWS appears in the public navigation
              </p>
            </div>
            <Switch
              checked={showsVisibleInMenu}
              onCheckedChange={() =>
                updateSetting.mutate({ key: "shows_visible_in_menu", value: showsVisibleInMenu ? "false" : "true" })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={onCreate} className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        New Show
      </Button>

      {localShows.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No shows yet. Create your first one.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={localShows.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {localShows.map((show) => (
                <SortableShowItem
                  key={show.id}
                  show={show}
                  onEdit={onEdit}
                  onDelete={(id) => deleteShow.mutate(id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export default ShowsList;
