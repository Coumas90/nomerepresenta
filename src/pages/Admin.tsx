import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { artworks } from "@/data/artworks";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isMigrating, setIsMigrating] = useState(false);
  const [progress, setProgress] = useState("");

  const uploadImageToStorage = async (imagePath: string, fileName: string): Promise<string> => {
    try {
      // Fetch the local image
      const response = await fetch(imagePath);
      const blob = await response.blob();
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("artwork-images")
        .upload(fileName, blob, {
          contentType: blob.type,
          upsert: true,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("artwork-images")
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error(`Error uploading ${fileName}:`, error);
      throw error;
    }
  };

  const migrateData = async () => {
    setIsMigrating(true);
    setProgress("Starting migration...");

    try {
      // First, create a series for the artworks
      setProgress("Creating series...");
      const { data: seriesData, error: seriesError } = await supabase
        .from("series")
        .insert({
          name: "TRI-PEEL",
          description: "A series exploring the intersection of geometric forms and organic textures through mixed media.",
          display_order: 0,
        })
        .select()
        .single();

      if (seriesError) throw seriesError;

      const seriesId = seriesData.id;
      setProgress(`Series created with ID: ${seriesId}`);

      // Migrate each artwork
      for (let i = 0; i < artworks.length; i++) {
        const artwork = artworks[i];
        setProgress(`Migrating ${artwork.title} (${i + 1}/${artworks.length})...`);

        // Upload main image
        const mainImageFileName = `artwork-${artwork.id}-main.${artwork.image.split('.').pop()}`;
        const mainImageUrl = await uploadImageToStorage(artwork.image, mainImageFileName);

        // Upload detail image
        const detailImageFileName = `artwork-${artwork.id}-detail.${artwork.imageDetail.split('.').pop()}`;
        const detailImageUrl = await uploadImageToStorage(artwork.imageDetail, detailImageFileName);

        // Insert artwork data
        const { error: artworkError } = await supabase
          .from("artworks")
          .insert({
            title: artwork.title,
            year: artwork.year,
            dimensions: artwork.dimensions,
            technique: artwork.technique,
            materials: artwork.materials,
            description: artwork.description,
            image_url: mainImageUrl,
            image_detail_url: detailImageUrl,
            series_id: seriesId,
            display_order: i,
          });

        if (artworkError) throw artworkError;

        setProgress(`✓ ${artwork.title} migrated successfully`);
      }

      toast({
        title: "Migration Complete",
        description: `Successfully migrated ${artworks.length} artworks to Supabase.`,
      });

      setProgress("Migration completed! You can now view your artworks.");
      
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Migration error:", error);
      toast({
        title: "Migration Failed",
        description: error instanceof Error ? error.message : "An error occurred during migration",
        variant: "destructive",
      });
      setProgress("Migration failed. Check console for details.");
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container max-w-4xl mx-auto">
        <Button
          onClick={() => navigate("/")}
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Migration Tool
            </CardTitle>
            <CardDescription>
              Migrate local artwork data and images to Supabase Storage and Database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="rounded-lg border p-4 bg-muted/50">
                <h3 className="font-semibold mb-2">What this will do:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Upload className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Upload {artworks.length} artwork images to Supabase Storage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Database className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Create the TRI-PEEL series in the database</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Database className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Insert all artwork data into the database</span>
                  </li>
                </ul>
              </div>

              {progress && (
                <div className="rounded-lg border p-4 bg-primary/5 min-h-[100px]">
                  <p className="text-sm font-mono whitespace-pre-line">{progress}</p>
                </div>
              )}

              <Button
                onClick={migrateData}
                disabled={isMigrating}
                className="w-full"
                size="lg"
              >
                {isMigrating ? "Migrating..." : "Start Migration"}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Note: This process may take a few minutes depending on your connection speed.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
