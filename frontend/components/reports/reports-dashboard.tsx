"use client";

import { useState } from "react";
import styles from "./reports-dashboard.module.css";

type Period = "7" | "30" | "90";

const reports = {
  "7": {
    incoming: [36, 25, 48, 30, 39, 22, 15],
    outgoing: [29, 35, 28, 55, 43, 17, 10],
    labels: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
    bestSellers: [120, 98, 76, 61, 44],
    incomingChange: "+4%",
    outgoingChange: "+2%",
  },
  "30": {
    incoming: [164, 148, 171, 155, 182],
    outgoing: [155, 163, 168, 170, 171],
    labels: ["Sem. 1", "Sem. 2", "Sem. 3", "Sem. 4", "Sem. 5"],
    bestSellers: [480, 392, 304, 244, 176],
    incomingChange: "+8%",
    outgoingChange: "-3%",
  },
  "90": {
    incoming: [780, 815, 840],
    outgoing: [790, 808, 821],
    labels: ["Mês 1", "Mês 2", "Mês 3"],
    bestSellers: [1440, 1176, 912, 732, 528],
    incomingChange: "+12%",
    outgoingChange: "+6%",
  },
} satisfies Record<Period, {
  incoming: number[];
  outgoing: number[];
  labels: string[];
  bestSellers: number[];
  incomingChange: string;
  outgoingChange: string;
}>;

const categories = [
  { name: "Mercearia", percentage: 41, color: "orange" },
  { name: "Bebidas", percentage: 32, color: "blue" },
  { name: "Limpeza", percentage: 15, color: "green" },
  { name: "Higiene", percentage: 12, color: "yellow" },
] as const;

const products = [
  { name: "Café torrado 500g", quantity: 120 },
  { name: "Água mineral 1,5L", quantity: 98 },
  { name: "Arroz branco 5kg", quantity: 76 },
  { name: "Suco de laranja 1L", quantity: 61 },
  { name: "Sabonete em barra", quantity: 44 },
];

const restockItems = [
  { name: "Detergente neutro", quantity: 0 },
  { name: "Shampoo 350ml", quantity: 0 },
  { name: "Suco de laranja 1L", quantity: 6 },
  { name: "Água mineral 1,5L", quantity: 9 },
];

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const number = new Intl.NumberFormat("pt-BR");

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

