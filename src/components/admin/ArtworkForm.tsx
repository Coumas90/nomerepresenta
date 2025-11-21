import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateArtwork, useUpdateArtwork } from "@/hooks/useArtworkMutations";
import { useSeries } from "@/hooks/useSeries";
import { ArtworkData } from "@/hooks/useArtworks";
import ImageUpload from "./ImageUpload";
import MultipleImageUpload from "./MultipleImageUpload";

interface ArtworkFormProps {
  artwork?: ArtworkData;
  onSuccess?: () => void;
}

const ArtworkForm = ({ artwork, onSuccess }: ArtworkFormProps) => {
  const [formData, setFormData] = useState({
    title: artwork?.title || "",
    year: artwork?.year || "",
    dimensions: artwork?.dimensions || "",
    technique: artwork?.technique || "",
    materials: artwork?.materials || "",
    description: artwork?.description || "",
    image_url: artwork?.image_url || "",
    image_detail_url: artwork?.image_detail_url || "",
    series_id: artwork?.series_id || "",
    display_order: artwork?.display_order || 0,
  });

  const { data: seriesList } = useSeries();
  const createMutation = useCreateArtwork();
  const updateMutation = useUpdateArtwork();

  useEffect(() => {
    if (artwork) {
      setFormData({
        title: artwork.title,
        year: artwork.year,
        dimensions: artwork.dimensions,
        technique: artwork.technique,
        materials: artwork.materials,
        description: artwork.description,
        image_url: artwork.image_url,
        image_detail_url: artwork.image_detail_url,
        series_id: artwork.series_id,
        display_order: artwork.display_order,
      });
    }
  }, [artwork]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.image_url || !formData.image_detail_url) {
      alert("Please upload both images before submitting");
      return;
    }

    if (artwork) {
      await updateMutation.mutateAsync({ id: artwork.id, ...formData });
    } else {
      await createMutation.mutateAsync(formData);
    }

    if (onSuccess) {
      onSuccess();
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{artwork ? "Edit Artwork" : "Create New Artwork"}</CardTitle>
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
              <Label htmlFor="year">Year *</Label>
              <Input
                id="year"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dimensions">Dimensions *</Label>
              <Input
                id="dimensions"
                value={formData.dimensions}
                onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                placeholder="e.g., 120 x 100 cm"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="technique">Technique *</Label>
              <Input
                id="technique"
                value={formData.technique}
                onChange={(e) => setFormData({ ...formData, technique: e.target.value })}
                required
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

            <div className="space-y-2">
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="materials">Materials *</Label>
            <Input
              id="materials"
              value={formData.materials}
              onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ImageUpload
              label="Main Image *"
              onUploadComplete={(url) => setFormData({ ...formData, image_url: url })}
              currentUrl={formData.image_url}
            />

            <ImageUpload
              label="Detail Image *"
              onUploadComplete={(url) => setFormData({ ...formData, image_detail_url: url })}
              currentUrl={formData.image_detail_url}
            />
          </div>

          {artwork && (
            <div className="col-span-full">
              <MultipleImageUpload artworkId={artwork.id} />
            </div>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Saving..." : artwork ? "Update Artwork" : "Create Artwork"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ArtworkForm;
