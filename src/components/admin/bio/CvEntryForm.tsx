import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useCreateCvEntry } from "@/hooks/useBioCvEntries";

const SECTIONS = [
  { value: "education", label: "Education" },
  { value: "solo_exhibitions", label: "Solo Exhibitions" },
  { value: "group_exhibitions", label: "Group Exhibitions" },
];

const CvEntryForm = () => {
  const createMutation = useCreateCvEntry();
  const [section, setSection] = useState("solo_exhibitions");
  const [year, setYear] = useState("");
  const [title, setTitle] = useState("");
  const [venue, setVenue] = useState("");
  const [link, setLink] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!year || !title) return;

    createMutation.mutate(
      {
        section,
        year,
        title,
        venue: venue || null,
        link: link || null,
        display_order: 0,
      },
      {
        onSuccess: () => {
          setYear("");
          setTitle("");
          setVenue("");
          setLink("");
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 space-y-3 bg-muted/30">
      <h4 className="text-sm font-medium">Add New Entry</h4>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Section</Label>
          <Select value={section} onValueChange={setSection}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SECTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Year</Label>
          <Input value={year} onChange={(e) => setYear(e.target.value)} className="h-8 text-xs" placeholder="2024" />
        </div>
      </div>
      <div>
        <Label className="text-xs">Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-8 text-xs" placeholder="Exhibition name" />
      </div>
      <div>
        <Label className="text-xs">Venue</Label>
        <Input value={venue} onChange={(e) => setVenue(e.target.value)} className="h-8 text-xs" placeholder=", Gallery Name, City" />
      </div>
      <div>
        <Label className="text-xs">Link (optional)</Label>
        <Input value={link} onChange={(e) => setLink(e.target.value)} className="h-8 text-xs" placeholder="https://..." />
      </div>
      <Button type="submit" size="sm" disabled={!year || !title || createMutation.isPending}>
        <Plus className="h-3 w-3 mr-1" />
        Add Entry
      </Button>
    </form>
  );
};

export default CvEntryForm;
