import type { Metadata } from "next";
import { InventoryProvider } from "@/components/home/inventory-provider";
import { Header } from "@/components/layout/header";
import { Navigation } from "@/components/layout/navigation";
import { ReplacementDashboard } from "@/components/replacement/replacement-dashboard";

export const metadata: Metadata = {
  title: "Reposição | NexStock",
  description: "Consulte produtos com estoque baixo e organize suas reposições no NexStock.",
};

export default function ReplacementPage() {
  return (
    <InventoryProvider>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <div className="app-shell">
        <Header />
        <Navigation />
        <main id="conteudo" className="app-main" tabIndex={-1}>
          <div className="dashboard-content">
            <ReplacementDashboard />
          </div>
        </main>
      </div>
    </InventoryProvider>
  );
}