"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { NewProductButton } from "@/components/home/new-product-button";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { listCategories } from "@/lib/categories";
import { formatNumber } from "@/lib/dashboard";
import { listProducts, type CatalogProduct } from "@/lib/products";
import { ProductDialog } from "./product-dialog";
import { ProductsTable } from "./products-table";
import styles from "./products.module.css";

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}

export function ProductsCatalog() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [revision, setRevision] = useState(0);
  const [selected, setSelected] = useState<{ product: CatalogProduct; mode: "edit" | "delete" | "restock" | "withdraw" } | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const actionTriggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const [result, categoryNames] = await Promise.all([
          listProducts(controller.signal),
          listCategories(controller.signal),
        ]);
        if (!controller.signal.aborted) {
          setProducts(result);
          setCategories(categoryNames);
        }
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

  const normalizedQuery = normalize(query.trim());
  const filteredProducts = products.filter((product) =>
    (!category || (category === "uncategorized" ? !product.category : product.category === category)) &&
    normalize(`${product.name} ${product.sku} ${product.category}`).includes(normalizedQuery),
  );
  const hasFilters = Boolean(query.trim() || category);

  function closeDialog(deleted = false) {
    setSelected(null);
    requestAnimationFrame(() => {
      if (deleted) {
        headingRef.current?.focus();
      } else {
        actionTriggerRef.current?.focus();
      }
    });
  }

  return (
    <section className={styles.catalog} aria-labelledby="products-title">
      <header className={styles.heading}>
        <div className={styles.headingCopy}>
          <div className={styles.titleBlock}>
            <p className={styles.eyebrow}>Catálogo / Gestão</p>
            <h1 id="products-title">Produtos</h1>
          </div>
          <p className={styles.subtitle}>Organize e gerencie seu catálogo em um só lugar.</p>
        </div>
        <NewProductButton existingProducts={products} categories={categories} onCreated={reload} disabled={loading || Boolean(error)} />
      </header>

      <div className={styles.filters}>
        <div className={`search-field ${styles.search}`} role="search" aria-label="Busca no catálogo">
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
        <div className={styles.categoryFilter}>
          <label htmlFor="product-category">Categoria:</label>
          <select id="product-category" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">Todas</option>
            {categories.map((value) => <option key={value} value={value}>{value}</option>)}
            <option value="uncategorized">Sem categoria</option>
          </select>
          <Icon name="chevron-down" />
        </div>
      </div>

      <div className={styles.listHeading}>
        <h2 ref={headingRef} tabIndex={-1}>{hasFilters ? "Resultados da busca" : "Todos os produtos"}</h2>
        <p role="status" aria-live="polite">
          {loading ? "Carregando..." : error ? "Catálogo indisponível" : `${formatNumber(filteredProducts.length)} ${filteredProducts.length === 1 ? "registro" : "registros"}`}
        </p>
      </div>

      {error ? (
        <div className={styles.emptyState} role="alert">
          <Icon name="box" />
          <h3>Não foi possível abrir o catálogo</h3>
          <p>{error}</p>
          <div className={styles.stateActions}>
            <Button variant="secondary" onClick={reload}>Tentar novamente</Button>
            {error.includes("sessão") && <Link className="button button--primary" href="/">Entrar novamente</Link>}
          </div>
        </div>
      ) : (
        <ProductsTable
          products={filteredProducts}
          loading={loading}
          hasFilters={hasFilters}
          onClearFilters={() => { setQuery(""); setCategory(""); }}
          onAction={(product, mode, trigger) => {
            actionTriggerRef.current = trigger;
            setSelected({ product, mode });
          }}
        />
      )}

      <footer className={styles.footer}>
        <p>Os campos sem informação são exibidos com “—”.</p>
        {!loading && !error && <p>{formatNumber(products.length)} {products.length === 1 ? "registro" : "registros"} no catálogo</p>}
      </footer>
      <p className={styles.srOnly} role="status" aria-live="polite">{announcement}</p>

      {selected && (
        <ProductDialog
          key={`${selected.mode}-${selected.product.id}`}
          product={selected.product}
          mode={selected.mode}
          products={products}
          categories={categories}
          onClose={() => closeDialog()}
          onSaved={(updated) => {
            setProducts((current) => current.map((product) => product.id === updated.id ? updated : product));
            setAnnouncement("Produto atualizado com sucesso.");
            closeDialog();
          }}
          onDeleted={(id) => {
            setProducts((current) => current.filter((product) => product.id !== id));
            setAnnouncement("Produto excluído com sucesso.");
            closeDialog(true);
          }}
        />
      )}
    </section>
  );
}
