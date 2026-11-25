type SummaryCardProps = {
  label: string;
  value: string;
  description: string;
  warning?: boolean;
};

export function SummaryCard({ label, value, description, warning = false }: SummaryCardProps) {
  return (
    <article className={`summary-card${warning ? " summary-card--warning" : ""}`}>
      <h3>{label}</h3>
      <p className="summary-card-value">{value}</p>
      <p className="summary-card-description">{description}</p>
    </article>
  );
}
