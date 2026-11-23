"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="app-navigation" aria-label="Navegação principal">
      <p className="navigation-label">Principal</p>
      <ul className="navigation-list">
        <li>
          <Link href="/home" className={`navigation-link${pathname === "/home" ? " navigation-link--active" : ""}`} aria-current={pathname === "/home" ? "page" : undefined}>
            <Icon name="grid" />
            <span>Início</span>
          </Link>
        </li>
        <li>
          <button className="navigation-link" type="button" disabled title="A página de produtos estará disponível em breve">
            <Icon name="box" />
            <span>Produtos</span>
          </button>
        </li>
        <li className="navigation-movements">
          <a href="#movimentacoes" className="navigation-link">
            <Icon name="movements" />
            <span>Movimentações</span>
          </a>
        </li>
        <li>
          <Link href="/systemConfig" className={`navigation-link${pathname === "/systemConfig" ? " navigation-link--active" : ""}`} aria-current={pathname === "/systemConfig" ? "page" : undefined}>
            <Icon name="settings" />
            <span className="navigation-settings-label">Configurações</span>
            <span className="navigation-more-label">Mais</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
