import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateArtwork, useUpdateArtwork } from "@/hooks/useArtworkMutations";
import { useSeries } from "@/hooks/useSeries";
import type { ArtworkData } from "@/types";
import MultipleImageUpload from "./MultipleImageUpload";
import { toast } from "sonner";
import { useArtworkImages } from "@/hooks/useArtworkImages";

interface ArtworkFormProps {
  artwork?: ArtworkData;
  preselectedSeriesId?: string;
  onSuccess?: (artworkId?: string) => void;
}

const ArtworkForm = ({ artwork, preselectedSeriesId, onSuccess }: ArtworkFormProps) => {
  const [formData, setFormData] = useState({
    title: artwork?.title || "",
    year: artwork?.year || "",
    dimensions: artwork?.dimensions || "",
    materials: artwork?.materials || "",
    description: artwork?.description || "",
    series_id: artwork?.series_id || preselectedSeriesId || "",
    display_order: artwork?.display_order || 0,
  });

  // Track if artwork was just created (to show gallery immediately)
  const [createdArtworkId, setCreatedArtworkId] = useState<string | undefined>(artwork?.id);
  const artworkId = createdArtworkId || artwork?.id;

  const { data: seriesList } = useSeries();
  const { data: artworkImages } = useArtworkImages(artworkId);
  const createMutation = useCreateArtwork();
  const updateMutation = useUpdateArtwork();

  useEffect(() => {
    if (artwork) {
      setFormData({
        title: artwork.title,
        year: artwork.year,
        dimensions: artwork.dimensions,
        materials: artwork.materials,
        description: artwork.description,
        series_id: artwork.series_id,
        display_order: artwork.display_order,
      });
      setCreatedArtworkId(artwork.id);
    } else if (preselectedSeriesId) {
      setFormData(prev => ({
        ...prev,
        series_id: preselectedSeriesId,
      }));
    }
  }, [artwork, preselectedSeriesId]);

  // Sync image_url and image_detail_url from gallery images
  const syncImageUrls = () => {
    if (!artworkId || !artworkImages?.length) return;
    
    const mainImage = artworkImages.find(img => img.is_main) || artworkImages[0];
    const detailImage = artworkImages.find(img => img.is_detail);
    
    const updates: Partial<ArtworkData> & { id: string } = {
      id: artworkId,
      image_url: mainImage?.image_url || "",
    };
    if (detailImage) {
      updates.image_detail_url = detailImage.image_url;
    }
    
    updateMutation.mutate(updates);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // For new artworks, create with a placeholder image_url first
    // Gallery images will be added after creation
    try {
      if (artwork || createdArtworkId) {
        const id = artwork?.id || createdArtworkId!;
        // Get main image from gallery
        const mainImage = artworkImages?.find(img => img.is_main) || artworkImages?.[0];
        const detailImage = artworkImages?.find(img => img.is_detail);
        
        await updateMutation.mutateAsync({ 
          id, 
          ...formData,
          image_url: mainImage?.image_url || artwork?.image_url || "",
          image_detail_url: detailImage?.image_url || artwork?.image_detail_url || "",
        });
        if (onSuccess) onSuccess();
      } else {
        // Create new artwork - need at least a title and series
        if (!formData.title || !formData.series_id) {
          toast.error("Title and Series are required");
          return;
        }
        const newArtwork = await createMutation.mutateAsync({
          ...formData,
          image_url: "placeholder", // Will be updated when images are added
          image_detail_url: "",
        });
        if (newArtwork?.id) {
          setCreatedArtworkId(newArtwork.id);
          toast.success("Artwork created! Now add images below.");
        }
      }
    } catch (error) {
      console.error("Error submitting artwork:", error);
      toast.error("Error al guardar la obra. Por favor intenta de nuevo.");
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isEditing = !!(artwork || createdArtworkId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{artwork ? "Edit Artwork" : createdArtworkId ? "Edit New Artwork" : "Create New Artwork"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dimensions">Dimensions</Label>
              <Input
                id="dimensions"
                value={formData.dimensions}
                onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                placeholder="e.g., 120 x 100 cm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="series">Series *</Label>
              <Select
                value={formData.series_id}
                onValueChange={(value) => setFormData({ ...formData, series_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a series" />
                </SelectTrigger>
                <SelectContent>
                  {seriesList?.map((series) => (
                    <SelectItem key={series.id} value={series.id}>
                      {series.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isEditing && (
              <div className="space-y-2">
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="materials">Materials</Label>
            <Input
              id="materials"
              value={formData.materials}
              onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="Optional description of the artwork"
            />
          </div>

          {/* Image Gallery */}
          {artworkId ? (
            <MultipleImageUpload 
              artworkId={artworkId} 
              artworkData={formData}
              onImagesChange={syncImageUrls}
            />
          ) : (
            <div className="border-2 border-dashed rounded-lg p-8 text-center bg-muted/50">
              <p className="text-sm text-muted-foreground">
                Save the artwork first to start uploading images
              </p>
            </div>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Saving..." : isEditing ? "Update Artwork" : "Create Artwork"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ArtworkForm;
