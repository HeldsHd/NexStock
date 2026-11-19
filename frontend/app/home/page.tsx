import { InventoryProvider } from "@/components/home/inventory-provider";
import { MovementsCard } from "@/components/home/movements-card";
import { NewProductButton } from "@/components/home/new-product-button";
import { RestockAlert } from "@/components/home/restock-alert";
import { StockSummary } from "@/components/home/stock-summary";
import { Header } from "@/components/layout/header";
import { Navigation } from "@/components/layout/navigation";

export default function HomePage() {
  return (
    <InventoryProvider>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <div className="app-shell">
        <Header />
        <Navigation />
        <main id="conteudo" className="app-main" tabIndex={-1}>
          <div className="dashboard-content">
            <header className="page-heading">
              <div>
                <h1>Visão geral</h1>
                <p>Seu estoque, sob controle.</p>
              </div>
              <NewProductButton />
            </header>
            <StockSummary />
            <div className="details-grid">
              <MovementsCard />
              <RestockAlert />
            </div>
          </div>
        </main>
      </div>
    </InventoryProvider>
  );
}
