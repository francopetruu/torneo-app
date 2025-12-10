import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { WifiOff } from "lucide-react";

/**
 * OfflineIndicator component displays a banner when the user is offline
 */
export default function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-center gap-2 bg-yellow-500 px-4 py-2 text-yellow-900 shadow-md">
      <WifiOff className="h-4 w-4" />
      <span className="text-sm font-medium">You're currently offline</span>
    </div>
  );
}
