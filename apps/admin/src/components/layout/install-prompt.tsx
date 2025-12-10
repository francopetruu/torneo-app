import { useState, useEffect } from "react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * InstallPrompt component displays a banner to prompt users to install the PWA
 */
export default function InstallPrompt() {
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has previously dismissed the prompt
    const dismissed = localStorage.getItem("pwa-admin-install-dismissed");
    if (dismissed === "true") {
      setIsDismissed(true);
    }
  }, []);

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      setIsDismissed(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("pwa-admin-install-dismissed", "true");
  };

  // Don't show if already installed, not installable, or dismissed
  if (isInstalled || !isInstallable || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-blue-600 px-4 py-3 text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <Download className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold">Install Admin Panel</p>
            <p className="text-xs opacity-90">Get quick access and work offline</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleInstall} size="sm" variant="secondary" className="text-blue-600">
            Install
          </Button>
          <button
            onClick={handleDismiss}
            className="rounded p-1 transition-colors hover:bg-white/20"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
