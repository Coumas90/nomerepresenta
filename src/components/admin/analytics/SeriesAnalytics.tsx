import SeriesHeatmap from "./SeriesHeatmap";

interface SeriesAnalyticsProps {
  startDate: Date;
  endDate: Date;
}

const SeriesAnalytics = ({ startDate, endDate }: SeriesAnalyticsProps) => {
  return (
    <div className="space-y-6">
      <SeriesHeatmap startDate={startDate} endDate={endDate} />
    </div>
  );
};

export default SeriesAnalytics;
