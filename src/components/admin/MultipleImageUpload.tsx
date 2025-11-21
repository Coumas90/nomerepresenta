import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { useUploadImage } from "@/hooks/useArtworkMutations";
import { useArtworkImages, useAddArtworkImage, useDeleteArtworkImage } from "@/hooks/useArtworkImages";
import { Card } from "@/components/ui/card";

interface MultipleImageUploadProps {
  artworkId?: string;
  onImagesChange?: () => void;
}

const MultipleImageUpload = ({ artworkId, onImagesChange }: MultipleImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const uploadMutation = useUploadImage();
  const addImageMutation = useAddArtworkImage();
  const deleteImageMutation = useDeleteArtworkImage();
  const { data: images, isLoading } = useArtworkImages(artworkId);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !artworkId) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = `${Date.now()}-${file.name}`;
        const url = await uploadMutation.mutateAsync({ file, fileName });
        
        await addImageMutation.mutateAsync({
          artwork_id: artworkId,
          image_url: url,
          display_order: (images?.length || 0) + i + 1,
          is_main: (images?.length || 0) === 0 && i === 0,
        });
      }
      
      if (onImagesChange) onImagesChange();
      e.target.value = "";
    } catch (error) {
      console.error("Error uploading images:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!artworkId) return;
    await deleteImageMutation.mutateAsync({ id: imageId, artwork_id: artworkId });
    if (onImagesChange) onImagesChange();
  };

  if (!artworkId) {
    return (
      <div className="space-y-2">
        <Label>Galería de Imágenes</Label>
        <div className="border-2 border-dashed rounded-lg p-8 text-center bg-muted/50">
          <p className="text-sm text-muted-foreground">
            Guarda la obra primero para poder subir imágenes
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Galería de Imágenes ({images?.length || 0})</Label>
        <div>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="multiple-upload"
            disabled={uploading}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById("multiple-upload")?.click()}
            disabled={uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "Subiendo..." : "Agregar Imágenes"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando imágenes...</p>
      ) : images && images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <Card key={image.id} className="relative group overflow-hidden">
              <img
                src={image.image_url}
                alt={`Artwork image ${index + 1}`}
                className="w-full h-40 object-cover"
              />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleDelete(image.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {image.is_main && (
                <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                  Principal
                </div>
              )}
              <div className="absolute bottom-2 right-2 bg-background/80 text-xs px-2 py-1 rounded">
                #{image.display_order}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No hay imágenes aún. Haz clic en "Agregar Imágenes" para subir.
          </p>
        </div>
      )}
    </div>
  );
};

export default MultipleImageUpload;
