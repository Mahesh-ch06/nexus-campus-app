import React from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

interface StoreHeaderProps {
  cartCount: number;
  onCartClick: () => void;
}

export const StoreHeader: React.FC<StoreHeaderProps> = ({ cartCount, onCartClick }) => (
  <div className="sticky top-0 z-[70] bg-gray-900/95 backdrop-blur-md border-b border-gray-800">
    <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Campus Store
        </h1>
        <p className="text-sm text-gray-400 hidden sm:block">Fresh food & essentials delivered</p>
      </div>
      <Button
        onClick={onCartClick}
        className="relative bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105"
        size="sm"
      >
        <ShoppingCart className="h-5 w-5 mr-2" />
        <span className="hidden sm:inline">Cart</span>
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold shadow-lg animate-pulse">
            {cartCount > 99 ? '99+' : cartCount}
          </span>
        )}
      </Button>
    </div>
  </div>
);
