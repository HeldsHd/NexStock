"use client";

import { Fragment, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { formatCurrency, formatNumber } from "@/lib/dashboard";
import { apiBaseUrl, type CatalogProduct } from "@/lib/products";
import styles from "./products.module.css";

type ProductsTableProps = {
  products: CatalogProduct[];
  loading: boolean;
  hasFilters: boolean;
  onClearFilters: () => void;
  onAction: (product: CatalogProduct, mode: "edit" | "delete" | "restock" | "withdraw", trigger: HTMLButtonElement) => void;
};

function formatDateTime(value: string | null) {
  if (!value) return "Não informado";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Não informado";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export function ProductsTable({ products, loading, hasFilters, onClearFilters, onAction }: ProductsTableProps) {
  const [expandedProductId, setExpandedProductId] = useState<number | null>(null);

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
      <div className={styles.tableScroll} tabIndex={0} role="region" aria-label="Catálogo de produtos">
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
            ) : products.length ? products.map((product, index) => {
              const status = getStockStatus(product);
              const isExpanded = expandedProductId === product.id;
              const restockShortfall = Math.max(0, product.minimumStock - product.quantity);
              const restockEstimate = restockShortfall * product.unitCost;
              return (
                <Fragment key={product.id}>
                  <tr>
                    <th scope="row">
                      <div className={styles.productCell}>
                        <span className={styles.productNumber} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                        <button
                          type="button"
                          className={styles.productToggle}
                          aria-expanded={isExpanded}
                          aria-controls={`product-details-${product.id}`}
                          onClick={() => setExpandedProductId(isExpanded ? null : product.id)}
                        >
                          <span className={styles.productDetails}>
                            <span className={styles.productName}>{product.name}</span>
                            <span className={styles.productDescription}>{product.description || "Dados não informados"}</span>
                          </span>
                          <Icon name="chevron-down" className={isExpanded ? styles.chevronExpanded : styles.chevron} />
                        </button>
                    </div>
                  </th>
                  <td data-label="SKU"><span className={product.sku ? styles.sku : styles.missing}>{product.sku || "—"}</span></td>
                  <td data-label="Categoria"><span className={product.category ? undefined : styles.missing}>{product.category || "—"}</span></td>
                  <td data-label="Preço" className={styles.numericCell}>{formatCurrency(product.unitCost)}</td>
                  <td data-label="Quantidade" className={styles.numericCell}>{formatNumber(product.quantity)}</td>
                  <td data-label="Mínimo" className={styles.numericCell}>{formatNumber(product.minimumStock)}</td>
                  <td data-label="Situação"><span className={`${styles.statusBadge} ${status.className}`}>{status.label}</span></td>
                  <td data-label="Ações">
                    <div className={styles.rowActions}>
                      <button className={`icon-button ${styles.actionButton}`} type="button" aria-label={`Repor estoque de ${product.name}`} title={`Repor estoque de ${product.name}`} onClick={(event) => onAction(product, "restock", event.currentTarget)}>
                        <Icon name="plus" />
                      </button>
                      <button className={`icon-button ${styles.actionButton}`} type="button" aria-label={`Registrar saída de ${product.name}`} title={`Registrar saída de ${product.name}`} disabled={product.quantity === 0} onClick={(event) => onAction(product, "withdraw", event.currentTarget)}>
                        <Icon name="movements" />
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
                <tr className={styles.detailsRow} hidden={!isExpanded}>
                  <td colSpan={8} className={styles.detailsCell}>
                    <div id={`product-details-${product.id}`} className={styles.productExpansion}>
                      <figure className={styles.productImage}>
                        {product.imageUrl ? (
                          <Image
                            src={product.imageUrl}
                            alt={`Imagem de ${product.name}`}
                            width={240}
                            height={180}
                            className={styles.productPhoto}
                            unoptimized
                            crossOrigin={product.imageUrl.startsWith(`${apiBaseUrl}/produtos/`) ? "use-credentials" : undefined}
                          />
                        ) : (
                          <svg viewBox="0 0 240 180" role="img" aria-label={`Ilustração de uma camiseta para ${product.name}`}>
                            <path className={styles.shirtShadow} d="M75 41 96 29h48l21 12 38 24-19 31-22-12v69H78V84L56 96 37 65l38-24Z" />
                            <path className={styles.shirtShape} d="m75 41 21-12 12 17h24l12-17 21 12 25 16-14 23-19-10v67H83V70l-19 10-14-23 25-16Z" />
                            <path className={styles.shirtDetail} d="m96 29 12 17h24l12-17M83 70v67m74-67v67" />
                            <path className={styles.shirtMark} d="M113 72h14v14h-14z" />
                          </svg>
                        )}
                        <figcaption>{product.imageUrl ? "Foto do produto" : "Imagem ilustrativa"}</figcaption>
                      </figure>
                      <div className={styles.productExpansionInfo}>
                        <div className={styles.expansionHeading}>
                          <div>
                            <p className={styles.expansionEyebrow}>Detalhes do produto</p>
                            <h3>{product.name}</h3>
                          </div>
                          <span className={`${styles.statusBadge} ${status.className}`}>{status.label}</span>
                        </div>
                        <p className={styles.expansionDescription}>{product.description || "Nenhuma descrição cadastrada para este produto."}</p>
                        <dl className={styles.productFacts}>
                          <div><dt>SKU</dt><dd>{product.sku || "—"}</dd></div>
                          <div><dt>Categoria</dt><dd>{product.category || "Sem categoria"}</dd></div>
                          <div><dt>Preço unitário</dt><dd>{formatCurrency(product.unitCost)}</dd></div>
                          <div><dt>Estoque atual</dt><dd>{formatNumber(product.quantity)} unidades</dd></div>
                          <div><dt>Estoque mínimo</dt><dd>{formatNumber(product.minimumStock)} unidades</dd></div>
                          <div className={styles.stockValueFact}>
                            <dt>Valor total em estoque</dt>
                            <dd>{formatCurrency(product.unitCost * product.quantity)}</dd>
                          </div>
                          <div><dt>Fornecedor</dt><dd>{product.supplier || "Não informado"}</dd></div>
                          <div><dt>Data de cadastro</dt><dd>{formatDateTime(product.createdAt)}</dd></div>
                          <div><dt>Última movimentação</dt><dd>{formatDateTime(product.lastMovementAt)}</dd></div>
                        </dl>
                        <div className={styles.restockSuggestion}>
                          <div>
                            <span>Sugestão de reposição</span>
                            <strong>{restockShortfall > 0 ? `Repor ${formatNumber(restockShortfall)} unidades` : "Nenhuma reposição necessária"}</strong>
                          </div>
                          <div className={styles.restockEstimate}>
                            <span>Custo estimado</span>
                            <strong>{formatCurrency(restockEstimate)}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
                </Fragment>
              );
            }) : (
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
