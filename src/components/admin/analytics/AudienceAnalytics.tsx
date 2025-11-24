import GeographicDistribution from "./GeographicDistribution";
import DeviceDistribution from "./DeviceDistribution";
import TrafficSources from "./TrafficSources";
import VisitorPatterns from "./VisitorPatterns";

interface AudienceAnalyticsProps {
  startDate: Date;
  endDate: Date;
}

const AudienceAnalytics = ({ startDate, endDate }: AudienceAnalyticsProps) => {
  return (
    <div className="space-y-6">
      <GeographicDistribution startDate={startDate} endDate={endDate} />
      
      <div className="grid gap-6 md:grid-cols-2">
        <DeviceDistribution startDate={startDate} endDate={endDate} />
        <TrafficSources startDate={startDate} endDate={endDate} />
      </div>

      <VisitorPatterns startDate={startDate} endDate={endDate} />
    </div>
  );
};

export default AudienceAnalytics;
