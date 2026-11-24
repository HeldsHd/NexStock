
"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { useInventory } from "@/components/home/inventory-provider";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { listCategories } from "@/lib/categories";
import { productsApiUrl } from "@/lib/products";
import type { Product } from "@/lib/dashboard";

type NewProductButtonProps = {
  existingProducts?: Pick<Product, "sku">[];
  categories?: string[];
  onCreated?: () => void;
  disabled?: boolean;
};

export function NewProductButton({ existingProducts, categories, onCreated, disabled }: NewProductButtonProps = {}) {
  const { products, addProduct } = useInventory();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [fetchedCategories, setFetchedCategories] = useState<string[]>([]);
  const [categoryLoadError, setCategoryLoadError] = useState("");
  const formId = useId();
  const availableCategories = categories ?? fetchedCategories;

  useEffect(() => {
    if (categories !== undefined) return;

    const controller = new AbortController();
    void listCategories(controller.signal)
      .then(setFetchedCategories)
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setCategoryLoadError(cause instanceof Error ? cause.message : "Não foi possível carregar as categorias.");
        }
      });

    return () => controller.abort();
  }, [categories]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    const form = event.currentTarget;
    const data = new FormData(form);

    const product = {
      name: String(data.get("name") ?? "").trim(),
      sku: String(data.get("sku") ?? "").trim().toUpperCase(),
      unitCost: Number(data.get("unitCost")),
      quantity: Number(data.get("quantity")),
      minimumStock: Number(data.get("minimumStock")),
      category: String(data.get("category") ?? "").trim(),
    };

    if (!product.name || !product.sku) {
      setError("Preencha o nome e o código do produto.");
      return;
    }

    if (
      !Number.isFinite(product.unitCost) ||
      product.unitCost < 0 ||
      !Number.isSafeInteger(product.quantity) ||
      product.quantity < 0 ||
      !Number.isSafeInteger(product.minimumStock) ||
      product.minimumStock < 0
    ) {
      setError("Informe um custo e uma quantidade válidos.");
      return;
    }

    if ((existingProducts ?? products).some((existing) => existing.sku.toLocaleUpperCase("pt-BR") === product.sku)) {
      setError("Já existe um produto com este código.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(productsApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          nome: product.name,
          codigo: product.sku,
          preco_centavos: Math.round(product.unitCost * 100),
          quantidade: product.quantity,
          quantidade_minima: product.minimumStock,
          categoria: product.category,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.erro ?? "Erro ao cadastrar produto.");
        return;
      }

      addProduct(product);
      onCreated?.();

      form.reset();
      dialogRef.current?.close();
    } catch (erro) {
      console.error("Erro ao cadastrar produto:", erro);
      setError("Não foi possível conectar ao servidor.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button
        className="new-product-button"
        disabled={disabled}
        onClick={() => {
          setError("");
          dialogRef.current?.showModal();
        }}
      >
        <Icon name="plus" />
        Novo produto
      </Button>

      <dialog
        ref={dialogRef}
        className="product-dialog"
        aria-labelledby={`${formId}-title`}
        aria-describedby={`${formId}-description`}
        onClick={(event) => {
          if (event.target === event.currentTarget && !saving) {
            dialogRef.current?.close();
          }
        }}
      >
        <div className="dialog-content">
          <div className="dialog-heading">
            <h2 id={`${formId}-title`}>Novo produto</h2>
            <button
              type="button"
              className="icon-button"
              aria-label="Fechar cadastro"
              disabled={saving}
              onClick={() => dialogRef.current?.close()}
            >
              <Icon name="close" />
            </button>
          </div>

          <p
            id={`${formId}-description`}
            className="dialog-description"
          >
            Cadastre um produto no estoque. Os dados serão
            salvos no banco de dados.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor={`${formId}-name`}>
                Nome do produto
              </label>
              <input
                id={`${formId}-name`}
                name="name"
                placeholder="Ex.: Camiseta básica"
                maxLength={100}
                required
                autoFocus
              />
            </div>

            <div className="form-field">
              <label htmlFor={`${formId}-sku`}>
                Código do produto
              </label>
              <input
                id={`${formId}-sku`}
                name="sku"
                placeholder="Ex.: CAM-004"
                maxLength={40}
                autoCapitalize="characters"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor={`${formId}-cost`}>
                  Custo unitário (R$)
                </label>
                <input
                  id={`${formId}-cost`}
                  name="unitCost"
                  type="number"
                  min="0"
                  max="999999999"
                  step="0.01"
                  placeholder="0,00"
                  inputMode="decimal"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor={`${formId}-quantity`}>
                  Quantidade
                </label>
                <input
                  id={`${formId}-quantity`}
                  name="quantity"
                  type="number"
                  min="0"
                  max="999999"
                  step="1"
                  placeholder="0"
                  inputMode="numeric"
                  required
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor={`${formId}-minimum-stock`}>
                Quantidade mínima em estoque
              </label>
              <input
                id={`${formId}-minimum-stock`}
                name="minimumStock"
                type="number"
                min="0"
                max="999999"
                step="1"
                placeholder="0"
                inputMode="numeric"
                required
              />
            </div>

            {availableCategories.length > 0 && (
              <div className="form-field">
                <label htmlFor={`${formId}-category`}>Categoria</label>
                <select id={`${formId}-category`} name="category" defaultValue="">
                  <option value="">Sem categoria</option>
                  {availableCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </div>
            )}
            {categoryLoadError && <p className="form-error" role="alert">{categoryLoadError}</p>}

            {error && (
              <p
                className="form-error"
                id={`${formId}-error`}
                role="alert"
              >
                {error}
              </p>
            )}

            <div className="dialog-actions">
              <Button
                variant="secondary"
                disabled={saving}
                onClick={() => dialogRef.current?.close()}
              >
                Cancelar
              </Button>

              <Button type="submit" disabled={saving}>
                <Icon name="plus" />
                {saving ? "Salvando..." : "Adicionar produto"}
              </Button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}
