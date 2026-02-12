import { lazy, Suspense } from "react";
import { useBioSettings, useUpdateBioSetting } from "@/hooks/useBioSettings";
import ImageUpload from "@/components/admin/ImageUpload";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const BioTextEditor = lazy(() => import("@/components/admin/bio/BioTextEditor"));
const CvEntriesList = lazy(() => import("@/components/admin/bio/CvEntriesList"));
const CvEntryForm = lazy(() => import("@/components/admin/bio/CvEntryForm"));

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
          Manage the Bio page content: hero image, text, and CV entries.
        </p>
      </div>

      <Tabs defaultValue="text" className="w-full">
        <TabsList>
          <TabsTrigger value="text">Text</TabsTrigger>
          <TabsTrigger value="cv">CV</TabsTrigger>
          <TabsTrigger value="image">Hero Image</TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="mt-4">
          <Suspense fallback={<Skeleton className="h-48 w-full" />}>
            <BioTextEditor />
          </Suspense>
        </TabsContent>

        <TabsContent value="cv" className="mt-4 space-y-6">
          <Suspense fallback={<Skeleton className="h-48 w-full" />}>
            <CvEntryForm />
            <CvEntriesList />
          </Suspense>
        </TabsContent>

        <TabsContent value="image" className="mt-4">
          <div className="max-w-xl">
            <ImageUpload
              label="Bio Hero Image"
              onUploadComplete={handleImageUpload}
              currentUrl={settings?.bio_hero_image || undefined}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BioManager;
