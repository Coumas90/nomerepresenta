import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Eye, Globe, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { LiveActivity } from "@/hooks/useRealtimeAnalytics";

interface LiveActivityFeedProps {
  activities: LiveActivity[];
}

const LiveActivityFeed = ({ activities }: LiveActivityFeedProps) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'session':
        return <User className="h-4 w-4" />;
      case 'artwork_view':
        return <Eye className="h-4 w-4" />;
      case 'page_view':
        return <Globe className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const getActivityDescription = (activity: LiveActivity) => {
    switch (activity.type) {
      case 'session':
        return (
          <div>
            <span className="font-medium">New visitor</span>
            {activity.data.city && activity.data.country_name && (
              <span className="text-muted-foreground"> from {activity.data.city}, {activity.data.country_name}</span>
            )}
            {activity.data.device_type && (
              <Badge variant="outline" className="ml-2 text-xs">
                {activity.data.device_type}
              </Badge>
            )}
          </div>
        );
      case 'artwork_view':
        return (
          <div>
            <span className="text-muted-foreground">Viewing </span>
            <span className="font-medium">{activity.data.artwork?.title || 'artwork'}</span>
            {activity.data.artwork?.series?.name && (
              <span className="text-muted-foreground"> ({activity.data.artwork.series.name})</span>
            )}
          </div>
        );
      case 'page_view':
        return (
          <div>
            <span className="text-muted-foreground">Visited </span>
            <span className="font-medium">{activity.data.page_name || activity.data.page_path}</span>
          </div>
        );
      default:
        return <span>Activity</span>;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'session':
        return 'text-green-500';
      case 'artwork_view':
        return 'text-blue-500';
      case 'page_view':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Live Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Waiting for activity...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Live Activity Feed
        </CardTitle>
        <p className="text-sm text-muted-foreground">Real-time visitor interactions</p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                <div className={`mt-1 ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm">{getActivityDescription(activity)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default LiveActivityFeed;
