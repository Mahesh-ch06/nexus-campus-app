
import React from "react";
import { ProductCard } from "./ProductCard";
import type { DisplayProduct } from "./CampusStorePage";

interface ProductGridProps {
  products: DisplayProduct[];
  onAddToCart: (p: DisplayProduct) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onAddToCart,
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
    {products.map((product) => (
      <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
    ))}
  </div>
);
