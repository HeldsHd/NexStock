import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { formatCurrency, formatNumber } from "@/lib/dashboard";
import type { CatalogProduct } from "@/lib/products";
import styles from "./products.module.css";

type ProductsTableProps = {
  products: CatalogProduct[];
  loading: boolean;
  hasFilters: boolean;
  onClearFilters: () => void;
  onAction: (product: CatalogProduct, mode: "edit" | "delete" | "restock", trigger: HTMLButtonElement) => void;
};

export function ProductsTable({ products, loading, hasFilters, onClearFilters, onAction }: ProductsTableProps) {
  function getStockStatus(product: CatalogProduct) {
    if (product.quantity === 0) {
      return { label: "Sem estoque", className: styles.statusOut };
    }
    if (product.quantity <= product.minimumStock) {
      return { label: "A repor", className: styles.statusLow };
    }
    return { label: "Disponível", className: styles.statusAvailable };
  }

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableScroll} tabIndex={0} role="region" aria-label="Tabela de produtos; role horizontalmente para ver todas as colunas">
        <table className={styles.table} aria-busy={loading}>
          <caption className={styles.srOnly}>Catálogo de produtos, códigos, categorias, preços, estoque mínimo, situação e ações</caption>
          <thead>
            <tr>
              <th scope="col">Produto</th>
              <th scope="col">SKU</th>
              <th scope="col">Categoria</th>
              <th scope="col" className={styles.numericCell}>Preço</th>
              <th scope="col" className={styles.numericCell}>Quantidade</th>
              <th scope="col" className={styles.numericCell}>Mínimo</th>
              <th scope="col">Situação</th>
              <th scope="col">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className={styles.tableState}><p role="status">Carregando produtos...</p></td></tr>
            ) : products.length ? products.map((product, index) => (
              (() => {
                const status = getStockStatus(product);
                return (
              <tr key={product.id}>
                <th scope="row">
                  <div className={styles.productCell}>
                    <span className={styles.productNumber} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                    <div className={styles.productDetails}>
                      <span className={styles.productName}>{product.name}</span>
                      <span className={styles.productDescription}>{product.description || "Dados não informados"}</span>
                    </div>
                  </div>
                </th>
                <td><span className={product.sku ? styles.sku : styles.missing}>{product.sku || "—"}</span></td>
                <td><span className={product.category ? undefined : styles.missing}>{product.category || "—"}</span></td>
                <td className={styles.numericCell}>{formatCurrency(product.unitCost)}</td>
                <td className={styles.numericCell}>{formatNumber(product.quantity)}</td>
                <td className={styles.numericCell}>{formatNumber(product.minimumStock)}</td>
                <td><span className={`${styles.statusBadge} ${status.className}`}>{status.label}</span></td>
                <td>
                  <div className={styles.rowActions}>
                    <button className={`icon-button ${styles.actionButton}`} type="button" aria-label={`Repor estoque de ${product.name}`} title={`Repor estoque de ${product.name}`} onClick={(event) => onAction(product, "restock", event.currentTarget)}>
                      <Icon name="plus" />
                    </button>
                    <button className={`icon-button ${styles.actionButton}`} type="button" aria-label={`Editar ${product.name}`} title={`Editar ${product.name}`} onClick={(event) => onAction(product, "edit", event.currentTarget)}>
                      <Icon name="edit" />
                    </button>
                    <button className={`icon-button ${styles.actionButton}`} type="button" aria-label={`Excluir ${product.name}`} title={`Excluir ${product.name}`} onClick={(event) => onAction(product, "delete", event.currentTarget)}>
                      <Icon name="trash" />
                    </button>
                  </div>
                </td>
              </tr>
                );
              })()
            )) : (
              <tr>
                <td colSpan={8}>
                  <div className={styles.emptyState}>
                    <Icon name={hasFilters ? "search" : "box"} />
                    <h3>{hasFilters ? "Nenhum produto encontrado" : "Seu catálogo está vazio"}</h3>
                    <p>{hasFilters ? "Tente outro nome, SKU ou categoria." : "Clique em Novo produto para cadastrar seu primeiro item."}</p>
                    {hasFilters && <Button variant="secondary" onClick={onClearFilters}>Limpar filtros</Button>}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