export function ReportsDashboard() {
  const [period, setPeriod] = useState<Period>("7");
  const report = reports[period];
  const totalIncoming = sum(report.incoming);
  const totalOutgoing = sum(report.outgoing);
  const maxMovement = Math.max(...report.incoming, ...report.outgoing);
  const maxSeller = Math.max(...report.bestSellers);

  function exportCsv() {
    const rows = [
      ["Relatório NexStock", `Últimos ${period} dias`],
      ["Indicador", "Valor"],
      ["Valor em estoque", "R$ 48.320"],
      ["Entradas", String(totalIncoming)],
      ["Saídas", String(totalOutgoing)],
      ["Itens para repor", String(restockItems.length)],
      [],
      ["Período", "Entradas", "Saídas"],
      ...report.labels.map((label, index) => [
        label,
        String(report.incoming[index]),
        String(report.outgoing[index]),
      ]),
      [],
      ["Categoria", "Participação"],
      ...categories.map(({ name, percentage }) => [name, `${percentage}%`]),
      [],
      ["Produto mais vendido", `Quantidade nos últimos ${period} dias`],
      ...products.map(({ name }, index) => [name, String(report.bestSellers[index])]),
      [],
      ["Produto para reposição", "Quantidade em estoque"],
      ...restockItems.map(({ name, quantity }) => [name, String(quantity)]),
    ];
    const csv = `\uFEFF${rows.map((row) => row.map((cell) => `"${(cell ?? "").replaceAll('"', '""')}"`).join(";")).join("\r\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-nexstock-${period}-dias.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className={styles.dashboard}>
      <header className={styles.heading}>
        <div>
          <h1>Relatórios</h1>
          <p>Resumo dos últimos {period} dias <span>· Dados demonstrativos</span></p>
        </div>
        <div className={styles.actions}>
          <div className={styles.periods} aria-label="Período do relatório">
            {(["7", "30", "90"] as const).map((value) => (
              <button
                key={value}
                type="button"
                className={`${styles.periodButton}${period === value ? ` ${styles.periodActive}` : ""}`}
                aria-pressed={period === value}
                onClick={() => setPeriod(value)}
              >
                {value} dias
              </button>
            ))}
          </div>
          <button type="button" className={styles.exportButton} onClick={exportCsv}>
            Exportar CSV
          </button>
        </div>
      </header>

      <section className={styles.summary} aria-label="Indicadores do período">
        <article className={styles.metric}>
          <h2>Valor em estoque</h2>
          <p className={styles.metricValue}>{currency.format(48320)}</p>
          <p className={styles.positive}>+4% vs. período anterior</p>
        </article>
        <article className={styles.metric}>
          <h2>Entradas</h2>
          <p className={styles.metricValue}>{number.format(totalIncoming)} un.</p>
          <p className={styles.positive}>{report.incomingChange} vs. período anterior</p>
        </article>
        <article className={styles.metric}>
          <h2>Saídas</h2>
          <p className={styles.metricValue}>{number.format(totalOutgoing)} un.</p>
          <p className={styles.positive}>{report.outgoingChange} vs. período anterior</p>
        </article>
        <article className={styles.metric}>
          <h2>Itens para repor</h2>
          <p className={styles.metricValue}>{restockItems.length} produtos</p>
          <p className={styles.warning}>Veja a lista abaixo</p>
        </article>
      </section>

      <section className={styles.primaryGrid} aria-label="Movimentações e categorias">
        <article className={styles.panel}>
          <h2>Entradas e saídas</h2>
          <div className={styles.legend}>
            <span><i className={styles.incomingKey} />Entradas</span>
            <span><i className={styles.outgoingKey} />Saídas</span>
          </div>
          <div className={styles.chart} role="img" aria-label={`Gráfico de entradas e saídas: ${report.labels.map((label, index) => `${label}, ${report.incoming[index]} entradas e ${report.outgoing[index]} saídas`).join("; ")}`}>
            {report.labels.map((label, index) => (
              <div className={styles.chartGroup} key={label}>
                <div className={styles.bars}>
                  <span className={`${styles.bar} ${styles.incomingBar}`} style={{ height: `${(report.incoming[index] / maxMovement) * 100}%` }} />
                  <span className={`${styles.bar} ${styles.outgoingBar}`} style={{ height: `${(report.outgoing[index] / maxMovement) * 100}%` }} />
                </div>
                <span className={styles.chartLabel}>{label}</span>
              </div>
            ))}
          </div>
        </article>

        <article className={styles.panel}>
          <h2>Valor por categoria</h2>
          <div className={styles.categoryBar} role="img" aria-label={categories.map(({ name, percentage }) => `${name}: ${percentage}%`).join(", ")}>
            {categories.map((category) => (
              <span
                key={category.name}
                className={`${styles.categorySegment} ${styles[`category${category.color}`]}`}
                style={{ width: `${category.percentage}%` }}
              />
            ))}
          </div>
          <ul className={styles.categoryList}>
            {categories.map(({ name, percentage, color }) => (
              <li key={name}>
                <span><i className={`${styles.categoryDot} ${styles[`category${color}`]}`} />{name}</span>
                <strong>{percentage}%</strong>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className={styles.secondaryGrid} aria-label="Produtos mais vendidos e reposição">
        <article className={styles.panel}>
          <h2>Produtos mais vendidos</h2>
          <ul className={styles.sellerList}>
            {products.map(({ name }, index) => (
              <li key={name}>
                <span className={styles.sellerName}>{name}</span>
                <span className={styles.sellerTrack}>
                  <span className={styles.sellerBar} style={{ width: `${(report.bestSellers[index] / maxSeller) * 100}%` }} />
                </span>
                <span className={styles.sellerCount}>{number.format(report.bestSellers[index])}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className={styles.panel}>
          <h2>Precisam de reposição</h2>
          <ul className={styles.restockList}>
            {restockItems.map(({ name, quantity }) => (
              <li key={name}>
                <span>{name}</span>
                <strong className={quantity === 0 ? styles.outOfStock : styles.lowStock}>
                  {quantity === 0 ? "Esgotado" : `${quantity} un.`}
                </strong>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}
