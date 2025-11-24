import TopArtworksTable from "./TopArtworksTable";
import ArtworkEngagementChart from "./ArtworkEngagementChart";
import ArtworkHeatmap from "./ArtworkHeatmap";
import ArtworkHeatmapViewer from "./ArtworkHeatmapViewer";

interface ArtworksAnalyticsProps {
  startDate: Date;
  endDate: Date;
}

const ArtworksAnalytics = ({ startDate, endDate }: ArtworksAnalyticsProps) => {
  return (
    <div className="space-y-6">
      <ArtworkHeatmap startDate={startDate} endDate={endDate} />
      <ArtworkHeatmapViewer />
      <TopArtworksTable startDate={startDate} endDate={endDate} />
      <ArtworkEngagementChart startDate={startDate} endDate={endDate} />
    </div>
  );
};

export default ArtworksAnalytics;
