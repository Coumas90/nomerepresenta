import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, GripVertical, Star } from "lucide-react";
import { useUploadImage } from "@/hooks/useArtworkMutations";
import { useArtworkImages, useAddArtworkImage, useDeleteArtworkImage, useUpdateImageOrder, useSetMainImage } from "@/hooks/useArtworkImages";
import { Card } from "@/components/ui/card";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface MultipleImageUploadProps {
  artworkId?: string;
  onImagesChange?: () => void;
}

interface SortableImageProps {
  image: any;
  index: number;
  onDelete: (id: string) => void;
  onSetMain: (id: string) => void;
}

const SortableImage = ({ image, index, onDelete, onSetMain }: SortableImageProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="relative group overflow-hidden">
      <div className="absolute top-2 left-2 z-10 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
        <div className="bg-background/80 p-1 rounded">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <img
        src={image.image_url}
        alt={`Artwork image ${index + 1}`}
        className="w-full h-40 object-cover"
      />
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <Button
          type="button"
          variant={image.is_main ? "default" : "secondary"}
          size="icon"
          className="h-8 w-8"
          onClick={() => onSetMain(image.id)}
          title="Marcar como principal"
        >
          <Star className={`h-4 w-4 ${image.is_main ? 'fill-current' : ''}`} />
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="h-8 w-8"
          onClick={() => onDelete(image.id)}
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
  );
};

const MultipleImageUpload = ({ artworkId, onImagesChange }: MultipleImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const uploadMutation = useUploadImage();
  const addImageMutation = useAddArtworkImage();
  const deleteImageMutation = useDeleteArtworkImage();
  const updateOrderMutation = useUpdateImageOrder();
  const setMainImageMutation = useSetMainImage();
  const { data: images, isLoading } = useArtworkImages(artworkId);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const processFiles = async (files: FileList) => {
    if (!files || !artworkId) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        
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
    } catch (error) {
      console.error("Error uploading images:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      await processFiles(files);
      e.target.value = "";
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processFiles(files);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!artworkId) return;
    await deleteImageMutation.mutateAsync({ id: imageId, artwork_id: artworkId });
    if (onImagesChange) onImagesChange();
  };

  const handleSetMain = async (imageId: string) => {
    if (!artworkId) return;
    await setMainImageMutation.mutateAsync({ imageId, artworkId });
    if (onImagesChange) onImagesChange();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !images || !artworkId) return;

    const oldIndex = images.findIndex((img) => img.id === active.id);
    const newIndex = images.findIndex((img) => img.id === over.id);

    const reorderedImages = arrayMove(images, oldIndex, newIndex);
    
    const updates = reorderedImages.map((img, index) => ({
      id: img.id,
      display_order: index + 1,
      artwork_id: artworkId,
    }));

    await updateOrderMutation.mutateAsync(updates);
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

      {/* Drag & Drop Zone - visible cuando hay imágenes */}
      {images && images.length > 0 && (
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
            isDragOver
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Upload className={`h-6 w-6 mx-auto mb-1 transition-colors ${
            isDragOver ? 'text-primary' : 'text-muted-foreground'
          }`} />
          <p className="text-sm text-muted-foreground">
            {isDragOver ? 'Suelta las imágenes aquí' : 'Arrastra imágenes aquí o usa el botón de arriba'}
          </p>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando imágenes...</p>
      ) : images && images.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={images.map((img) => img.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((image, index) => (
                <SortableImage
                  key={image.id}
                  image={image}
                  index={index}
                  onDelete={handleDelete}
                  onSetMain={handleSetMain}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Upload className={`h-8 w-8 mx-auto mb-2 transition-colors ${
            isDragOver ? 'text-primary' : 'text-muted-foreground'
          }`} />
          <p className="text-sm text-muted-foreground">
            {isDragOver ? 'Suelta las imágenes aquí' : 'Arrastra imágenes aquí o haz clic en "Agregar Imágenes"'}
          </p>
        </div>
      )}
    </div>
  );
};

export default MultipleImageUpload;
