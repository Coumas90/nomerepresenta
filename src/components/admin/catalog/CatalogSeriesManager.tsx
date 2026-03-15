import { useState, useMemo } from "react";
import { Plus, X, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSiteSetting, useUpdateSiteSetting } from "@/hooks/useSiteSettings";
import { toast } from "sonner";

const SETTING_KEY = "catalog_series_names";

export const useCatalogSeriesNames = (): string[] => {
  const raw = useSiteSetting(SETTING_KEY);
  return useMemo(() => {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [raw]);
};

export const CatalogSeriesManager = () => {
  const managedNames = useCatalogSeriesNames();
  const updateSetting = useUpdateSiteSetting();
  const [showInput, setShowInput] = useState(false);
  const [newName, setNewName] = useState("");

  const handleAdd = () => {
    const trimmed = newName.trim().toUpperCase();
    if (!trimmed) return;
    if (managedNames.includes(trimmed)) {
      toast.error("Series already exists");
      return;
    }
    const updated = [...managedNames, trimmed].sort();
    updateSetting.mutate(
      { key: SETTING_KEY, value: JSON.stringify(updated) },
      { onSuccess: () => toast.success(`Added "${trimmed}"`) }
    );
    setNewName("");
    setShowInput(false);
  };

  const handleRemove = (name: string) => {
    const updated = managedNames.filter((n) => n !== name);
    updateSetting.mutate(
      { key: SETTING_KEY, value: JSON.stringify(updated) },
      { onSuccess: () => toast.success(`Removed "${name}"`) }
    );
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Tag className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">Catalog Series:</span>
      {managedNames.map((name) => (
        <Badge key={name} variant="secondary" className="text-[11px] gap-1 pr-1">
          {name}
          <button
            onClick={() => handleRemove(name)}
            className="ml-0.5 hover:text-destructive transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      {showInput ? (
        <div className="flex items-center gap-1">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Series name"
            className="h-7 w-32 text-xs"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
              if (e.key === "Escape") { setShowInput(false); setNewName(""); }
            }}
            autoFocus
          />
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleAdd}>
            <Plus className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setShowInput(false); setNewName(""); }}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <Button variant="ghost" size="sm" className="h-6 text-xs gap-1" onClick={() => setShowInput(true)}>
          <Plus className="h-3 w-3" /> Add
        </Button>
      )}
    </div>
  );
};
