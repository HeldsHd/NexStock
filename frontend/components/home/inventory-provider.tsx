"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { featuredProducts, initialSummary, type Product } from "@/lib/dashboard";
import { Icon } from "@/components/ui/icon";

type InventoryContextValue = {
  products: Product[];
  summary: typeof initialSummary;
  addProduct: (product: Product) => void;
};

const InventoryContext = createContext<InventoryContextValue | null>(null);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [addedProducts, setAddedProducts] = useState<Product[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const summary = {
    ...initialSummary,
    totalProducts: initialSummary.totalProducts + addedProducts.length,
    newProducts: initialSummary.newProducts + addedProducts.length,
    stockValue: initialSummary.stockValue + addedProducts.reduce((total, product) => total + product.unitCost * product.quantity, 0),
    lowStock: initialSummary.lowStock + addedProducts.filter((product) => product.quantity > 0 && product.quantity <= 5).length,
    outOfStock: initialSummary.outOfStock + addedProducts.filter((product) => product.quantity === 0).length,
  };

  function addProduct(product: Product) {
    setAddedProducts((current) => [...current, product]);
    setShowConfirmation(true);
  }

  return (
    <InventoryContext.Provider value={{ products: [...featuredProducts, ...addedProducts], summary, addProduct }}>
      {children}
      {showConfirmation && (
        <div className="toast" role="status">
          <Icon name="check" />
          <p>Produto adicionado nesta sessão.</p>
          <button type="button" className="icon-button" onClick={() => setShowConfirmation(false)} aria-label="Fechar confirmação">
            <Icon name="close" />
          </button>
        </div>
      )}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);

  if (!context) {
    throw new Error("useInventory deve ser usado dentro de InventoryProvider.");
  }

  return context;
}
