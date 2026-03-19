import { useState, useMemo } from "react";
import { Plus, X, Tag, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSiteSetting, useUpdateSiteSetting } from "@/hooks/useSiteSettings";
import { toast } from "sonner";

const SETTING_KEY = "catalog_series_names";
const HIERARCHY_KEY = "catalog_series_hierarchy";

/** Flat list of all catalog series names */
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

/** Hierarchy map: parent → sub-series[] */
export const useCatalogSeriesHierarchy = (): Record<string, string[]> => {
  const raw = useSiteSetting(HIERARCHY_KEY);
  return useMemo(() => {
    if (!raw) return {};
    try {
      const parsed = JSON.parse(raw);
      return typeof parsed === "object" && parsed !== null ? parsed : {};
    } catch {
      return {};
    }
  }, [raw]);
};

/** Get all sub-series names for a given parent */
export const useSubSeriesFor = (parent: string | null): string[] => {
  const hierarchy = useCatalogSeriesHierarchy();
  if (!parent) return [];
  return hierarchy[parent] || [];
};

/** Get all sub-series as flat list */
export const useAllSubSeries = (): string[] => {
  const hierarchy = useCatalogSeriesHierarchy();
  return useMemo(() => Object.values(hierarchy).flat(), [hierarchy]);
};

export const CatalogSeriesManager = () => {
  const managedNames = useCatalogSeriesNames();
  const hierarchy = useCatalogSeriesHierarchy();
  const updateSetting = useUpdateSiteSetting();
  const [showInput, setShowInput] = useState(false);
  const [newName, setNewName] = useState("");
  const [addingSubFor, setAddingSubFor] = useState<string | null>(null);
  const [newSubName, setNewSubName] = useState("");

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
    );
    // Also remove from hierarchy if it's a parent
    if (hierarchy[name]) {
      const newHierarchy = { ...hierarchy };
      delete newHierarchy[name];
      updateSetting.mutate(
        { key: HIERARCHY_KEY, value: JSON.stringify(newHierarchy) },
        { onSuccess: () => toast.success(`Removed "${name}" and its sub-series`) }
      );
    } else {
      toast.success(`Removed "${name}"`);
    }
  };

  const handleAddSub = (parent: string) => {
    const trimmed = newSubName.trim().toUpperCase();
    if (!trimmed) return;
    const existing = hierarchy[parent] || [];
    if (existing.includes(trimmed)) {
      toast.error("Sub-series already exists");
      return;
    }
    const newHierarchy = { ...hierarchy, [parent]: [...existing, trimmed].sort() };
    updateSetting.mutate(
      { key: HIERARCHY_KEY, value: JSON.stringify(newHierarchy) },
      { onSuccess: () => toast.success(`Added sub-series "${trimmed}" under "${parent}"`) }
    );
    setNewSubName("");
    setAddingSubFor(null);
  };

  const handleRemoveSub = (parent: string, sub: string) => {
    const existing = hierarchy[parent] || [];
    const updated = existing.filter((s) => s !== sub);
    const newHierarchy = { ...hierarchy };
    if (updated.length === 0) {
      delete newHierarchy[parent];
    } else {
      newHierarchy[parent] = updated;
    }
    updateSetting.mutate(
      { key: HIERARCHY_KEY, value: JSON.stringify(newHierarchy) },
      { onSuccess: () => toast.success(`Removed sub-series "${sub}"`) }
    );
  };

  return (
    <div className="space-y-2">
      {/* Main series row */}
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

      {/* Sub-series hierarchy */}
      {managedNames.length > 0 && (
        <div className="flex items-start gap-2 flex-wrap pl-5">
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
          <span className="text-xs text-muted-foreground">Sub-series:</span>
          {managedNames.map((parent) => {
            const subs = hierarchy[parent] || [];
            if (subs.length === 0 && addingSubFor !== parent) return null;
            return (
              <div key={parent} className="flex items-center gap-1 flex-wrap">
                <span className="text-[10px] text-muted-foreground font-medium">{parent}:</span>
                {subs.map((sub) => (
                  <Badge key={sub} variant="outline" className="text-[10px] gap-1 pr-1">
                    {sub}
                    <button
                      onClick={() => handleRemoveSub(parent, sub)}
                      className="ml-0.5 hover:text-destructive transition-colors"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                ))}
                {addingSubFor === parent && (
                  <div className="flex items-center gap-1">
                    <Input
                      value={newSubName}
                      onChange={(e) => setNewSubName(e.target.value)}
                      placeholder="Sub-series"
                      className="h-6 w-28 text-[10px]"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddSub(parent);
                        if (e.key === "Escape") { setAddingSubFor(null); setNewSubName(""); }
                      }}
                      autoFocus
                    />
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleAddSub(parent)}>
                      <Plus className="h-2.5 w-2.5" />
                    </Button>
                  </div>
                )}
                <span className="text-muted-foreground">|</span>
              </div>
            );
          })}
          {/* Add sub-series */}
          {addingSubFor === null ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-5 text-[10px] gap-0.5 px-1.5"
              onClick={() => setAddingSubFor("__picking__")}
            >
              <Plus className="h-2.5 w-2.5" /> Add
            </Button>
          ) : addingSubFor === "__picking__" ? (
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-[10px] text-muted-foreground">To:</span>
              {managedNames.map((parent) => (
                <Button
                  key={parent}
                  variant="outline"
                  size="sm"
                  className="h-5 text-[10px] px-1.5"
                  onClick={() => setAddingSubFor(parent)}
                >
                  {parent}
                </Button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="h-5 text-[10px] px-1.5"
                onClick={() => setAddingSubFor(null)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-5 text-[10px] px-1.5"
              onClick={() => { setAddingSubFor(null); setNewSubName(""); }}
            >
              Cancel
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
