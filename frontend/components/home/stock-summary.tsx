"use client";

import { useInventory } from "@/components/home/inventory-provider";
import { SummaryCard } from "@/components/home/summary-card";
import { formatCurrency, formatNumber } from "@/lib/dashboard";

export function StockSummary() {
  const { summary } = useInventory();

  return (
    <section className="stock-summary" aria-labelledby="stock-summary-title">
      <h2 id="stock-summary-title" className="section-title">Resumo do estoque</h2>
      <div className="summary-grid">
        <SummaryCard label="Total de produtos" value={formatNumber(summary.totalProducts)} description={`+${summary.newProducts} neste mês`} />
        <SummaryCard label="Valor em estoque" value={formatCurrency(summary.stockValue)} description="Custo total" />
        <SummaryCard label="Movimentações" value={formatNumber(summary.incoming + summary.outgoing)} description={`${summary.incoming} entradas · ${summary.outgoing} saídas`} />
        <SummaryCard label="Precisa repor" value={formatNumber(summary.lowStock + summary.outOfStock)} description={`${summary.lowStock} baixos · ${summary.outOfStock} esgotados`} warning />
      </div>
    </section>
  );
}
