"use client";

import { useInventory } from "@/components/home/inventory-provider";
import { formatNumber } from "@/lib/dashboard";

export function RestockAlert() {
  const { summary } = useInventory();

  return (
    <section className="detail-card restock-card" id="reposicao" aria-labelledby="restock-title" tabIndex={-1}>
      <h2 id="restock-title" className="section-title">Atenção à reposição</h2>
      <p className="restock-value">{formatNumber(summary.lowStock + summary.outOfStock)}</p>
      <p className="restock-caption">{summary.lowStock} baixos · {summary.outOfStock} esgotados</p>
      <p className="restock-description">{summary.lowStock} produtos com estoque baixo e {summary.outOfStock} esgotados.<br />Priorize a reposição para evitar faltas.</p>
    </section>
  );
}
