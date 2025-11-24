import TopArtworksTable from "./TopArtworksTable";
import ArtworkEngagementChart from "./ArtworkEngagementChart";

const ArtworksAnalytics = () => {
  return (
    <div className="space-y-6">
      <TopArtworksTable />
      <ArtworkEngagementChart />
    </div>
  );
};

export default ArtworksAnalytics;
