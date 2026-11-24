"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/icon";
import styles from "./replacement-dashboard.module.css";

type StockProduct = {
  id: number;
  name: string;
  sku: string;
  category: string;
  unitCost: number;
  quantity: number;
  minimum: number;
};

type StatusFilter = "all" | "low" | "out";

const initialProducts: StockProduct[] = [
  { id: 1, name: "Calça bag neon", sku: "CAL-001", category: "Calças", unitCost: 120, quantity: 0, minimum: 20 },
  { id: 2, name: "Camiseta básica preta", sku: "CAM-010", category: "Camisas", unitCost: 49.9, quantity: 0, minimum: 30 },
  { id: 3, name: "Moletom canguru", sku: "MOL-004", category: "Moletons", unitCost: 189, quantity: 0, minimum: 10 },
  { id: 4, name: "Boné aba reta", sku: "BON-002", category: "Acessórios", unitCost: 59, quantity: 0, minimum: 25 },
  { id: 5, name: "Meia esportiva", sku: "MEI-030", category: "Acessórios", unitCost: 19.9, quantity: 9, minimum: 40 },
  { id: 6, name: "Short tactel", sku: "SHO-015", category: "Shorts", unitCost: 69, quantity: 5, minimum: 20 },
  { id: 7, name: "Tênis casual", sku: "TEN-007", category: "Calçados", unitCost: 229.9, quantity: 12, minimum: 25 },
  { id: 8, name: "Jaqueta corta-vento", sku: "JAC-003", category: "Jaquetas", unitCost: 159, quantity: 7, minimum: 15 },
  { id: 9, name: "Regata fitness", sku: "REG-011", category: "Camisas", unitCost: 39.9, quantity: 14, minimum: 30 },
  { id: 10, name: "Legging esportiva", sku: "LEG-018", category: "Calças", unitCost: 89.9, quantity: 6, minimum: 20 },
  { id: 11, name: "Mochila urbana", sku: "MOC-020", category: "Acessórios", unitCost: 139.9, quantity: 8, minimum: 18 },
  { id: 12, name: "Garrafa térmica", sku: "GAR-008", category: "Acessórios", unitCost: 79.9, quantity: 11, minimum: 24 },
];

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}

function suggestedQuantity(product: StockProduct) {
  return Math.max(product.minimum * 2 - product.quantity, 0);
}

function EntryDialog({
  product,
  onClose,
  onSubmit,
}: {
  product: StockProduct;
  onClose: () => void;
  onSubmit: (quantity: number) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [quantity, setQuantity] = useState(String(suggestedQuantity(product)));
  const [error, setError] = useState("");

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const received = Number(quantity);

    if (!Number.isSafeInteger(received) || received < 1 || received + product.quantity > Number.MAX_SAFE_INTEGER) {
      setError("Informe uma quantidade inteira maior que zero.");
      return;
    }

    onSubmit(received);
  }

  return (
    <dialog
      ref={dialogRef}
      className={`product-dialog ${styles.entryDialog}`}
      aria-labelledby="entry-title"
      aria-describedby="entry-description"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="dialog-content">
        <div className="dialog-heading">
          <h2 id="entry-title">Dar entrada no estoque</h2>
          <button className="icon-button" type="button" aria-label="Fechar janela" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>
        <p id="entry-description" className="dialog-description">
          Informe quantas unidades de <strong>{product.name}</strong> chegaram. Esta demonstração atualiza a lista apenas nesta sessão.
        </p>
        <form onSubmit={handleSubmit}>
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
            <button type="button" className="button button--secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="button button--primary">Confirmar entrada</button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

export function ReplacementDashboard() {
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [selectedProduct, setSelectedProduct] = useState<StockProduct | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const actionTriggerRef = useRef<HTMLButtonElement | null>(null);

  const lowCount = products.filter((product) => product.quantity > 0 && product.quantity < product.minimum).length;
  const outCount = products.filter((product) => product.quantity === 0).length;
  const normalizedQuery = normalize(query.trim());
  const filteredProducts = products.filter((product) => {
    const needsRestock = product.quantity < product.minimum;
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

  function registerEntry(product: StockProduct, received: number) {
    setProducts((current) => current.map((item) =>
      item.id === product.id ? { ...item, quantity: item.quantity + received } : item,
    ));
    setAnnouncement(`Entrada de ${received} unidades de ${product.name} registrada nesta sessão.`);
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
          disabled={filteredProducts.length === 0}
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
          {filteredProducts.length} {filteredProducts.length === 1 ? "registro" : "registros"} · {lowCount} baixos · {outCount} esgotados
        </p>
      </div>

      {filteredProducts.length > 0 ? (
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
                            <span className={styles.productDescription}>{currency.format(product.unitCost)} por unidade</span>
                          </span>
                        </div>
                      </th>
                      <td className={styles.sku}>{product.sku}</td>
                      <td>{product.category}</td>
                      <td className={styles.numericCell}>{product.quantity}</td>
                      <td className={styles.numericCell}>{product.minimum}</td>
                      <td className={`${styles.numericCell} ${styles.suggestion}`}>+{suggestedQuantity(product)}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${isOutOfStock ? styles.statusOut : styles.statusLow}`}>
                          {isOutOfStock ? "Esgotado" : "Estoque baixo"}
                        </span>
                      </td>
                      <td>
                        <button
                          ref={(element) => {
                            if (selectedProduct?.id === product.id) actionTriggerRef.current = element;
                          }}
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
        <p>Dados de exemplo. Entradas feitas aqui não são salvas no servidor.</p>
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
