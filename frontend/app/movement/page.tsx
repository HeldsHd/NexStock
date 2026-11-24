import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Navigation } from "@/components/layout/navigation";
import { InventoryProvider } from "@/components/home/inventory-provider";
import { MovementsDashboard } from "@/components/movements/movements-dashboard";

export const metadata: Metadata = {
  title: "Movimentações | NexStock",
  description: "Consulte o histórico de entradas e saídas do estoque no NexStock.",
};

export default function MovementPage() {
  return (
    <InventoryProvider>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <div className="app-shell">
        <Header />
        <Navigation />
        <main id="conteudo" className="app-main" tabIndex={-1}>
          <div className="dashboard-content">
            <MovementsDashboard />
          </div>
        </main>
      </div>
    </InventoryProvider>
  );
}