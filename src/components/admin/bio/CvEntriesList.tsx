import { useState } from "react";
import { useBioCvEntries, useUpdateCvEntry, useDeleteCvEntry, type BioCvEntry } from "@/hooks/useBioCvEntries";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Check, X } from "lucide-react";

const SECTION_LABELS: Record<string, string> = {
  education: "Education",
  solo_exhibitions: "Solo Exhibitions",
  group_exhibitions: "Group Exhibitions",
};

const SECTION_ORDER = ["education", "solo_exhibitions", "group_exhibitions"];

const EditRow = ({ entry, onCancel }: { entry: BioCvEntry; onCancel: () => void }) => {
  const updateMutation = useUpdateCvEntry();
  const [year, setYear] = useState(entry.year);
  const [title, setTitle] = useState(entry.title);
  const [venue, setVenue] = useState(entry.venue || "");
  const [link, setLink] = useState(entry.link || "");

  const handleSave = () => {
    updateMutation.mutate(
      { id: entry.id, year, title, venue: venue || null, link: link || null },
      { onSuccess: onCancel }
    );
  };

  return (
    <div className="grid grid-cols-[60px_1fr_1fr_auto] gap-2 items-center py-1">
      <Input value={year} onChange={(e) => setYear(e.target.value)} className="h-7 text-xs" />
      <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-7 text-xs" />
      <Input value={venue} onChange={(e) => setVenue(e.target.value)} className="h-7 text-xs" />
      <div className="flex gap-1">
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleSave} disabled={updateMutation.isPending}>
          <Check className="h-3 w-3" />
        </Button>
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onCancel}>
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

const CvEntriesList = () => {
  const { data: entries, isLoading } = useBioCvEntries();
  const deleteMutation = useDeleteCvEntry();
  const [editingId, setEditingId] = useState<string | null>(null);

  if (isLoading) {
    return <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>;
  }

  const grouped = SECTION_ORDER.reduce<Record<string, BioCvEntry[]>>((acc, section) => {
    acc[section] = (entries || []).filter((e) => e.section === section);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {SECTION_ORDER.map((section) => {
        const items = grouped[section];
        if (!items?.length) return null;
        return (
          <div key={section}>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              {SECTION_LABELS[section]}
            </h4>
            <div className="space-y-1">
              {items.map((entry) =>
                editingId === entry.id ? (
                  <EditRow key={entry.id} entry={entry} onCancel={() => setEditingId(null)} />
                ) : (
                  <div key={entry.id} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50 group text-sm">
                    <div className="flex items-baseline gap-3 min-w-0">
                      <span className="text-muted-foreground text-xs w-16 shrink-0">{entry.year}</span>
                      <span className="font-medium truncate">{entry.title}</span>
                      {entry.venue && <span className="text-muted-foreground text-xs truncate">{entry.venue}</span>}
                      {entry.link && <span className="text-xs text-blue-500">🔗</span>}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditingId(entry.id)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-destructive"
                        onClick={() => deleteMutation.mutate(entry.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CvEntriesList;
