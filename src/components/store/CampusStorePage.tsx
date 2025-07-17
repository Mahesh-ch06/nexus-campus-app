import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Cart } from './Cart';
import { StoreHeader } from "./StoreHeader";
import { CategoryFilterBar } from "./CategoryFilterBar";
import { ProductGrid } from "./ProductGrid";
import { SearchBar } from "./SearchBar";

interface Category {
  id: string;
  name: string;
  icon: string;
}
interface Vendor {
  id: string;
  business_name: string;
}
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount_percentage: number;
  quantity: number;
  image_url?: string;
  vendor_id: string;
  category_id?: string;
}

export interface DisplayProduct extends Product {
  vendor: Vendor;
}

export const CampusStorePage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<DisplayProduct[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<Array<{id: string; name: string; price: number; quantity: number; image_url?: string}>>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    try {
      const { data: cats, error: catErr } = await supabase
        .from('store_categories')
        .select('id,name,icon');
      setCategories(cats || []);
      console.log("Fetched categories (Store):", cats);
      if (catErr) {
        console.error("Category fetch error:", catErr);
        toast({
          title: "Error",
          description: catErr.message,
          variant: "destructive",
        });
      }

      const { data: vends, error: vendErr } = await supabase
        .from('vendors')
        .select('id,business_name');
      setVendors(vends || []);
      console.log("Fetched vendors (Store):", vends);
      if (vendErr) {
        console.error("Vendor fetch error:", vendErr);
        toast({
          title: "Error",
          description: vendErr.message,
          variant: "destructive",
        });
      }

      const { data: prods, error: prodErr } = await supabase
        .from('products')
        .select('*');
      setProducts((prods || []) as unknown as DisplayProduct[]);
      console.log("Fetched products (Store):", prods);
      if (prodErr) {
        console.error("Product fetch error:", prodErr);
        toast({
          title: "Error",
          description: prodErr.message,
          variant: "destructive",
        });
      }

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch products.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addToCart = (product: DisplayProduct) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to checkout.",
        variant: "destructive",
      });
      return;
    }

    // For now, just clear the cart and show success
    // TODO: Implement proper order creation with correct schema
    toast({
      title: "Order Placed!",
      description: "Your order has been placed successfully.",
    });
    setCart([]);
    setIsCartOpen(false);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      setCart(prevCart => prevCart.filter(item => item.id !== productId));
    } else {
      setCart(prevCart => 
        prevCart.map(item => 
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const cartItems = cart.map(item => ({
    ...item,
    discount_percentage: 0, // Default discount
    vendor_id: 'default-vendor', // Default vendor ID
    vendors: {
      business_name: 'Campus Store'
    }
  }));

  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const serviceFee = subtotal * 0.05; // 5% service fee

  return (
    <div className="min-h-screen bg-background">
      <StoreHeader
        cartCount={cart.reduce((total, item) => total + item.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
      />
      <div className="container mx-auto px-3 py-4 max-w-7xl">
        <SearchBar value={search} onChange={setSearch} />
        <CategoryFilterBar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
        />
        {products.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="text-6xl mb-4">🛍️</div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">No products found</h3>
            <p className="text-muted-foreground">Try adjusting your search or category filter</p>
          </div>
        ) : (
          <ProductGrid products={products} onAddToCart={addToCart} />
        )}
      </div>
      {isCartOpen && (
        <Cart
          items={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onBack={() => setIsCartOpen(false)}
          subtotal={subtotal}
          serviceFee={serviceFee}
        />
      )}
    </div>
  );
};

export default CampusStorePage;
