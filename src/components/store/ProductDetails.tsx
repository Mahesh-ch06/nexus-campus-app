
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Minus, Plus, Star, Clock, MapPin } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount_percentage: number;
  quantity: number;
  image_url: string;
  available_from: string;
  available_until: string;
  vendor_id: string;
  vendors?: {
    business_name: string;
  };
}

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({
  product,
  onBack,
  onAddToCart
}) => {
  const [quantity, setQuantity] = useState(1);
  
  const discountedPrice = product.price * (1 - product.discount_percentage / 100);
  const isAvailable = product.quantity > 0;
  const totalPrice = discountedPrice * quantity;

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    onBack();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Store
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div>
            <Card>
              <CardContent className="p-0">
                <div className="relative h-96 bg-muted rounded-lg flex items-center justify-center">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover rounded-lg"
                    />
                  ) : (
                    <span className="text-6xl">📦</span>
                  )}
                  {product.discount_percentage > 0 && (
                    <Badge className="absolute top-4 right-4 bg-red-500 text-white">
                      {product.discount_percentage}% OFF
                    </Badge>
                  )}
                  {!isAvailable && (
                    <Badge className="absolute top-4 left-4 bg-gray-500 text-white">
                      Out of Stock
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <MapPin className="h-4 w-4" />
                <span>{product.vendors?.business_name}</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Pricing */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold">₹{discountedPrice.toFixed(2)}</span>
                {product.discount_percentage > 0 && (
                  <span className="text-xl text-muted-foreground line-through">
                    ₹{product.price.toFixed(2)}
                  </span>
                )}
              </div>
              {product.discount_percentage > 0 && (
                <p className="text-green-600 font-medium">
                  You save ₹{(product.price - discountedPrice).toFixed(2)}
                </p>
              )}
            </div>

            {/* Availability */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm">
                  Available: {product.available_from} - {product.available_until}
                </span>
              </div>
              <div className={`text-sm ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                {isAvailable ? `${product.quantity} items in stock` : 'Out of stock'}
              </div>
            </div>

            {/* Quantity Selector */}
            {isAvailable && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Quantity</label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-medium">Total:</span>
                    <span className="text-2xl font-bold">₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleAddToCart}
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            )}

            {!isAvailable && (
              <div className="border-t pt-4">
                <Button className="w-full" size="lg" disabled>
                  Out of Stock
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
