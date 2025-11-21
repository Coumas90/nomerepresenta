import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, LogOut, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ArtworkData } from "@/hooks/useArtworks";
import ArtworkForm from "@/components/admin/ArtworkForm";
import ArtworksList from "@/components/admin/ArtworksList";
import SeriesManager from "@/components/admin/SeriesManager";

const Admin = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [editingArtwork, setEditingArtwork] = useState<ArtworkData | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [preselectedSeriesId, setPreselectedSeriesId] = useState<string | undefined>(undefined);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleEdit = (artwork: ArtworkData) => {
    setEditingArtwork(artwork);
    setShowForm(true);
  };

  const handleCreateNew = () => {
    setEditingArtwork(undefined);
    setPreselectedSeriesId(undefined);
    setShowForm(true);
  };

  const handleCreateInSeries = (seriesId: string) => {
    setEditingArtwork(undefined);
    setPreselectedSeriesId(seriesId);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingArtwork(undefined);
    setPreselectedSeriesId(undefined);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate("/")} variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="artworks" className="space-y-6">
          <TabsList>
            <TabsTrigger value="series">Series</TabsTrigger>
            <TabsTrigger value="artworks">Artworks</TabsTrigger>
          </TabsList>

          <TabsContent value="series">
            <SeriesManager />
          </TabsContent>

          <TabsContent value="artworks" className="space-y-6">
            {showForm ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">
                    {editingArtwork ? "Edit Artwork" : "Create New Artwork"}
                  </h2>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowForm(false);
                      setEditingArtwork(undefined);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
                <ArtworkForm 
                  artwork={editingArtwork} 
                  preselectedSeriesId={preselectedSeriesId}
                  onSuccess={handleFormSuccess} 
                />
              </div>
            ) : (
              <Button onClick={handleCreateNew} variant="default" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                New Artwork
              </Button>
            )}

            <ArtworksList onEdit={handleEdit} onCreateInSeries={handleCreateInSeries} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
