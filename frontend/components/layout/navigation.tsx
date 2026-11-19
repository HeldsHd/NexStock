import Link from "next/link";
import { Icon } from "@/components/ui/icon";

export function Navigation() {
  return (
    <nav className="app-navigation" aria-label="Navegação principal">
      <p className="navigation-label">Principal</p>
      <ul className="navigation-list">
        <li>
          <Link href="/home" className="navigation-link navigation-link--active" aria-current="page">
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
          <button className="navigation-link" type="button" disabled title="As configurações estarão disponíveis em breve">
            <Icon name="menu" />
            <span className="navigation-settings-label">Configurações</span>
            <span className="navigation-more-label">Mais</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
