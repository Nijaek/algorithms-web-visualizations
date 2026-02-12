import TopBar from "@/components/Layout/TopBar";
import Sidebar from "@/components/Layout/Sidebar";
import ComplexityInfo from "@/components/metrics/ComplexityInfo";
import { AlgorithmProvider } from "@/contexts/AlgorithmContext";
import MobileNav from "@/components/Layout/MobileNav";

export default function AlgorithmsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AlgorithmProvider>
      <div className="flex h-screen flex-col overflow-hidden">
        <TopBar />
        {/* Mobile nav - visible below lg */}
        <MobileNav />
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 lg:gap-6 px-4 lg:px-6 pt-4 lg:pt-6 pb-4 lg:pb-6 min-h-0">
          {/* Sidebar - hidden below lg */}
          <div className="hidden lg:block">
            <Sidebar />
          </div>
          <main className="flex flex-col gap-3 lg:gap-4 min-h-0">
            <div className="flex-1 rounded-2xl border border-white/[0.06] bg-surface-2/80 p-3 lg:p-4 shadow-lg shadow-cyan-500/5 min-h-0 overflow-hidden">
              {children}
            </div>
            <ComplexityInfo />
          </main>
        </div>
      </div>
    </AlgorithmProvider>
  );
}
