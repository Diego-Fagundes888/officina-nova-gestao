
import { Toaster } from "@/components/ui/sonner";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" />
      <Sidebar />
      
      <div className="lg:pl-64">
        <main className="p-3 sm:p-4 md:p-6 lg:p-8 animate-fade-in max-w-full overflow-x-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
