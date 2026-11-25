"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { formatNumber } from "@/lib/dashboard";
import { listMovements, type StockMovement } from "@/lib/movements";
import styles from "./movements-dashboard.module.css";

const dateTimeFormat = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

export function MovementsDashboard() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadMovements() {
      try {
        const result = await listMovements(controller.signal);
        if (!controller.signal.aborted) setMovements(result);
      } catch (cause) {
        if (!controller.signal.aborted) {
          setError(cause instanceof TypeError ? "Não foi possível conectar ao servidor. Tente novamente." : cause instanceof Error ? cause.message : "Não foi possível carregar as movimentações.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadMovements();
    return () => controller.abort();
  }, [revision]);

  function retry() {
    setError("");
    setLoading(true);
    setRevision((value) => value + 1);
  }

  const incomingTotal = movements
    .filter((movement) => movement.type === "entrada")
    .reduce((total, movement) => total + movement.quantity, 0);
  const outgoingTotal = movements
    .filter((movement) => movement.type === "saida")
    .reduce((total, movement) => total + movement.quantity, 0);
  const netTotal = incomingTotal - outgoingTotal;

  return (
    <section className={styles.page} aria-labelledby="movements-title">
      <header className={styles.heading}>
        <div className={styles.titleBlock}>
          <p className={styles.eyebrow}>Estoque / Auditoria</p>
          <h1 id="movements-title">Movimentações</h1>
          <p className={styles.subtitle}>Acompanhe as entradas e saídas registradas no estoque.</p>
        </div>
      </header>

      <div className={styles.summary} aria-label="Resumo das quantidades movimentadas">
        <article className={styles.summaryCard}>
          <span>Entradas</span>
          <strong>{loading ? "—" : `${formatNumber(incomingTotal)} un.`}</strong>
        </article>
        <article className={styles.summaryCard}>
          <span>Saídas</span>
          <strong>{loading ? "—" : `${formatNumber(outgoingTotal)} un.`}</strong>
        </article>
        <article className={styles.summaryCard}>
          <span>Saldo líquido</span>
          <strong>{loading ? "—" : `${netTotal > 0 ? "+" : ""}${formatNumber(netTotal)} un.`}</strong>
        </article>
      </div>

      <div className={styles.listHeading}>
        <h2>Histórico</h2>
        <p role="status" aria-live="polite">
          {loading ? "Carregando..." : error ? "Histórico indisponível" : `${formatNumber(movements.length)} ${movements.length === 1 ? "registro" : "registros"}`}
        </p>
      </div>

      {error ? (
        <div className={styles.state} role="alert">
          <Icon name="box" />
          <h3>Não foi possível carregar o histórico</h3>
          <p>{error}</p>
          <button className="button button--secondary" type="button" onClick={retry}>Tentar novamente</button>
        </div>
      ) : loading ? (
        <div className={styles.state} role="status">
          <p>Carregando movimentações...</p>
        </div>
      ) : movements.length > 0 ? (
        <div className={styles.tableContainer}>
          <div className={styles.tableScroll} tabIndex={0} role="region" aria-label="Histórico de movimentações">
            <table className={styles.table}>
              <caption className={styles.srOnly}>Entradas e saídas de estoque, do registro mais recente ao mais antigo</caption>
              <thead>
                <tr>
                  <th scope="col">Data e hora</th>
                  <th scope="col">Produto</th>
                  <th scope="col">Tipo</th>
                  <th scope="col" className={styles.numericCell}>Quantidade</th>
                  <th scope="col" className={styles.numericCell}>Estoque</th>
                  <th scope="col">Responsável</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((movement) => (
                  <tr key={movement.id}>
                    <td>{dateTimeFormat.format(new Date(movement.createdAt))}</td>
                    <th scope="row">
                      <span className={styles.productName}>{movement.productName}</span>
                      <span className={styles.productSku}>{movement.productSku || "Sem SKU"}</span>
                    </th>
                    <td>
                      <span className={`${styles.typeBadge} ${movement.type === "entrada" ? styles.incoming : styles.outgoing}`}>
                        {movement.type === "entrada" ? "Entrada" : "Saída"}
                      </span>
                    </td>
                    <td className={styles.numericCell}>{formatNumber(movement.quantity)}</td>
                    <td className={styles.numericCell}>
                      {formatNumber(movement.previousStock)} <span aria-hidden="true">→</span> {formatNumber(movement.currentStock)}
                    </td>
                    <td>{movement.userName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className={styles.state}>
          <Icon name="movements" />
          <h3>Nenhuma movimentação encontrada</h3>
          <p>Novas entradas e saídas de estoque aparecerão aqui.</p>
        </div>
      )}
    </section>
  );
}
