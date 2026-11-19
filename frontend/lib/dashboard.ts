export type Product = {
  name: string;
  sku: string;
  unitCost: number;
  quantity: number;
};

// Dados de demonstração da home, até a integração com a API de estoque.
export const initialSummary = {
  totalProducts: 1248,
  stockValue: 84520,
  newProducts: 24,
  incoming: 112,
  outgoing: 74,
  lowStock: 8,
  outOfStock: 4,
};

// Uma amostra dos produtos representados pelos indicadores acima.
export const featuredProducts: Product[] = [
  { name: "Camiseta básica", sku: "CAM-001", unitCost: 39.9, quantity: 4 },
  { name: "Calça jeans", sku: "CAL-002", unitCost: 129.9, quantity: 0 },
  { name: "Moletom com capuz", sku: "MOL-003", unitCost: 89.9, quantity: 2 },
];

export const formatNumber = (value: number) =>
  new Intl.NumberFormat("pt-BR").format(value);

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
