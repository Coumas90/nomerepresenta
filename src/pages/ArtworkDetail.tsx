import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import { artworks } from "@/data/artworks";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
const ArtworkDetail = () => {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const artwork = artworks.find(art => art.id === Number(id));
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  if (!artwork) {
    return <>
        <Header />
        <main className="min-h-screen bg-background pt-20">
          <div className="container mx-auto px-6 py-16">
            <h1 className="text-4xl font-bold mb-8">Artwork not found</h1>
            <Button onClick={() => navigate("/")} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Works
            </Button>
          </div>
        </main>
      </>;
  }
  return <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="fixed top-20 right-6 z-50 pt-4">
          <Button onClick={() => navigate("/#works")} variant="ghost" className="uppercase tracking-wider text-sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            BACK
          </Button>
        </div>

        <div className="container mx-auto px-8 lg:px-16 pt-32 pb-24 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Column - Text */}
            <div className="flex flex-col justify-center space-y-4 lg:pl-16 pt-12">
              <div>
                <h1 className="text-5xl font-bold tracking-tight uppercase mb-2 leading-tight lg:text-4xl">
                  {artwork.title}
                </h1>
                <p className="text-base uppercase tracking-widest font-semibold">
                  {artwork.year}
                </p>
              </div>

              <div className="text-xs uppercase tracking-widest leading-loose space-y-0.5 font-medium">
                <p>{artwork.materials}</p>
                <p>{artwork.dimensions}</p>
              </div>
            </div>

            {/* Right Column - Image */}
            <div className="flex items-center justify-center lg:justify-start">
              <div className="w-full max-w-xl">
                <img src={artwork.imageDetail} alt={artwork.title} loading="lazy" decoding="async" className="w-full h-auto object-contain" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>;
};
export default ArtworkDetail;