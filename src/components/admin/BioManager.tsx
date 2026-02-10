import { useBioSettings, useUpdateBioSetting } from "@/hooks/useBioSettings";
import ImageUpload from "@/components/admin/ImageUpload";
import { Skeleton } from "@/components/ui/skeleton";

const BioManager = () => {
  const { data: settings, isLoading } = useBioSettings();
  const updateMutation = useUpdateBioSetting();

  const handleImageUpload = (url: string) => {
    updateMutation.mutate({ key: "bio_hero_image", value: url });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Bio</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Manage the hero image shown on the Bio page.
        </p>
      </div>

      <div className="max-w-xl">
        <ImageUpload
          label="Bio Hero Image"
          onUploadComplete={handleImageUpload}
          currentUrl={settings?.bio_hero_image || undefined}
        />
      </div>
    </div>
  );
};

export default BioManager;
