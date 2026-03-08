import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ExternalLink, Trash2, Copy, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  usePricelists,
  useCreatePricelist,
  useDeletePricelist,
  useUpdatePricelist,
} from "@/hooks/usePricelist";
import { toast } from "sonner";
import { PricelistEditor } from "./pricelist/PricelistEditor";

const PricelistManager = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPricelistId, setEditingPricelistId] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<Set<string>>(new Set());

  const { data: pricelists = [] } = usePricelists();
  const createPricelist = useCreatePricelist();
  const deletePricelist = useDeletePricelist();
  const updatePricelist = useUpdatePricelist();

  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleCreate = () => {
    if (!newName || !newSlug || !newPassword) return;
    createPricelist.mutate(
      { name: newName, slug: newSlug.toLowerCase().replace(/[^a-z0-9-]/g, "-"), password: newPassword },
      {
        onSuccess: () => {
          setShowCreateDialog(false);
          setNewName("");
          setNewSlug("");
          setNewPassword("");
        },
      }
    );
  };

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/pricelist/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (editingPricelistId) {
    const pricelist = pricelists.find((p) => p.id === editingPricelistId);
    if (!pricelist) return null;
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => setEditingPricelistId(null)}>
            ← Back
          </Button>
          <h2 className="text-xl font-semibold">{pricelist.name}</h2>
        </div>
        <PricelistEditor pricelist={pricelist} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Pricelists</h2>
          <p className="text-sm text-muted-foreground">
            Create multiple pricelists with different passwords and share them.
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Pricelist
        </Button>
      </div>

      {pricelists.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No pricelists yet. Create one to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pricelists.map((pl) => (
            <Card key={pl.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1 flex-1">
                    <h3 className="font-semibold text-base">{pl.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs">
                        /pricelist/{pl.slug}
                      </span>
                      <span className="flex items-center gap-1">
                        Series:{" "}
                        <Input
                          defaultValue={pl.series_name || ""}
                          placeholder="e.g. TRI-PEEL"
                          className="h-6 w-32 text-xs inline-flex"
                          onBlur={(e) => {
                            if (e.target.value !== (pl.series_name || "")) {
                              updatePricelist.mutate({ id: pl.id, updates: { series_name: e.target.value } });
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                          }}
                        />
                      </span>
                       <span className="flex items-center gap-1">
                        Currency:{" "}
                        <Select
                          defaultValue={pl.active_currency || "USD"}
                          onValueChange={(val) => updatePricelist.mutate({ id: pl.id, updates: { active_currency: val as any } })}
                        >
                          <SelectTrigger className="h-6 w-20 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="BRL">R$</SelectItem>
                          </SelectContent>
                        </Select>
                      </span>
                      <span className="flex items-center gap-1">
                        Password:{" "}
                        <button
                          onClick={() => togglePasswordVisibility(pl.id)}
                          className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                        >
                          {showPasswords.has(pl.id) ? (
                            <>
                              <span className="font-mono">{pl.password}</span>
                              <EyeOff className="h-3 w-3" />
                            </>
                          ) : (
                            <>
                              <span>••••••</span>
                              <Eye className="h-3 w-3" />
                            </>
                          )}
                        </button>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyLink(pl.slug)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy Link
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a href={`/pricelist/${pl.slug}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </a>
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setEditingPricelistId(pl.id)}
                    >
                      Edit Items
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => deletePricelist.mutate(pl.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Pricelist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  if (!newSlug || newSlug === newName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/,"")) {
                    setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/,""));
                  }
                }}
                placeholder="e.g. Gallery XYZ"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Slug (URL)</Label>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">/pricelist/</span>
                <Input
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="gallery-xyz"
                />
              </div>
            </div>
            <div>
              <Label>Password</Label>
              <Input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter password for this pricelist"
                className="mt-1"
              />
            </div>
            <Button onClick={handleCreate} disabled={!newName || !newSlug || !newPassword} className="w-full">
              Create Pricelist
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PricelistManager;
