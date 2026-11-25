import { apiBaseUrl, checkResponse } from "@/lib/products";

const categoriesApiUrl = `${apiBaseUrl}/categorias`;

type ApiCategory = {
  id: number;
  nome: string;
};

function isApiCategory(value: unknown): value is ApiCategory {
  if (!value || typeof value !== "object") return false;
  const category = value as Record<string, unknown>;
  return typeof category.id === "number" &&
    Number.isSafeInteger(category.id) &&
    typeof category.nome === "string";
}

export async function listCategories(signal?: AbortSignal): Promise<string[]> {
  const response = await fetch(categoriesApiUrl, {
    credentials: "include",
    cache: "no-store",
    signal,
  });
  await checkResponse(response, "Não foi possível carregar as categorias.");

  const result: unknown = await response.json();
  if (!Array.isArray(result) || !result.every(isApiCategory)) {
    throw new Error("O servidor retornou uma lista de categorias inválida.");
  }

  return result.map((category) => category.nome);
}

export async function createCategory(name: string): Promise<string> {
  const response = await fetch(categoriesApiUrl, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome: name }),
  });
  await checkResponse(response, "Não foi possível criar a categoria.");

  const result: unknown = await response.json();
  if (!isApiCategory(result)) {
    throw new Error("O servidor retornou uma categoria inválida.");
  }

  return result.nome;
}
