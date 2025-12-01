import Header from "./header";
import Footer from "./footer";
import Navigation from "./navigation";
import { Toaster } from "@/components/ui/toaster";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <Navigation />
      <main className="flex-1">{children}</main>
      <Footer />
      <Toaster />
    </div>
  );
}
