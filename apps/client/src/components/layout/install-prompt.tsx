import { useState, useEffect } from "react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Download, X } from "lucide-react";

/**
 * InstallPrompt component displays a banner to prompt users to install the PWA
 */
export default function InstallPrompt() {
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has previously dismissed the prompt
    const dismissed = localStorage.getItem("pwa-install-dismissed");
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
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  // Don't show if already installed, not installable, or dismissed
  if (isInstalled || !isInstallable || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-sky-500 px-4 py-3 text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <Download className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold">Install Torneo App</p>
            <p className="text-xs opacity-90">Get quick access and work offline</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleInstall}
            className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-sky-500 transition-colors hover:bg-gray-100"
          >
            Install
          </button>
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
