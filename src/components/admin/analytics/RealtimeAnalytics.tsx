import { useRealtimeAnalytics } from "@/hooks/useRealtimeAnalytics";
import LiveSessionsPanel from "./LiveSessionsPanel";
import LiveArtworkViews from "./LiveArtworkViews";
import LiveActivityFeed from "./LiveActivityFeed";

const RealtimeAnalytics = () => {
  const {
    activeSessions,
    recentArtworkViews,
    liveActivity,
    onlineCount
  } = useRealtimeAnalytics();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
        <h2 className="text-2xl font-bold">Real-Time Analytics</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <LiveSessionsPanel 
            sessions={activeSessions} 
            onlineCount={onlineCount} 
          />
        </div>

        <div className="md:col-span-2 space-y-6">
          <LiveArtworkViews artworkViews={recentArtworkViews} />
          <LiveActivityFeed activities={liveActivity} />
        </div>
      </div>
    </div>
  );
};

export default RealtimeAnalytics;
