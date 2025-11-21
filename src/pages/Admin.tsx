import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ArtworkData } from "@/hooks/useArtworks";
import ArtworkForm from "@/components/admin/ArtworkForm";
import ArtworksList from "@/components/admin/ArtworksList";

const Admin = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [editingArtwork, setEditingArtwork] = useState<ArtworkData | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);

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
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingArtwork(undefined);
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
          <div className="flex items-center gap-2">
            <Button onClick={handleCreateNew} variant="default">
              <Plus className="mr-2 h-4 w-4" />
              New Artwork
            </Button>
            <Button onClick={handleSignOut} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {showForm && (
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
              <ArtworkForm artwork={editingArtwork} onSuccess={handleFormSuccess} />
            </div>
          )}

          <ArtworksList onEdit={handleEdit} />
        </div>
      </div>
    </div>
  );
};

export default Admin;
