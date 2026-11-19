"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { useInventory } from "@/components/home/inventory-provider";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export function NewProductButton() {
  const { products, addProduct } = useInventory();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState("");
  const formId = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const product = {
      name: String(data.get("name") ?? "").trim(),
      sku: String(data.get("sku") ?? "").trim().toUpperCase(),
      unitCost: Number(data.get("unitCost")),
      quantity: Number(data.get("quantity")),
    };

    if (!product.name || !product.sku) {
      setError("Preencha o nome e o código do produto.");
      return;
    }

    if (products.some((existing) => existing.sku === product.sku)) {
      setError("Já existe um produto com este código. Use outro código.");
      return;
    }

    addProduct(product);
    form.reset();
    dialogRef.current?.close();
  }

  return (
    <>
      <Button className="new-product-button" onClick={() => { setError(""); dialogRef.current?.showModal(); }}>
        <Icon name="plus" />
        Novo produto
      </Button>
      <dialog ref={dialogRef} className="product-dialog" aria-labelledby={`${formId}-title`} aria-describedby={`${formId}-description`} onClick={(event) => {
        if (event.target === event.currentTarget) dialogRef.current?.close();
      }}>
        <div className="dialog-content">
          <div className="dialog-heading">
            <h2 id={`${formId}-title`}>Novo produto</h2>
            <button type="button" className="icon-button" aria-label="Fechar cadastro" onClick={() => dialogRef.current?.close()}><Icon name="close" /></button>
          </div>
          <p id={`${formId}-description`} className="dialog-description">Adicione um produto para experimentar o estoque. Os dados ficam disponíveis nesta sessão.</p>
          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor={`${formId}-name`}>Nome do produto</label>
              <input id={`${formId}-name`} name="name" placeholder="Ex.: Camiseta básica" maxLength={100} required autoFocus />
            </div>
            <div className="form-field">
              <label htmlFor={`${formId}-sku`}>Código do produto</label>
              <input id={`${formId}-sku`} name="sku" placeholder="Ex.: CAM-004" maxLength={40} autoCapitalize="characters" required aria-describedby={error ? `${formId}-error` : undefined} />
            </div>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor={`${formId}-cost`}>Custo unitário (R$)</label>
                <input id={`${formId}-cost`} name="unitCost" type="number" min="0" max="999999999" step="0.01" placeholder="0,00" inputMode="decimal" required />
              </div>
              <div className="form-field">
                <label htmlFor={`${formId}-quantity`}>Quantidade</label>
                <input id={`${formId}-quantity`} name="quantity" type="number" min="0" max="999999" step="1" placeholder="0" inputMode="numeric" required />
              </div>
            </div>
            {error && <p className="form-error" id={`${formId}-error`} role="alert">{error}</p>}
            <div className="dialog-actions">
              <Button variant="secondary" onClick={() => dialogRef.current?.close()}>Cancelar</Button>
              <Button type="submit"><Icon name="plus" />Adicionar produto</Button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}
