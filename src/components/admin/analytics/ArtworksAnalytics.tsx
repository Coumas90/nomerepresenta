import TopArtworksTable from "./TopArtworksTable";
import ArtworkEngagementChart from "./ArtworkEngagementChart";

interface ArtworksAnalyticsProps {
  startDate: Date;
  endDate: Date;
}

const ArtworksAnalytics = ({ startDate, endDate }: ArtworksAnalyticsProps) => {
  return (
    <div className="space-y-6">
      <TopArtworksTable startDate={startDate} endDate={endDate} />
      <ArtworkEngagementChart startDate={startDate} endDate={endDate} />
    </div>
  );
};

export default ArtworksAnalytics;
