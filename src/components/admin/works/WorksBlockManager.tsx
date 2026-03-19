import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Trash2, GripVertical, Image, Images, Eye, EyeOff, Edit, ChevronDown, ChevronUp } from "lucide-react";
import {
  useWorksBlocks,
  useCreateWorksBlock,
  useDeleteWorksBlock,
  useUpdateWorksBlock,
  useReorderWorksBlocks,
  useAddBlockItem,
  useRemoveBlockItem,
  useReorderBlockItems,
  type WorksBlockWithItems,
  type BlockType,
} from "@/hooks/useWorksBlocks";
import {
  useWorksSections,
  useCreateWorksSection,
  useDeleteWorksSection,
  useUpdateWorksSection,
  useReorderWorksSections,
} from "@/hooks/useWorksSections";
import ArtworkPicker from "./ArtworkPicker";
import SortableBlock from "./SortableBlock";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Sortable section wrapper
const SortableSection = ({
  section,
  blocks,
  onDelete,
  onRename,
  onToggleHeader,
  onAddBlock,
  onDeleteBlock,
  onAddArtwork,
  onRemoveItem,
  onReorderItems,
  onChangeType,
  onToggleHidden,
  onReorderBlocks,
}: {
  section: { id: string; name: string; is_visible: boolean; show_in_header: boolean };
  blocks: WorksBlockWithItems[];
  onDelete: () => void;
  onRename: (name: string) => void;
  onToggleHeader: (show: boolean) => void;
  onAddBlock: (type: BlockType) => void;
  onDeleteBlock: (blockId: string) => void;
  onAddArtwork: (blockId: string) => void;
  onRemoveItem: (itemId: string) => void;
  onReorderItems: (blockId: string, items: { id: string; display_order: number }[]) => void;
  onChangeType: (blockId: string, type: BlockType) => void;
  onToggleHidden: (blockId: string, isHidden: boolean) => void;
  onReorderBlocks: (event: DragEndEvent) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(section.name);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  const blockSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleSaveRename = () => {
    if (editName.trim() && editName.trim() !== section.name) {
      onRename(editName.trim());
    }
    setEditing(false);
  };

  return (
    <div ref={setNodeRef} style={style} className="border rounded-lg bg-card mb-3">
      <div className="flex items-center gap-2 p-3">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        {editing ? (
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleSaveRename}
            onKeyDown={(e) => e.key === "Enter" && handleSaveRename()}
            className="h-7 text-sm font-semibold w-48"
            autoFocus
          />
        ) : (
          <h3 className="text-sm font-semibold uppercase tracking-wide flex-1">{section.name}</h3>
        )}
        <span className="text-xs text-muted-foreground">
          {blocks.length} block{blocks.length !== 1 ? "s" : ""}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onToggleHeader(!section.show_in_header)}
          title={section.show_in_header ? "Hide from Works header" : "Show in Works header"}
        >
          {section.show_in_header ? <Eye className="h-3.5 w-3.5 text-foreground" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditName(section.name); setEditing(true); }}>
          <Edit className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDelete}>
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </div>

      {expanded && (
        <div className="px-3 pb-3 border-t border-border/50 pt-2">
          <div className="flex gap-2 mb-3">
            <Button variant="outline" size="sm" onClick={() => onAddBlock("single")}>
              <Image className="h-3.5 w-3.5 mr-1.5" />
              Single Block
            </Button>
            <Button variant="outline" size="sm" onClick={() => onAddBlock("carousel")}>
              <Images className="h-3.5 w-3.5 mr-1.5" />
              Multiple Block
            </Button>
          </div>

          {blocks.length > 0 ? (
            <DndContext sensors={blockSensors} collisionDetection={closestCenter} onDragEnd={onReorderBlocks}>
              <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                {blocks.map((block) => (
                  <SortableBlock
                    key={block.id}
                    block={block}
                    onDelete={() => onDeleteBlock(block.id)}
                    onAddArtwork={onAddArtwork}
                    onRemoveItem={onRemoveItem}
                    onReorderItems={onReorderItems}
                    onChangeType={onChangeType}
                    onToggleHidden={onToggleHidden}
                  />
                ))}
              </SortableContext>
            </DndContext>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">No blocks yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

const WorksBlockManager = () => {
  const { data: allBlocks = [], isLoading: blocksLoading } = useWorksBlocks();
  const { data: sections = [], isLoading: sectionsLoading } = useWorksSections();
  const createBlock = useCreateWorksBlock();
  const deleteBlock = useDeleteWorksBlock();
  const updateBlock = useUpdateWorksBlock();
  const reorderBlocks = useReorderWorksBlocks();
  const addItem = useAddBlockItem();
  const removeItem = useRemoveBlockItem();
  const reorderItems = useReorderBlockItems();
  const createSection = useCreateWorksSection();
  const deleteSection = useDeleteWorksSection();
  const updateSection = useUpdateWorksSection();
  const reorderSections = useReorderWorksSections();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<{ blockId: string; multiple: boolean } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "block" | "section"; id: string } | null>(null);
  const [newSectionName, setNewSectionName] = useState("");

  const blocksBySection = useMemo(() => {
    const map = new Map<string, WorksBlockWithItems[]>();
    for (const block of allBlocks) {
      const key = block.section_id || "";
      const list = map.get(key) || [];
      list.push(block);
      map.set(key, list);
    }
    return map;
  }, [allBlocks]);

  const sectionSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleAddSection = async () => {
    const name = newSectionName.trim();
    if (!name) return;
    await createSection.mutateAsync({ name, display_order: sections.length });
    setNewSectionName("");
  };

  const handleAddBlock = async (sectionId: string, type: BlockType) => {
    const sectionBlocks = blocksBySection.get(sectionId) || [];
    const maxOrder = sectionBlocks.reduce((max, b) => Math.max(max, b.display_order), -1);
    const block = await createBlock.mutateAsync({
      section_id: sectionId,
      block_type: type,
      display_order: maxOrder + 1,
    });
    setPickerTarget({ blockId: block.id, multiple: type === "carousel" });
    setPickerOpen(true);
  };

  const handleAddArtwork = (blockId: string) => {
    const block = allBlocks.find((b) => b.id === blockId);
    setPickerTarget({ blockId, multiple: block?.block_type === "carousel" });
    setPickerOpen(true);
  };

  const handlePickerSelect = async (artworkIds: string[]) => {
    if (!pickerTarget) return;
    const block = allBlocks.find((b) => b.id === pickerTarget.blockId);
    const startOrder = block?.items.length || 0;
    for (let i = 0; i < artworkIds.length; i++) {
      await addItem.mutateAsync({
        block_id: pickerTarget.blockId,
        artwork_id: artworkIds[i],
        display_order: startOrder + i,
      });
    }
  };

  const handleSectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = sections.findIndex((s) => s.id === active.id);
    const newIdx = sections.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(sections, oldIdx, newIdx);
    reorderSections.mutate(reordered.map((s, i) => ({ id: s.id, display_order: i })));
  };

  const handleBlockDragEnd = (sectionId: string) => (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const blocks = blocksBySection.get(sectionId) || [];
    const oldIdx = blocks.findIndex((b) => b.id === active.id);
    const newIdx = blocks.findIndex((b) => b.id === over.id);
    const reordered = arrayMove(blocks, oldIdx, newIdx);
    reorderBlocks.mutate(reordered.map((b, i) => ({ id: b.id, display_order: i })));
  };

  const handleReorderItems = (blockId: string, items: { id: string; display_order: number }[]) => {
    reorderItems.mutate(items);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "block") {
      deleteBlock.mutate(deleteTarget.id);
    } else {
      deleteSection.mutate(deleteTarget.id);
    }
    setDeleteTarget(null);
  };

  const getExcludeIds = () => {
    if (!pickerTarget) return [];
    const block = allBlocks.find((b) => b.id === pickerTarget.blockId);
    return block?.items.map((i) => i.artwork_id) || [];
  };

  if (blocksLoading || sectionsLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Works</h2>
          <p className="text-sm text-muted-foreground">
            Manage display sections and blocks for the public Works page. Sections are independent from Catalog series.
          </p>
        </div>

        {/* Add new section */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex gap-2">
              <Input
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                placeholder="New section name (e.g. TRI-PEEL, BUILD UPS)"
                className="flex-1"
                onKeyDown={(e) => e.key === "Enter" && handleAddSection()}
              />
              <Button onClick={handleAddSection} disabled={!newSectionName.trim() || createSection.isPending}>
                <Plus className="h-4 w-4 mr-1" />
                Add Section
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sections list */}
        {sections.length > 0 ? (
          <DndContext sensors={sectionSensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
            <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              {sections.map((section) => {
                const blocks = blocksBySection.get(section.id) || [];
                return (
                  <SortableSection
                    key={section.id}
                    section={section}
                    blocks={blocks}
                    onDelete={() => setDeleteTarget({ type: "section", id: section.id })}
                    onRename={(name) => updateSection.mutate({ id: section.id, updates: { name } })}
                    onToggleHeader={(show) => updateSection.mutate({ id: section.id, updates: { show_in_header: show } })}
                    onAddBlock={(type) => handleAddBlock(section.id, type)}
                    onDeleteBlock={(blockId) => setDeleteTarget({ type: "block", id: blockId })}
                    onAddArtwork={handleAddArtwork}
                    onRemoveItem={(itemId) => removeItem.mutate(itemId)}
                    onReorderItems={handleReorderItems}
                    onChangeType={(blockId, type) => updateBlock.mutate({ id: blockId, updates: { block_type: type } })}
                    onToggleHidden={(blockId, hidden) => updateBlock.mutate({ id: blockId, updates: { is_hidden: hidden } as any })}
                    onReorderBlocks={handleBlockDragEnd(section.id)}
                  />
                );
              })}
            </SortableContext>
          </DndContext>
        ) : (
          <p className="text-center py-8 text-muted-foreground">
            No sections yet. Create one above to start organizing your Works page.
          </p>
        )}
      </div>

      <ArtworkPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handlePickerSelect}
        excludeIds={getExcludeIds()}
        multiple={pickerTarget?.multiple || false}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {deleteTarget?.type === "section" ? "Section" : "Block"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.type === "section"
                ? "This will remove the section and all its blocks from the Works page. The artworks themselves will remain in the Catalog."
                : "This will remove the block from the Works page. The artworks themselves will remain in the Catalog."}
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

export default WorksBlockManager;
