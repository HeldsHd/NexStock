import { formatNumber, initialSummary } from "@/lib/dashboard";

export function MovementsCard() {
  const total = initialSummary.incoming + initialSummary.outgoing;
  const movements = [
    { label: "entradas", value: initialSummary.incoming, className: "movement-fill--incoming" },
    { label: "saídas", value: initialSummary.outgoing, className: "movement-fill--outgoing" },
  ];

  return (
    <section className="detail-card movements-card" id="movimentacoes" aria-labelledby="movements-title" tabIndex={-1}>
      <h2 id="movements-title" className="section-title">Movimentações</h2>
      <div className="movement-chart">
        {movements.map((movement) => (
          <div className="movement-row" key={movement.label}>
            <p>{formatNumber(movement.value)} {movement.label}</p>
            <div className="movement-track" role="meter" aria-label={movement.label} aria-valuemin={0} aria-valuemax={total} aria-valuenow={movement.value} aria-valuetext={`${movement.value} ${movement.label} de ${total} movimentações`}>
              <span className={`movement-fill ${movement.className}`} style={{ width: `${movement.value / total * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
      <p className="movement-total"><strong>{formatNumber(total)}</strong> Movimentações</p>
    </section>
  );
}
