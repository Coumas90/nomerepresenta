import { useState, lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { ArtworkData } from "@/types";
import ArtworkForm from "@/components/admin/ArtworkForm";
import SeriesManager from "@/components/admin/SeriesManager";
import StudioImagesManager from "@/components/admin/StudioImagesManager";
import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import { DashboardHome } from "@/components/admin/DashboardHome";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { ImageCompressionSettings } from "@/components/admin/settings/ImageCompressionSettings";

const BioManager = lazy(() => import("@/components/admin/BioManager"));
const UnifiedAnalytics = lazy(() => import("@/components/admin/analytics/UnifiedAnalytics"));
const PricelistManager = lazy(() => import("@/components/admin/PricelistManager"));
const CatalogManager = lazy(() => import("@/components/admin/catalog/CatalogManager"));
const ShowsManager = lazy(() => import("@/components/admin/ShowsManager"));
const WorksBlockManager = lazy(() => import("@/components/admin/works/WorksBlockManager"));
const SoldManager = lazy(() => import("@/components/admin/sold/SoldManager"));

const Admin = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const section = params.get("section") || "dashboard";

  // Catalog artwork creation/editing state
  const [editingArtwork, setEditingArtwork] = useState<ArtworkData | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [preselectedSeriesId, setPreselectedSeriesId] = useState<string | undefined>(undefined);

  const handleEdit = (artwork: ArtworkData) => {
    setEditingArtwork(artwork);
    setShowForm(true);
  };

  const handleCreateNew = () => {
    setEditingArtwork(undefined);
    setPreselectedSeriesId(undefined);
    setShowForm(true);
  };

  const handleFormSuccess = async (newArtworkId?: string) => {
    if (newArtworkId) {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data } = await supabase
        .from("artworks")
        .select("*")
        .eq("id", newArtworkId)
        .single();
      
      if (data) {
        setEditingArtwork(data as ArtworkData);
        setPreselectedSeriesId(undefined);
        import("@/hooks/use-toast").then(({ toast }) => {
          toast({
            title: "Artwork created",
            description: "You can now add more images to the gallery",
          });
        });
      }
    } else {
      setShowForm(false);
      setEditingArtwork(undefined);
      setPreselectedSeriesId(undefined);
    }
  };

  const renderContent = () => {
    switch (section) {
      case "dashboard":
        return <DashboardHome />;
      
      case "analytics":
        return (
          <Suspense fallback={<LoadingSkeleton type="analytics" />}>
            <UnifiedAnalytics />
          </Suspense>
        );
      
      case "content-series":
        return <SeriesManager />;
      
      case "content-studio":
        return <StudioImagesManager />;
      
      case "content-bio":
        return (
          <Suspense fallback={<LoadingSkeleton type="analytics" />}>
            <BioManager />
          </Suspense>
        );
      
      case "content-pricelist":
        return (
          <Suspense fallback={<LoadingSkeleton type="analytics" />}>
            <PricelistManager />
          </Suspense>
        );
      
      case "content-catalog":
        return (
          <Suspense fallback={<LoadingSkeleton type="analytics" />}>
            <div className="space-y-6">
              {showForm ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">
                      {editingArtwork ? "Edit Artwork" : "Create New Artwork"}
                    </h2>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowForm(false);
                        setEditingArtwork(undefined);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                  <ArtworkForm 
                    artwork={editingArtwork} 
                    preselectedSeriesId={preselectedSeriesId}
                    onSuccess={handleFormSuccess} 
                  />
                </div>
              ) : (
                <Button onClick={handleCreateNew} variant="default" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  New Artwork
                </Button>
              )}
              <CatalogManager onEdit={handleEdit} />
            </div>
          </Suspense>
        );
      
      case "content-works":
        return (
          <Suspense fallback={<LoadingSkeleton type="analytics" />}>
            <WorksBlockManager />
          </Suspense>
        );
      
      case "content-shows":
        return (
          <Suspense fallback={<LoadingSkeleton type="analytics" />}>
            <ShowsManager />
          </Suspense>
        );
      
      case "content-sold":
        return (
          <Suspense fallback={<LoadingSkeleton type="analytics" />}>
            <SoldManager />
          </Suspense>
        );
      
      case "settings-compression":
        return <ImageCompressionSettings />;
      
      default:
        return <DashboardHome />;
    }
  };

  return (
    <AdminLayout>
      {renderContent()}
    </AdminLayout>
  );
};

export default Admin;
