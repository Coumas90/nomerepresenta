import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnalyticsOverview from "./AnalyticsOverview";
import ArtworksAnalytics from "./ArtworksAnalytics";
import SeriesAnalytics from "./SeriesAnalytics";
import SessionsAnalytics from "./SessionsAnalytics";

const AnalyticsDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground">
          Análisis completo del comportamiento de visitantes
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="artworks">Artworks</TabsTrigger>
          <TabsTrigger value="series">Series</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AnalyticsOverview />
        </TabsContent>

        <TabsContent value="artworks" className="space-y-6">
          <ArtworksAnalytics />
        </TabsContent>

        <TabsContent value="series" className="space-y-6">
          <SeriesAnalytics />
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <SessionsAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
