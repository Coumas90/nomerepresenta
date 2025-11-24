import { useArtworkRecommendations } from '@/hooks/useArtworkRecommendations';
import { useArtworks } from '@/hooks/useArtworks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const ArtworkRecommendations = () => {
  const { data: recommendations, isLoading: loadingRecs } = useArtworkRecommendations();
  const { data: artworks, isLoading: loadingArtworks } = useArtworks();

  if (loadingRecs || loadingArtworks) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>Recommended For You</CardTitle>
          </div>
          <CardDescription>AI-powered suggestions based on your viewing patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-20 w-20 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  const recommendedArtworks = recommendations
    .map(rec => {
      const artwork = artworks?.find(a => a.id === rec.artworkId);
      return artwork ? { ...artwork, reason: rec.reason } : null;
    })
    .filter(Boolean);

  if (recommendedArtworks.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle>Recommended For You</CardTitle>
        </div>
        <CardDescription>AI-powered suggestions based on your viewing patterns</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendedArtworks.map((artwork) => (
            <Link
              key={artwork.id}
              to={`/works/${artwork.id}`}
              className="flex gap-4 p-3 rounded-lg hover:bg-accent transition-colors"
            >
              <img
                src={artwork.image_url}
                alt={artwork.title}
                className="h-20 w-20 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">{artwork.title}</h3>
                <p className="text-sm text-muted-foreground">{artwork.reason}</p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ArtworkRecommendations;
