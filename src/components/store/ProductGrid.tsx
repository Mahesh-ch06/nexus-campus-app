
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
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {products.map((product) => (
      <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
    ))}
  </div>
);
