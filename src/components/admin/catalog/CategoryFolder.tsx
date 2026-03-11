import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight, Paintbrush, Camera, Pencil, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { MediumType } from "@/hooks/useCatalog";

interface CategoryFolderProps {
  category: MediumType;
  count: number;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const CATEGORY_CONFIG: Record<MediumType, { label: string; icon: React.ElementType }> = {
  PAINTING: { label: "Paintings", icon: Paintbrush },
  POW: { label: "POW (Drawings)", icon: Pencil },
  PHOTO: { label: "Photographs", icon: Camera },
};

export const CategoryFolder = ({ category, count, isOpen, onToggle, children }: CategoryFolderProps) => {
  const config = CATEGORY_CONFIG[category];
  const Icon = config.icon;

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger className="flex items-center gap-3 w-full px-4 py-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors group">
        <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`} />
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-sm">{config.label}</span>
        <Badge variant="secondary" className="text-[10px] ml-auto">
          {count}
        </Badge>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-1">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};
