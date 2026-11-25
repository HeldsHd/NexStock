import { apiBaseUrl, checkResponse } from "@/lib/products";

export type StockMovement = {
  id: number;
  productId: number | null;
  productName: string;
  productSku: string;
  type: "entrada" | "saida";
  quantity: number;
  previousStock: number;
  currentStock: number;
  userName: string;
  createdAt: string;
};

export async function listMovements(signal?: AbortSignal): Promise<StockMovement[]> {
  const response = await fetch(`${apiBaseUrl}/estoque/movimentacoes`, {
    credentials: "include",
    cache: "no-store",
    signal,
  });
  await checkResponse(response, "Não foi possível carregar as movimentações.");

  const result: StockMovement[] = await response.json();
  if (!Array.isArray(result)) {
    throw new Error("O servidor retornou uma lista de movimentações inválida.");
  }

  return result;
}
