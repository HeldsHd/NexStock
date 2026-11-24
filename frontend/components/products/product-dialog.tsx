"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import Input from "@/components/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { deleteProduct, removeStock, restockProduct, updateProduct, type CatalogProduct } from "@/lib/products";
import styles from "./products.module.css";

type ProductDialogProps = {
  product: CatalogProduct;
  mode: "edit" | "delete" | "restock" | "withdraw";
  products: CatalogProduct[];
  categories: string[];
  onClose: () => void;
  onSaved: (product: CatalogProduct) => void;
  onDeleted: (id: number) => void;
};

export function ProductDialog({ product, mode, products, categories, onClose, onSaved, onDeleted }: ProductDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formId = useId();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [movementQuantity, setMovementQuantity] = useState(1);
  const isDelete = mode === "delete";
  const isRestock = mode === "restock";
  const isWithdraw = mode === "withdraw";
  const isMovement = isRestock || isWithdraw;
  const projectedQuantity = isWithdraw
    ? Math.max(0, product.quantity - movementQuantity)
    : product.quantity + movementQuantity;
  const projectedStatus = projectedQuantity === 0
    ? "Sem estoque"
    : projectedQuantity <= product.minimumStock
      ? "A repor"
      : "Disponível";
  const withdrawLimitReached = isWithdraw && movementQuantity >= product.quantity;

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    setError("");
    const data = new FormData(event.currentTarget);
    const updated = {
      ...product,
      name: String(data.get("name") ?? "").trim(),
      sku: String(data.get("sku") ?? "").trim().toLocaleUpperCase("pt-BR"),
      unitCost: Number(data.get("unitCost")),
      minimumStock: Number(data.get("minimumStock")),
      category: String(data.get("category") ?? "").trim(),
    };

    if (isMovement) {
      const quantity = movementQuantity;
      if (!Number.isSafeInteger(quantity) || quantity <= 0) {
        setError(isWithdraw
          ? "Informe uma quantidade positiva para registrar a saída."
          : "Informe uma quantidade positiva para adicionar ao estoque.");
        return;
      }

      if (isWithdraw) {
        if (quantity > product.quantity) {
          setError(`A saída não pode exceder as ${product.quantity} unidades disponíveis.`);
          return;
        }
        setSaving(true);
        try {
          const result = await removeStock(product.id, quantity);
          onSaved(result);
        } catch (cause) {
          setError(cause instanceof TypeError ? "Não foi possível conectar ao servidor. Tente novamente." : cause instanceof Error ? cause.message : "Não foi possível concluir a operação.");
          setSaving(false);
        }
        return;
      }

      setSaving(true);
      try {
        const result = await restockProduct(product.id, quantity);
        onSaved(result);
      } catch (cause) {
        setError(cause instanceof TypeError ? "Não foi possível conectar ao servidor. Tente novamente." : cause instanceof Error ? cause.message : "Não foi possível concluir a operação.");
        setSaving(false);
      }
      return;
    }

    if (!isDelete) {
      if (!updated.name || !updated.sku) {
        setError("Preencha o nome e o código do produto.");
        return;
      }
      if (!Number.isFinite(updated.unitCost) || updated.unitCost < 0 || !Number.isSafeInteger(Math.round(updated.unitCost * 100))) {
        setError("Informe um custo unitário válido.");
        return;
      }
      if (!Number.isSafeInteger(updated.minimumStock) || updated.minimumStock < 0) {
        setError("Informe uma quantidade mínima válida.");
        return;
      }
      if (products.some((existing) => existing.id !== product.id && existing.sku.toLocaleUpperCase("pt-BR") === updated.sku)) {
        setError("Já existe um produto com este código.");
        return;
      }
    }

    setSaving(true);
    try {
      if (isDelete) {
        await deleteProduct(product.id);
        onDeleted(product.id);
      } else {
        const result = await updateProduct(updated);
        onSaved(result);
      }
    } catch (cause) {
      setError(cause instanceof TypeError ? "Não foi possível conectar ao servidor. Tente novamente." : cause instanceof Error ? cause.message : "Não foi possível concluir a operação.");
      setSaving(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="product-dialog"
      aria-labelledby={`${formId}-title`}
      aria-describedby={`${formId}-description`}
      onCancel={(event) => {
        event.preventDefault();
        if (!saving) onClose();
      }}
      onClick={(event) => { if (event.target === event.currentTarget && !saving) onClose(); }}
    >
      <div className="dialog-content">
        <div className="dialog-heading">
          <h2 id={`${formId}-title`}>{isDelete ? "Excluir produto" : isRestock ? "Repor estoque" : isWithdraw ? "Registrar saída" : "Editar produto"}</h2>
          <button className="icon-button" type="button" aria-label="Fechar janela" disabled={saving} onClick={onClose}><Icon name="close" /></button>
        </div>
        <p id={`${formId}-description`} className="dialog-description">
          {isDelete
            ? <>Deseja excluir <strong>{product.name}</strong> do catálogo? Essa ação não pode ser desfeita.</>
            : isRestock
              ? <>Adicione unidades ao estoque de <strong>{product.name}</strong>. Quantidade atual: {product.quantity}.</>
              : isWithdraw
              ? <>Retire unidades do estoque de <strong>{product.name}</strong>. Quantidade disponível: {product.quantity}.</>
              : "Atualize as informações do produto no catálogo."}
        </p>
        <form onSubmit={handleSubmit} aria-busy={saving}>
          {isMovement ? (
            <fieldset className={styles.editFields} disabled={saving}>
              <div className={styles.stockMovementSummary}>
                <div>
                  <span>Estoque atual</span>
                  <strong>{product.quantity}</strong>
                </div>
                <Icon name={isWithdraw ? "arrow-right" : "plus"} />
                <div>
                  <span>Depois da movimentação</span>
                  <strong>{projectedQuantity}</strong>
                </div>
              </div>

              <div className={styles.quantitySelector}>
                <label htmlFor={`${formId}-quantity`}>
                  {isWithdraw ? "Quantidade a retirar" : "Quantidade a adicionar"}
                </label>
                <div className={styles.quantityControl}>
                  <button
                    type="button"
                    className={styles.quantityButton}
                    aria-label="Diminuir quantidade"
                    disabled={movementQuantity <= 1}
                    onClick={() => setMovementQuantity((value) => Math.max(1, value - 1))}
                  >
                    –
                  </button>
                  <input
                    id={`${formId}-quantity`}
                    name="quantity"
                    type="number"
                    value={movementQuantity}
                    min="1"
                    max={isWithdraw ? product.quantity : 999999}
                    step="1"
                    inputMode="numeric"
                    autoFocus
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      setMovementQuantity(Number.isSafeInteger(value) ? value : 0);
                    }}
                  />
                  <button
                    type="button"
                    className={styles.quantityButton}
                    aria-label="Aumentar quantidade"
                    disabled={isWithdraw ? movementQuantity >= product.quantity : movementQuantity >= 999999}
                    onClick={() => setMovementQuantity((value) =>
                      isWithdraw ? Math.min(product.quantity, value + 1) : Math.min(999999, value + 1)
                    )}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className={styles.quickQuantities} aria-label="Quantidades rápidas">
                {[1, 5, 10].map((quantity) => (
                  <button
                    key={quantity}
                    type="button"
                    className={movementQuantity === quantity ? styles.quickQuantityActive : styles.quickQuantity}
                    onClick={() => setMovementQuantity(isWithdraw ? Math.min(quantity, product.quantity) : quantity)}
                  >
                    {quantity}
                  </button>
                ))}
                {isWithdraw && (
                  <button
                    type="button"
                    className={styles.quickQuantity}
                    disabled={product.quantity === 0}
                    onClick={() => setMovementQuantity(product.quantity)}
                  >
                    Retirar tudo
                  </button>
                )}
              </div>

              <div className={styles.movementPreview}>
                <span>Situação após a movimentação</span>
                <strong>{projectedStatus}</strong>
              </div>
              {withdrawLimitReached && <p className={styles.withdrawNote}>Esta operação deixará o produto sem estoque.</p>}
            </fieldset>
          ) : !isDelete && (
            <fieldset className={styles.editFields} disabled={saving}>
              <Input label="Nome do produto" name="name" defaultValue={product.name} maxLength={100} required autoFocus />
              <Input label="Código do produto (SKU)" name="sku" defaultValue={product.sku} maxLength={40} autoCapitalize="characters" required />
              <div className="form-field">
                <label htmlFor={`${formId}-category`}>Categoria</label>
                <select id={`${formId}-category`} name="category" defaultValue={product.category}>
                  <option value="">Sem categoria</option>
                  {product.category && !categories.includes(product.category) && (
                    <option value={product.category}>{product.category}</option>
                  )}
                  {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </div>
              <Input label="Custo unitário (R$)" name="unitCost" type="number" defaultValue={product.unitCost} min="0" max="999999999" step="0.01" inputMode="decimal" required />
              <Input label="Quantidade mínima em estoque" name="minimumStock" type="number" defaultValue={product.minimumStock} min="0" max="999999" step="1" inputMode="numeric" required />
            </fieldset>
          )}
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="dialog-actions">
            <Button variant="secondary" disabled={saving} autoFocus={isDelete} onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={saving}>
              <Icon name={isDelete ? "trash" : isRestock ? "plus" : isWithdraw ? "movements" : "check"} />
              {saving
                ? (isDelete ? "Excluindo..." : isRestock ? "Adicionando..." : isWithdraw ? "Registrando..." : "Salvando...")
                : (isDelete ? "Excluir produto" : isRestock ? "Adicionar ao estoque" : isWithdraw ? "Registrar saída" : "Salvar alterações")}
            </Button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
