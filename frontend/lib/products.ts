import type { Product } from "@/lib/dashboard";

export type CatalogProduct = Product & {
  id: number;
  category: string;
  description: string;
  minimumStock: number;
  supplier: string;
  createdAt: string | null;
  lastMovementAt: string | null;
  imageUrl: string;
};

type ApiProduct = {
  id: number;
  nome?: string | null;
  codigo?: string | null;
  preco_centavos?: number | string | null;
  quantidade?: number | null;
  quantidade_minima?: number | null;
  categoria?: string | null;
  descricao?: string | null;
  fornecedor?: string | null;
  created_at?: string | null;
  ultima_movimentacao?: string | null;
  imagem_url?: string | null;
};

export const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001").replace(/\/$/, "");
export const productsApiUrl = `${apiBaseUrl}/produtos`;

export type ProductImageUpdate = {
  dataUrl?: string;
  url?: string;
};

function toCatalogProduct(product: ApiProduct): CatalogProduct {
  return {
    id: product.id,
    name: product.nome?.trim() || "Produto sem nome",
    sku: product.codigo?.trim() ?? "",
    unitCost: Number(product.preco_centavos ?? 0) / 100,
    quantity: product.quantidade ?? 0,
    minimumStock: product.quantidade_minima ?? 0,
    category: product.categoria?.trim() ?? "",
    description: product.descricao?.trim() ?? "",
    supplier: product.fornecedor?.trim() ?? "",
    createdAt: product.created_at ?? null,
    lastMovementAt: product.ultima_movimentacao ?? null,
    imageUrl: product.imagem_url?.startsWith("/")
      ? `${apiBaseUrl}${product.imagem_url}`
      : product.imagem_url?.trim() ?? "",
  };
}

export async function checkResponse(response: Response, fallback: string) {
  if (response.ok) return;

  if (response.status === 401) {
    throw new Error("Sua sessão expirou. Entre novamente para acessar os produtos.");
  }

  const result = await response.json().catch(() => null);
  throw new Error(typeof result?.erro === "string" ? result.erro : fallback);
}

export async function listProducts(signal?: AbortSignal): Promise<CatalogProduct[]> {
  const response = await fetch(productsApiUrl, {
    credentials: "include",
    cache: "no-store",
    signal,
  });
  await checkResponse(response, "Não foi possível carregar os produtos.");

  const result: ApiProduct[] = await response.json();
  if (!Array.isArray(result)) {
    throw new Error("O servidor retornou uma lista de produtos inválida.");
  }

  return result.map(toCatalogProduct);
}

export async function updateProduct(product: CatalogProduct, image?: ProductImageUpdate): Promise<CatalogProduct> {
  const response = await fetch(`${productsApiUrl}/${product.id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: product.name,
      codigo: product.sku,
      preco_centavos: Math.round(product.unitCost * 100),
      quantidade_minima: product.minimumStock,
      categoria: product.category,
      fornecedor: product.supplier,
      ...(image ? {
        imagem: image.dataUrl ?? null,
        imagem_url: image.url ?? null,
      } : {}),
    }),
  });
  await checkResponse(response, "Não foi possível salvar o produto.");
  return toCatalogProduct(await response.json());
}

export async function deleteProduct(id: number): Promise<void> {
  const response = await fetch(`${productsApiUrl}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  await checkResponse(response, "Não foi possível excluir o produto.");
}

export async function restockProduct(id: number, quantity: number): Promise<CatalogProduct> {
  const response = await fetch(`${apiBaseUrl}/estoque/entrada`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ produtoId: id, quantidade: quantity }),
  });
  await checkResponse(response, "Não foi possível adicionar unidades ao estoque.");

  const result = await response.json();
  if (!result?.produto) {
    throw new Error("O servidor não retornou o produto atualizado.");
  }
  return toCatalogProduct(result.produto);
}

export async function removeStock(id: number, quantity: number): Promise<CatalogProduct> {
  const response = await fetch(`${apiBaseUrl}/estoque/saida`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ produtoId: id, quantidade: quantity }),
  });
  await checkResponse(response, "Não foi possível registrar a saída do estoque.");

  const result = await response.json();
  if (!result?.produto) {
    throw new Error("O servidor não retornou o produto atualizado.");
  }
  return toCatalogProduct(result.produto);
}
