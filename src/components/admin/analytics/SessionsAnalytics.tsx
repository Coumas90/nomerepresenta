import RecentSessionsTable from "./RecentSessionsTable";

interface SessionsAnalyticsProps {
  startDate: Date;
  endDate: Date;
}

const SessionsAnalytics = ({ startDate, endDate }: SessionsAnalyticsProps) => {
  return (
    <div className="space-y-6">
      <RecentSessionsTable startDate={startDate} endDate={endDate} />
    </div>
  );
};

export default SessionsAnalytics;
