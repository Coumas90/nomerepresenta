import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ArtworkData } from "@/hooks/useArtworks";
import ArtworkForm from "@/components/admin/ArtworkForm";
import ArtworksList from "@/components/admin/ArtworksList";
import SeriesManager from "@/components/admin/SeriesManager";
import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import { DashboardHome } from "@/components/admin/DashboardHome";
import RealtimeAnalytics from "@/components/admin/analytics/RealtimeAnalytics";
import AnalyticsOverview from "@/components/admin/analytics/AnalyticsOverview";
import ArtworksAnalytics from "@/components/admin/analytics/ArtworksAnalytics";
import SeriesAnalytics from "@/components/admin/analytics/SeriesAnalytics";
import AudienceAnalytics from "@/components/admin/analytics/AudienceAnalytics";
import SessionsAnalytics from "@/components/admin/analytics/SessionsAnalytics";
import { DateRange } from "react-day-picker";

const Admin = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const section = params.get("section") || "dashboard";

  const [editingArtwork, setEditingArtwork] = useState<ArtworkData | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [preselectedSeriesId, setPreselectedSeriesId] = useState<string | undefined>(undefined);
  const [presetDays, setPresetDays] = useState(30);
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(undefined);

  const getDateRange = (): { startDate: Date; endDate: Date } => {
    if (customDateRange?.from && customDateRange?.to) {
      return {
        startDate: customDateRange.from,
        endDate: customDateRange.to,
      };
    }
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - presetDays);
    
    return { startDate, endDate };
  };

  const { startDate, endDate } = getDateRange();

  const handleEdit = (artwork: ArtworkData) => {
    setEditingArtwork(artwork);
    setShowForm(true);
  };

  const handleCreateNew = () => {
    setEditingArtwork(undefined);
    setPreselectedSeriesId(undefined);
    setShowForm(true);
  };

  const handleCreateInSeries = (seriesId: string) => {
    setEditingArtwork(undefined);
    setPreselectedSeriesId(seriesId);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingArtwork(undefined);
    setPreselectedSeriesId(undefined);
  };

  const renderContent = () => {
    switch (section) {
      case "dashboard":
        return <DashboardHome />;
      
      case "analytics-live":
        return <RealtimeAnalytics />;
      
      case "analytics-overview":
        return <AnalyticsOverview startDate={startDate} endDate={endDate} />;
      
      case "analytics-artworks":
        return <ArtworksAnalytics startDate={startDate} endDate={endDate} />;
      
      case "analytics-series":
        return <SeriesAnalytics startDate={startDate} endDate={endDate} />;
      
      case "analytics-audience":
        return <AudienceAnalytics startDate={startDate} endDate={endDate} />;
      
      case "analytics-sessions":
        return <SessionsAnalytics startDate={startDate} endDate={endDate} />;
      
      case "content-series":
        return <SeriesManager />;
      
      case "content-artworks":
        return (
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
            <ArtworksList onEdit={handleEdit} onCreateInSeries={handleCreateInSeries} />
          </div>
        );
      
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
