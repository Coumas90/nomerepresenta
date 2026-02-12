import { useState, useEffect } from "react";
import { useBioSettings, useUpdateBioSetting } from "@/hooks/useBioSettings";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Save } from "lucide-react";

const BioTextEditor = () => {
  const { data: settings, isLoading } = useBioSettings();
  const updateMutation = useUpdateBioSetting();
  const [text, setText] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings?.bio_text) {
      setText(settings.bio_text);
    }
  }, [settings?.bio_text]);

  const handleSave = () => {
    updateMutation.mutate(
      { key: "bio_text", value: text },
      { onSuccess: () => setHasChanges(false) }
    );
  };

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-1">Artist Statement</h3>
        <p className="text-xs text-muted-foreground mb-3">
          This text appears on the Bio page below the artist name.
        </p>
      </div>
      <Textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setHasChanges(true);
        }}
        rows={10}
        className="font-mono text-sm"
        placeholder="Enter bio text..."
      />
      <Button
        onClick={handleSave}
        disabled={!hasChanges || updateMutation.isPending}
        size="sm"
      >
        <Save className="h-4 w-4 mr-2" />
        {updateMutation.isPending ? "Saving..." : "Save Text"}
      </Button>
    </div>
  );
};

export default BioTextEditor;
