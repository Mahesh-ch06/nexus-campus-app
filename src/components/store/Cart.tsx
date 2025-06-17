import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Minus, Plus, Trash2, MapPin, AlertTriangle, RefreshCw, ShoppingBag, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { usePasswordVerification } from '@/hooks/usePasswordVerification';
import { PasswordVerificationDialog } from '@/components/PasswordVerificationDialog';
import { useIsMobile } from '@/hooks/use-mobile';

interface CartItem {
  id: string;
  name: string;
  price: number;
  discount_percentage: number;
  quantity: number;
  vendor_id: string;
  vendors?: {
    business_name: string;
  };
}

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onBack: () => void;
  subtotal: number;
  serviceFee: number;
}

export const Cart: React.FC<CartProps> = ({
  items,
  onUpdateQuantity,
  onBack,
  subtotal,
  serviceFee
}) => {
  const isMobile = useIsMobile();
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [notes, setNotes] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const {
    isVerified,
    showPasswordDialog,
    setShowPasswordDialog,
    verifyPassword,
    requestVerification,
    getPasswordFormat,
    hasProfile
  } = usePasswordVerification();

  const total = subtotal + serviceFee;

  // Group items by vendor
  const groupedItems = items.reduce((acc, item) => {
    const vendorId = item.vendor_id;
    if (!acc[vendorId]) {
      acc[vendorId] = {
        vendor: item.vendors?.business_name || 'Unknown Vendor',
        items: []
      };
    }
    acc[vendorId].items.push(item);
    return acc;
  }, {} as Record<string, { vendor: string; items: CartItem[] }>);

  const handlePlaceOrder = async () => {
    console.log('[Cart] 🛒 Place order triggered');
    
    if (!isVerified) {
      console.log('[Cart] 🔒 User not verified, requesting password verification');
      requestVerification();
      return;
    }

    console.log('[Cart] 📊 Auth state check:', {
      hasUser: !!user,
      firebaseUID: user?.uid,
      timestamp: new Date().toISOString()
    });

    if (!user) {
      console.log('[Cart] ❌ No Firebase user found');
      toast({
        title: "Authentication Required",
        description: "Please log in to place an order",
        variant: "destructive"
      });
      return;
    }

    setIsPlacingOrder(true);

    try {
      console.log('[Cart] 🚀 Starting order placement process...');
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('firebase_uid', user.uid)
        .single();

      if (userError || !userData) {
        console.error('[Cart] ❌ Error finding user:', userError);
        toast({
          title: "User Error",
          description: "Could not find your user profile. Please try logging out and back in.",
          variant: "destructive"
        });
        return;
      }

      const userUuid = userData.id;
      console.log('[Cart] ✅ Found user UUID:', userUuid);

      for (const [vendorId, group] of Object.entries(groupedItems)) {
        console.log('[Cart] 🏪 Processing vendor:', vendorId);
        
        const vendorSubtotal = group.items.reduce((sum, item) => {
          const discountedPrice = item.price * (1 - item.discount_percentage / 100);
          return sum + (discountedPrice * item.quantity);
        }, 0);

        const vendorServiceFee = serviceFee / Object.keys(groupedItems).length;
        const qrCode = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const { data: orderData, error: orderError } = await supabase
          .from('campus_orders')
          .insert({
            student_id: userUuid,
            vendor_id: vendorId,
            total_price: vendorSubtotal + vendorServiceFee,
            service_fee: vendorServiceFee,
            payment_method: paymentMethod,
            qr_code: qrCode,
            notes: notes || null,
            pickup_deadline: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          })
          .select()
          .single();

        if (orderError) {
          console.error('[Cart] ❌ Error inserting into campus_orders:', orderError);
          throw orderError;
        }

        console.log('[Cart] ✅ Order created successfully:', orderData);

        const orderItems = group.items.map(item => ({
          order_id: orderData.id,
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price * (1 - item.discount_percentage / 100),
          subtotal: (item.price * (1 - item.discount_percentage / 100)) * item.quantity
        }));

        const { error: itemsError } = await supabase
          .from('campus_order_items')
          .insert(orderItems);

        if (itemsError) {
          console.error('[Cart] ❌ Error inserting campus_order_items:', itemsError);
          throw itemsError;
        }

        console.log('[Cart] ✅ Order items added successfully');
      }

      console.log('[Cart] 🎉 All orders placed successfully');

      toast({
        title: "🎉 Order Placed Successfully!",
        description: `Your order${Object.keys(groupedItems).length > 1 ? 's' : ''} ${Object.keys(groupedItems).length > 1 ? 'have' : 'has'} been placed. You'll receive updates as vendors accept your order.`,
      });

      items.forEach(item => onUpdateQuantity(item.id, 0));
      onBack();

    } catch (error: any) {
      const errorDesc =
        (error?.message || error?.description || "") +
        (error?.details ? ` (${error.details})` : "");
      console.error('[Cart] ❌ Error placing order:', error);
      toast({
        title: "Error",
        description: errorDesc || "Failed to place order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background px-2 sm:px-4 pt-4 pb-16">
        <Button variant="ghost" onClick={onBack} className="mb-6 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Store
        </Button>
        <div className="text-center py-16">
          <div className="text-8xl mb-6">🛒</div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">Your Cart is Empty</h2>
          <p className="text-muted-foreground mb-8 text-base sm:text-lg">Add some delicious items to get started</p>
          <Button onClick={onBack} className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-full text-base sm:text-lg">
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-1 sm:px-0">
      <div className="container mx-auto px-1 sm:px-4 py-3 sm:py-6 max-w-2xl md:max-w-6xl">
        <Button variant="ghost" onClick={onBack} className="mb-4 sm:mb-6 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Store
        </Button>

        <div className="flex items-center gap-2 sm:gap-3 mb-5 sm:mb-8">
          <ShoppingBag className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Your Cart</h1>
          <Badge className="bg-primary/10 text-primary px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm">
            {items.reduce((sum, item) => sum + item.quantity, 0)} items
          </Badge>
        </div>

        {!user && (
          <Card className="mb-4 sm:mb-6 border-amber-200 bg-amber-50/10 backdrop-blur-sm">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center gap-4">
                <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-amber-800 dark:text-amber-200 mb-1">Authentication Required</p>
                  <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300">Please log in to place an order.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className={`flex flex-col-reverse gap-6 lg:grid lg:grid-cols-3 lg:gap-8`}>
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {Object.entries(groupedItems).map(([vendorId, group]) => (
              <Card key={vendorId} className="shadow-xl border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3 sm:pb-4 bg-gradient-to-r from-primary/10 to-purple-600/10">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    <CardTitle className="text-lg sm:text-xl text-foreground">{group.vendor}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 space-y-3 sm:space-y-4">
                  {group.items.map((item) => {
                    const discountedPrice = item.price * (1 - item.discount_percentage / 100);
                    const itemTotal = discountedPrice * item.quantity;

                    return (
                      <div key={item.id} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-3 sm:p-4 border border-border/50 rounded-xl bg-card/30 backdrop-blur-sm hover:shadow-md transition-shadow gap-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-base sm:text-lg text-foreground">{item.name}</h4>
                          <div className="flex items-center gap-2 sm:gap-3 mt-1 sm:mt-2">
                            <span className="font-bold text-green-600 dark:text-green-400 text-base sm:text-lg">₹{discountedPrice.toFixed(2)}</span>
                            {item.discount_percentage > 0 && (
                              <>
                                <span className="text-xs sm:text-sm text-muted-foreground line-through">
                                  ₹{item.price.toFixed(2)}
                                </span>
                                <Badge variant="secondary" className="bg-destructive/10 text-destructive text-[10px] sm:text-xs">
                                  {item.discount_percentage}% OFF
                                </Badge>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="flex items-center gap-1 sm:gap-2 bg-muted/50 rounded-full p-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full hover:bg-muted"
                              onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-7 sm:w-8 text-center font-semibold">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full hover:bg-muted"
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-right min-w-[60px] sm:min-w-[80px]">
                            <p className="font-bold text-base sm:text-lg text-foreground">₹{itemTotal.toFixed(2)}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => onUpdateQuantity(item.id, 0)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="space-y-4 sm:space-y-6">
            <Card className="shadow-xl border-border/50 bg-card/50 backdrop-blur-sm sticky top-2 sm:top-4">
              <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10">
                <div className="flex items-center gap-1 sm:gap-2">
                  <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                  <CardTitle className="text-lg sm:text-xl text-foreground">Order Summary</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between text-base sm:text-lg">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base sm:text-lg">
                    <span className="text-muted-foreground">Service Fee</span>
                    <span className="font-semibold">₹{serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 sm:pt-3">
                    <div className="flex justify-between font-bold text-xl sm:text-2xl">
                      <span className="text-foreground">Total</span>
                      <span className="text-green-600 dark:text-green-400">₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-4">
                  <div>
                    <label className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3 block text-foreground">
                      Payment Method
                    </label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger className="w-full border-2 border-border bg-card/50 backdrop-blur-sm rounded-xl p-3 text-xs sm:text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="cod">💵 Cash on Delivery</SelectItem>
                        <SelectItem value="wallet">💳 Campus Wallet</SelectItem>
                        <SelectItem value="upi">📱 UPI</SelectItem>
                        <SelectItem value="card">💳 Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3 block text-foreground">
                      Special Instructions (Optional)
                    </label>
                    <Textarea
                      placeholder="Any special requests or instructions..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="border-2 border-border bg-card/50 backdrop-blur-sm rounded-xl resize-none placeholder:text-muted-foreground text-xs sm:text-base"
                    />
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold shadow-lg transition-all duration-200 transform hover:scale-105"
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder || !user}
                >
                  {isPlacingOrder ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Placing Order...
                    </>
                  ) : (
                    `🛍️ Place Order • ₹${total.toFixed(2)}`
                  )}
                </Button>

                <p className="text-[10px] sm:text-xs text-muted-foreground text-center leading-relaxed">
                  Orders will be split by vendor. You'll receive separate QR codes for each vendor. 
                  Estimated pickup time: 15-30 minutes.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <PasswordVerificationDialog
        isOpen={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
        onVerify={verifyPassword}
        getPasswordFormat={getPasswordFormat}
        hasProfile={hasProfile}
      />
    </div>
  );
};
