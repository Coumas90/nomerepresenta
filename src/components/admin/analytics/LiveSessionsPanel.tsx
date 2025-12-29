import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Globe, Smartphone, Monitor, Tablet } from "lucide-react";
import type { LiveSession } from "@/types";

interface LiveSessionsPanelProps {
  sessions: LiveSession[];
  onlineCount: number;
}

const LiveSessionsPanel = ({ sessions, onlineCount }: LiveSessionsPanelProps) => {
  const getDeviceIcon = (deviceType: string | null) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      case 'desktop':
        return <Monitor className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const deviceCounts = sessions.reduce((acc, session) => {
    const device = session.device_type || 'unknown';
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const locationCounts = sessions.reduce((acc, session) => {
    if (session.country_name) {
      acc[session.country_name] = (acc[session.country_name] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topLocations = Object.entries(locationCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Online Count Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
            Online Now
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{onlineCount}</div>
          <p className="text-sm text-muted-foreground mt-1">
            Active visitors in the last 5 minutes
          </p>
        </CardContent>
      </Card>

      {/* Device Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Active Devices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(deviceCounts).map(([device, count]) => (
              <div key={device} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getDeviceIcon(device)}
                  <span className="capitalize">{device}</span>
                </div>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Locations */}
      {topLocations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Top Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topLocations.map(([country, count]) => (
                <div key={country} className="flex items-center justify-between">
                  <span>{country}</span>
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-2 bg-primary rounded-full" 
                      style={{ width: `${(count / sessions.length) * 100}px` }}
                    />
                    <span className="font-semibold w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LiveSessionsPanel;
