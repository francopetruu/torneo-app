import Header from "./header";
import Footer from "./footer";
import Navigation from "./navigation";
import OfflineIndicator from "./offline-indicator";
import InstallPrompt from "./install-prompt";
import { Toaster } from "@/components/ui/toaster";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <OfflineIndicator />
      <Header />
      <Navigation />
      <main className="flex-1">{children}</main>
      <Footer />
      <InstallPrompt />
      <Toaster />
    </div>
  );
}
