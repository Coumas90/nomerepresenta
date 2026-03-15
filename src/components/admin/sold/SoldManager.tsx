import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import ArtworkPicker from "@/components/admin/works/ArtworkPicker";
import { SoldRowEditor, type ThumbSize } from "./SoldRowEditor";
import {
  useSoldArtworks,
  useAddSoldArtwork,
  useUpdateSoldArtwork,
  useDeleteSoldArtwork,
  useUploadInvoice,
  useDownloadInvoice,
} from "@/hooks/useSoldArtworks";

const SoldManager = () => {
  const { data: items = [], isLoading } = useSoldArtworks();
  const addMutation = useAddSoldArtwork();
  const updateMutation = useUpdateSoldArtwork();
  const deleteMutation = useDeleteSoldArtwork();
  const uploadInvoice = useUploadInvoice();
  const downloadInvoice = useDownloadInvoice();
  const [pickerOpen, setPickerOpen] = useState(false);

  const existingArtworkIds = items.map((i) => i.artwork_id);

  const handleAdd = (ids: string[]) => {
    ids.forEach((id) => addMutation.mutate(id));
  };

  const handleUpdate = (id: string, updates: Record<string, unknown>) => {
    updateMutation.mutate({ id, updates });
  };

  const handleDelete = (id: string) => {
    if (confirm("Remove this sold record?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleUploadInvoice = (soldId: string, file: File) => {
    uploadInvoice.mutate({ soldId, file });
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground py-8 text-center">Loading sold artworks…</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Sold Artworks</h2>
          <p className="text-xs text-muted-foreground">{items.length} record{items.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => setPickerOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Artwork
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground border rounded-lg">
          No sold artworks yet. Click "Add Artwork" to get started.
        </div>
      ) : (
        <ScrollArea className="w-full">
          <div className="min-w-[1400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Artwork</TableHead>
                  <TableHead>Date Sold</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Collector</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="w-[100px]">Invoice</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <SoldRowEditor
                    key={item.id}
                    item={item}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    onUploadInvoice={handleUploadInvoice}
                    onDownloadInvoice={downloadInvoice}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      )}

      <ArtworkPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleAdd}
        excludeIds={existingArtworkIds}
        multiple
      />
    </div>
  );
};

export default SoldManager;
