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
          <Link href="/Stock" className={`navigation-link${pathname === "/Stock" ? " navigation-link--active" : ""}`} aria-current={pathname === "/Stock" ? "page" : undefined}>
            <Icon name="box" />
            <span>Produtos</span>
          </Link>
        </li>
        <li>
          <Link href="/replacement" className={`navigation-link${pathname === "/replacement" ? " navigation-link--active" : ""}`} aria-current={pathname === "/replacement" ? "page" : undefined}>
            <Icon name="refresh" />
            <span>Reposição</span>
          </Link>
        </li>
        <li className="navigation-movements">
          <Link href="/movement" className={`navigation-link${pathname === "/movement" ? " navigation-link--active" : ""}`} aria-current={pathname === "/movement" ? "page" : undefined}>
            <Icon name="movements" />
            <span>Movimentações</span>
          </Link>
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
