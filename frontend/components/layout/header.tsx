"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useInventory } from "@/components/home/inventory-provider";
import { Icon } from "@/components/ui/icon";
import { Logo } from "@/components/layout/logo";

export function Header() {
  const { products, summary } = useInventory();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const searchId = useId();
  const notificationsId = useId();
  const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
  const results = products.filter((product) => `${product.name} ${product.sku}`.toLocaleLowerCase("pt-BR").includes(normalizedQuery));

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    function closeOnOutsideClick(event: PointerEvent) {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) {
        setSearchOpen(false);
        setNotificationsOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);

  function openSearch() {
    setSearchOpen(true);
    setNotificationsOpen(false);
    searchRef.current?.focus();
  }

  return (
    <header className="app-header" ref={headerRef} onKeyDown={(event) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setNotificationsOpen(false);
      }
    }}>
      <Logo />
      <div id={searchId} className="header-search" data-open={searchOpen}>
        <div className="search-field" role="search">
          <Icon name="search" />
          <input ref={searchRef} type="search" aria-label="Buscar produtos no estoque" placeholder="Buscar no estoque..." value={query} onFocus={openSearch} onChange={(event) => setQuery(event.target.value)} />
          <button className="icon-button search-close" type="button" aria-label="Fechar busca" onClick={() => { setSearchOpen(false); setQuery(""); }}>
            <Icon name="close" />
          </button>
        </div>
        {searchOpen && normalizedQuery && (
          <div className="header-popover search-results" role="status">
            <h2>Resultados da busca</h2>
            <p className="search-sample-note">Busca nos produtos de demonstração desta sessão.</p>
            {results.length ? (
              <ul>
                {results.slice(0, 5).map((product) => (
                  <li key={product.sku}>
                    <div><strong>{product.name}</strong><span>{product.sku}</span></div>
                    <span>{product.quantity} em estoque</span>
                  </li>
                ))}
              </ul>
            ) : <p>Nenhum produto encontrado.</p>}
          </div>
        )}
      </div>
      <div className="header-actions">
        <button className="icon-button mobile-search-toggle" type="button" aria-label="Abrir busca" aria-expanded={searchOpen} aria-controls={searchId} onClick={openSearch}>
          <Icon name="search" />
        </button>
        <div className="notifications">
          <button className="icon-button notification-button" type="button" aria-label="Notificações de estoque" aria-expanded={notificationsOpen} aria-controls={notificationsId} onClick={() => { setNotificationsOpen((open) => !open); setSearchOpen(false); }}>
            <Icon name="bell" />
            <span className="notification-dot" />
          </button>
          {notificationsOpen && (
            <section id={notificationsId} className="header-popover notification-popover" aria-label="Notificações">
              <h2>Atenção à reposição</h2>
              <p>{summary.lowStock} produtos com estoque baixo e {summary.outOfStock} esgotados.</p>
              <a href="#reposicao" onClick={() => setNotificationsOpen(false)}>Ver resumo de reposição</a>
            </section>
          )}
        </div>
      </div>
    </header>
  );
}
