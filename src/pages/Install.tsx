import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  const features = [
    "Works offline - view artworks anytime",
    "Faster loading times",
    "Native app-like experience",
    "Direct home screen access",
    "Automatic updates",
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            {isInstalled ? (
              <Check className="h-8 w-8 text-primary" />
            ) : (
              <Smartphone className="h-8 w-8 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {isInstalled ? "App Installed!" : "Install Ivan Comas"}
          </CardTitle>
          <CardDescription>
            {isInstalled
              ? "You can now access the app from your home screen"
              : "Get the full experience with our progressive web app"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isInstalled && (
            <>
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Features:</h3>
                <ul className="space-y-2">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {isInstallable ? (
                <Button onClick={handleInstallClick} className="w-full" size="lg">
                  <Download className="mr-2 h-5 w-5" />
                  Install App
                </Button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground text-center">
                    To install this app:
                  </p>
                  <div className="text-sm space-y-2 bg-muted/50 p-4 rounded-lg">
                    <p className="font-semibold">On iPhone/iPad:</p>
                    <p>Tap Share → Add to Home Screen</p>
                    <p className="font-semibold mt-3">On Android:</p>
                    <p>Tap Menu (⋮) → Install app or Add to Home screen</p>
                  </div>
                </div>
              )}
            </>
          )}

          <Button
            variant={isInstalled ? "default" : "outline"}
            onClick={() => navigate("/")}
            className="w-full"
          >
            {isInstalled ? "Open Gallery" : "Continue in Browser"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Install;
