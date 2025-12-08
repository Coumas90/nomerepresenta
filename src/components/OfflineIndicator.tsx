import { WifiOff, Wifi } from "lucide-react";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";

export const OfflineIndicator = () => {
  const { isOnline, wasOffline } = useOfflineStatus();

  // Show nothing if online and never went offline
  if (isOnline && !wasOffline) return null;

  return (
    <div
      className={`fixed bottom-4 left-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-500 ${
        isOnline
          ? "bg-green-500/90 text-white animate-fade-in"
          : "bg-stone-800/90 text-white animate-fade-in"
      }`}
    >
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4" />
          <span>Back online</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          <span>Offline - viewing cached content</span>
        </>
      )}
    </div>
  );
};
