import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { CheckCircle } from "lucide-react";
import { BulkUploadItem } from "./types";

interface BulkUploadEditModeProps {
  items: BulkUploadItem[];
  isSaving: boolean;
  onUpdateMetadata: (id: string, field: "title" | "description", value: string) => void;
}

export const BulkUploadEditMode = ({
  items,
  isSaving,
  onUpdateMetadata,
}: BulkUploadEditModeProps) => {
  const editableItems = items.filter(
    (item) => item.status === "uploaded" || item.status === "saving" || item.status === "done"
  );
  const doneCount = items.filter((i) => i.status === "done").length;
  const progressPercent = items.length > 0 ? (doneCount / items.length) * 100 : 0;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Add titles and descriptions to your images (optional). Click "Save All" when done.
      </p>

      {isSaving && <Progress value={progressPercent} className="h-2" />}

      <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
        {editableItems.map((item) => (
          <Card key={item.id} className={item.status === "done" ? "opacity-60" : ""}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="relative shrink-0">
                  <img
                    src={item.preview || item.url}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-md"
                  />
                  {item.status === "saving" && (
                    <div className="absolute inset-0 bg-background/70 flex items-center justify-center rounded-md">
                      <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                    </div>
                  )}
                  {item.status === "done" && (
                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center rounded-md">
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <Label htmlFor={`title-${item.id}`} className="text-xs">
                      Title
                    </Label>
                    <Input
                      id={`title-${item.id}`}
                      value={item.title}
                      onChange={(e) => onUpdateMetadata(item.id, "title", e.target.value)}
                      placeholder="Image title (optional)"
                      disabled={item.status !== "uploaded"}
                      className="h-9"
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`desc-${item.id}`} className="text-xs">
                      Description
                    </Label>
                    <Textarea
                      id={`desc-${item.id}`}
                      value={item.description}
                      onChange={(e) => onUpdateMetadata(item.id, "description", e.target.value)}
                      placeholder="Brief description (optional)"
                      disabled={item.status !== "uploaded"}
                      rows={2}
                      className="resize-none"
                      maxLength={500}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
