"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/icon";
import { formatCurrency, formatNumber } from "@/lib/dashboard";
import { listProducts, restockProduct, type CatalogProduct } from "@/lib/products";
import styles from "./replacement-dashboard.module.css";

type StatusFilter = "all" | "low" | "out";

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}

function suggestedQuantity(product: CatalogProduct) {
  return Math.max(product.minimumStock * 2 - product.quantity, product.quantity === 0 ? 1 : 0);
}

function EntryDialog({
  product,
  onClose,
  onSubmit,
}: {
  product: CatalogProduct;
  onClose: () => void;
  onSubmit: (quantity: number) => Promise<void>;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [quantity, setQuantity] = useState(String(suggestedQuantity(product)));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const received = Number(quantity);

    if (!Number.isSafeInteger(received) || received < 1 || received + product.quantity > Number.MAX_SAFE_INTEGER) {
      setError("Informe uma quantidade inteira maior que zero.");
      return;
    }

    setSaving(true);
    try {
      await onSubmit(received);
    } catch (cause) {
      setError(cause instanceof TypeError ? "Não foi possível conectar ao servidor. Tente novamente." : cause instanceof Error ? cause.message : "Não foi possível concluir a reposição.");
      setSaving(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={`product-dialog ${styles.entryDialog}`}
      aria-labelledby="entry-title"
      aria-describedby="entry-description"
      onCancel={(event) => {
        event.preventDefault();
        if (!saving) onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <div className="dialog-content">
        <div className="dialog-heading">
          <h2 id="entry-title">Dar entrada no estoque</h2>
          <button className="icon-button" type="button" aria-label="Fechar janela" disabled={saving} onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>
        <p id="entry-description" className="dialog-description">
          Informe quantas unidades de <strong>{product.name}</strong> chegaram.
        </p>
        <form onSubmit={(event) => void handleSubmit(event)} aria-busy={saving}>
          <div className="form-field">
            <label htmlFor="received-quantity">Quantidade recebida</label>
            <input
              id="received-quantity"
              type="number"
              min="1"
              max={Number.MAX_SAFE_INTEGER - product.quantity}
              step="1"
              inputMode="numeric"
              value={quantity}
              disabled={saving}
              onChange={(event) => {
                setQuantity(event.target.value);
                setError("");
              }}
              autoFocus
              required
            />
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="dialog-actions">
            <button type="button" className="button button--secondary" disabled={saving} onClick={onClose}>Cancelar</button>
            <button type="submit" className="button button--primary" disabled={saving}>
              {saving ? "Salvando..." : "Confirmar entrada"}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

export function ReplacementDashboard() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const actionTriggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const result = await listProducts(controller.signal);
        if (!controller.signal.aborted) setProducts(result);
      } catch (cause) {
        if (!controller.signal.aborted) {
          setError(cause instanceof TypeError ? "Não foi possível conectar ao servidor. Tente novamente." : cause instanceof Error ? cause.message : "Não foi possível carregar os produtos.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void load();
    return () => controller.abort();
  }, [revision]);

  function reload() {
    setLoading(true);
    setError("");
    setRevision((value) => value + 1);
  }

  const lowCount = products.filter((product) => product.quantity > 0 && product.quantity <= product.minimumStock).length;
  const outCount = products.filter((product) => product.quantity === 0).length;
  const normalizedQuery = normalize(query.trim());
  const filteredProducts = products.filter((product) => {
    const needsRestock = product.quantity === 0 || product.quantity <= product.minimumStock;
    const matchesStatus = status === "all" || (status === "out" ? product.quantity === 0 : product.quantity > 0 && needsRestock);
    const matchesQuery = normalize(`${product.name} ${product.sku} ${product.category}`).includes(normalizedQuery);
    return needsRestock && matchesStatus && matchesQuery;
  });

  function closeEntryDialog() {
    setSelectedProduct(null);
    requestAnimationFrame(() => actionTriggerRef.current?.focus());
  }

  async function copyPurchaseList() {
    const purchaseList = filteredProducts
      .map((product) => `${product.name} (${product.sku}) - ${suggestedQuantity(product)} un.`)
      .join("\n");

    try {
      await navigator.clipboard.writeText(purchaseList);
      setAnnouncement("Lista de compra copiada.");
    } catch {
      setAnnouncement("Não foi possível copiar a lista. Verifique a permissão de área de transferência do navegador.");
    }
  }

  async function registerEntry(product: CatalogProduct, received: number) {
    const updated = await restockProduct(product.id, received);
    setProducts((current) => current.map((item) => item.id === updated.id ? updated : item));
    setAnnouncement(`Entrada de ${received} unidades de ${product.name} registrada com sucesso.`);
    closeEntryDialog();
  }

  return (
    <section className={styles.replacement} aria-labelledby="replacement-title">
      <header className={styles.heading}>
        <div className={styles.headingCopy}>
          <div className={styles.titleBlock}>
            <p className={styles.eyebrow}>Estoque / Reposição</p>
            <h1 id="replacement-title">Reposição</h1>
          </div>
          <p className={styles.subtitle}>Veja o que precisa ser comprado e dê entrada quando chegar.</p>
        </div>
        <button
          type="button"
          className={`button button--primary ${styles.copyButton}`}
          onClick={() => void copyPurchaseList()}
          disabled={loading || Boolean(error) || filteredProducts.length === 0}
        >
          Copiar lista de compra
        </button>
      </header>

      <div className={styles.filters}>
        <div className={`search-field ${styles.search}`} role="search" aria-label="Busca na lista de reposição">
          <Icon name="search" />
          <input
            type="search"
            aria-label="Buscar produto, SKU ou categoria"
            placeholder="Buscar produto, SKU ou categoria"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {query && (
            <button type="button" className={`icon-button ${styles.clearSearch}`} aria-label="Limpar busca" onClick={() => setQuery("")}>
              <Icon name="close" />
            </button>
          )}
        </div>
        <div className={styles.statusFilter}>
          <label htmlFor="replacement-status">Situação:</label>
          <select
            id="replacement-status"
            value={status}
            onChange={(event) => {
              const value = event.target.value;
              if (value === "all" || value === "low" || value === "out") setStatus(value);
            }}
          >
            <option value="all">Todas</option>
            <option value="low">Estoque baixo</option>
            <option value="out">Esgotados</option>
          </select>
          <Icon name="chevron-down" />
        </div>
      </div>

      <div className={styles.listHeading}>
        <h2>Produtos para repor</h2>
        <p aria-live="polite">
          {loading ? "Carregando..." : error ? "Lista indisponível" : `${formatNumber(filteredProducts.length)} ${filteredProducts.length === 1 ? "registro" : "registros"} · ${formatNumber(lowCount)} baixos · ${formatNumber(outCount)} esgotados`}
        </p>
      </div>

      {error ? (
        <div className={styles.emptyState} role="alert">
          <Icon name="box" />
          <h3>Não foi possível carregar as reposições</h3>
          <p>{error}</p>
          <button type="button" className="button button--secondary" onClick={reload}>Tentar novamente</button>
        </div>
      ) : loading ? (
        <div className={styles.emptyState} role="status">
          <p>Carregando produtos...</p>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className={styles.tableContainer}>
          <div className={styles.tableScroll} tabIndex={0} role="region" aria-label="Tabela de produtos para repor">
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Produto</th>
                  <th scope="col">SKU</th>
                  <th scope="col">Categoria</th>
                  <th scope="col" className={styles.numericCell}>Atual</th>
                  <th scope="col" className={styles.numericCell}>Mínimo</th>
                  <th scope="col" className={styles.numericCell}>Sugestão</th>
                  <th scope="col">Situação</th>
                  <th scope="col">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const isOutOfStock = product.quantity === 0;
                  return (
                    <tr key={product.id}>
                      <th scope="row">
                        <div className={styles.productCell}>
                          <span className={styles.productNumber}>{String(product.id).padStart(2, "0")}</span>
                          <span className={styles.productDetails}>
                            <span className={styles.productName}>{product.name}</span>
                            <span className={styles.productDescription}>{formatCurrency(product.unitCost)} por unidade</span>
                          </span>
                        </div>
                      </th>
                      <td className={styles.sku}>{product.sku || "—"}</td>
                      <td>{product.category || "—"}</td>
                      <td className={styles.numericCell}>{formatNumber(product.quantity)}</td>
                      <td className={styles.numericCell}>{formatNumber(product.minimumStock)}</td>
                      <td className={`${styles.numericCell} ${styles.suggestion}`}>+{suggestedQuantity(product)}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${isOutOfStock ? styles.statusOut : styles.statusLow}`}>
                          {isOutOfStock ? "Esgotado" : "Estoque baixo"}
                        </span>
                      </td>
                      <td>
                        <button
                          ref={selectedProduct?.id === product.id ? actionTriggerRef : undefined}
                          type="button"
                          className={styles.entryButton}
                          onClick={(event) => {
                            actionTriggerRef.current = event.currentTarget;
                            setSelectedProduct(product);
                          }}
                          aria-label={`Dar entrada para ${product.name}`}
                        >
                          Dar entrada
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <Icon name="check" />
          <h3>Nenhum produto encontrado</h3>
          <p>Não há itens para reposição com esses filtros.</p>
          {(query || status !== "all") && (
            <button type="button" className="button button--secondary" onClick={() => { setQuery(""); setStatus("all"); }}>
              Limpar filtros
            </button>
          )}
        </div>
      )}

      <footer className={styles.footer}>
        <p>As entradas de estoque são salvas no catálogo.</p>
      </footer>
      <p className={styles.srOnly} role="status" aria-live="polite">{announcement}</p>

      {selectedProduct && (
        <EntryDialog
          key={selectedProduct.id}
          product={selectedProduct}
          onClose={closeEntryDialog}
          onSubmit={(received) => registerEntry(selectedProduct, received)}
        />
      )}
    </section>
  );
}
