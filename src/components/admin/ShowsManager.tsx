import { useState } from "react";
import { useShows } from "@/hooks/useShows";
import { useCreateShow, useUpdateShow, useDeleteShow, useUploadShowImage, useAddShowImage, useDeleteShowImage } from "@/hooks/useShowMutations";
import { useShowImages } from "@/hooks/useShows";
import { useSiteSettings, useUpdateSiteSetting } from "@/hooks/useSiteSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, ArrowLeft, Upload, GripVertical, Eye, EyeOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { ShowData } from "@/types/show";

const ShowsManager = () => {
  const { data: shows, isLoading } = useShows();
  const { data: siteSettings } = useSiteSettings();
  const updateSetting = useUpdateSiteSetting();
  const createShow = useCreateShow();
  const updateShow = useUpdateShow();
  const deleteShow = useDeleteShow();

  const [editingShow, setEditingShow] = useState<ShowData | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const showsVisibleInMenu = siteSettings?.shows_visible_in_menu === "true";

  const toggleMenuVisibility = () => {
    updateSetting.mutate({
      key: "shows_visible_in_menu",
      value: showsVisibleInMenu ? "false" : "true",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (editingShow || isCreating) {
    return (
      <ShowForm
        show={editingShow}
        onBack={() => { setEditingShow(null); setIsCreating(false); }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Shows</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Manage exhibitions and shows. Each show has its own gallery page.
        </p>
      </div>

      {/* Global visibility toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Show in public menu</Label>
              <p className="text-xs text-muted-foreground mt-1">
                When enabled, SHOWS appears in the public navigation
              </p>
            </div>
            <Switch
              checked={showsVisibleInMenu}
              onCheckedChange={toggleMenuVisibility}
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={() => setIsCreating(true)} className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        New Show
      </Button>

      <div className="space-y-3">
        {(shows || []).map((show) => (
          <Card
            key={show.id}
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => setEditingShow(show)}
          >
            <CardContent className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {show.is_published ? (
                  <Eye className="h-4 w-4 text-green-600" />
                ) : (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium">{show.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {show.year} · /{show.slug}
                    {!show.is_published && " · Draft"}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("Delete this show?")) deleteShow.mutate(show.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {(!shows || shows.length === 0) && (
          <p className="text-sm text-muted-foreground text-center py-8">No shows yet. Create your first one.</p>
        )}
      </div>
    </div>
  );
};

/** Form for creating/editing a single show + its image gallery */
function ShowForm({ show, onBack }: { show: ShowData | null; onBack: () => void }) {
  const createShow = useCreateShow();
  const updateShow = useUpdateShow();
  const uploadImage = useUploadShowImage();
  const addImage = useAddShowImage();
  const deleteImage = useDeleteShowImage();

  const [title, setTitle] = useState(show?.title || "");
  const [slug, setSlug] = useState(show?.slug || "");
  const [year, setYear] = useState(show?.year || "");
  const [subtitle, setSubtitle] = useState(show?.subtitle || "");
  const [description, setDescription] = useState(show?.description || "");
  const [isPublished, setIsPublished] = useState(show?.is_published ?? false);
  const [showInMenu, setShowInMenu] = useState(show?.show_in_menu ?? false);
  const [saving, setSaving] = useState(false);

  const { data: images } = useShowImages(show?.id);

  const autoSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { title, slug: slug || autoSlug(title), year, subtitle: subtitle || null, description: description || null, is_published: isPublished, show_in_menu: showInMenu };
      if (show) {
        await updateShow.mutateAsync({ id: show.id, ...payload });
      } else {
        await createShow.mutateAsync(payload);
        onBack();
      }
    } finally {
      setSaving(false);
    }
  };

  const [uploading, setUploading] = useState(false);

  const handleMultipleUpload = async (files: File[]) => {
    if (!show || files.length === 0) return;
    setUploading(true);
    try {
      let order = images?.length || 0;
      for (const file of files) {
        const fileName = `${show.id}-${Date.now()}-${file.name}`;
        const url = await uploadImage.mutateAsync({ file, fileName });
        await addImage.mutateAsync({ show_id: show.id, image_url: url, display_order: order });
        order++;
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold">
          {show ? "Edit Show" : "New Show"}
        </h2>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>Title *</Label>
          <Input value={title} onChange={(e) => { setTitle(e.target.value); if (!show) setSlug(autoSlug(e.target.value)); }} placeholder="Exhibition title" />
        </div>
        <div className="grid gap-2">
          <Label>Slug</Label>
          <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="exhibition-title" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Year</Label>
            <Input value={year} onChange={(e) => setYear(e.target.value)} placeholder="2025" />
          </div>
          <div className="grid gap-2">
            <Label>Subtitle</Label>
            <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Optional subtitle" />
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" rows={3} />
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Switch checked={isPublished} onCheckedChange={setIsPublished} />
            <Label>Published</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={showInMenu} onCheckedChange={setShowInMenu} />
            <Label>Show in menu</Label>
          </div>
        </div>
      </div>

      <Button onClick={handleSave} disabled={!title || saving} className="w-full">
        {saving ? "Saving..." : show ? "Save Changes" : "Create Show"}
      </Button>

      {/* Image gallery (only for existing shows) */}
      {show && (
        <>
          <Separator />
          <div>
            <h3 className="text-lg font-medium mb-3">Gallery Images</h3>
            <label className="flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-6 cursor-pointer hover:bg-muted/50 transition-colors">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Click to upload images (multiple supported)</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => {
                if (e.target.files?.length) {
                  handleMultipleUpload(Array.from(e.target.files));
                  e.target.value = "";
                }
              }} />
            </label>
            {(uploading || uploadImage.isPending) && <p className="text-xs text-muted-foreground mt-2">Uploading...</p>}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
              {(images || []).map((img) => (
                <div key={img.id} className="relative group rounded-lg overflow-hidden border">
                  <img src={img.image_url} alt={img.alt_text || ""} className="w-full aspect-square object-cover" />
                  <button
                    onClick={() => deleteImage.mutate({ id: img.id, showId: show.id })}
                    className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ShowsManager;
