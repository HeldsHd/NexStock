import type { Metadata } from "next";
import { InventoryProvider } from "@/components/home/inventory-provider";
import { Header } from "@/components/layout/header";
import { Navigation } from "@/components/layout/navigation";
import { ProductsCatalog } from "@/components/products/products-catalog";

export const metadata: Metadata = {
  title: "Produtos | NexStock",
  description: "Organize e gerencie seu catálogo de produtos no NexStock.",
};

export default function StockPage() {
  return (
    <InventoryProvider>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <div className="app-shell">
        <Header />
        <Navigation />
        <main id="conteudo" className="app-main" tabIndex={-1}>
          <div className="dashboard-content">
            <ProductsCatalog />
          </div>
        </main>
      </div>
    </InventoryProvider>
  );
}
