import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePartnerAuth } from '@/hooks/usePartnerAuth';
import { Clock, User, CheckCircle, XCircle, QrCode, AlertCircle, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Separator } from '@/components/ui/separator';

interface Order {
  id: string;
  status: string;
  total_price: number;
  service_fee: number;
  payment_method: string;
  pickup_deadline: string;
  qr_code: string;
  notes: string;
  created_at: string;
  users: {
    full_name: string;
    phone_number: string;
    email: string;
  };
  campus_order_items: {
    quantity: number;
    unit_price: number;
    subtotal: number;
    products: {
      name: string;
      image_url: string;
    };
  }[];
}

export const LiveOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { partner } = usePartnerAuth();
  const toast = useToast();

  const loadOrders = useCallback(async () => {
    if (!partner) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('campus_orders')
        .select(`
          *,
          users (full_name, phone_number, email),
          campus_order_items (
            quantity,
            unit_price,
            subtotal,
            products (name, image_url)
          )
        `)
        .eq('vendor_id', partner.id)
        .in('status', ['placed', 'accepted', 'ready'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Orders fetch error:', error);
        throw error;
      }
      
      console.log('Orders fetched successfully:', data?.length || 0);
      setOrders(data || []);
    } finally {
      setLoading(false);
    }
  }, [partner]);

  const setupRealtimeSubscription = useCallback(() => {
    if (!partner) return;

    console.log('Setting up realtime subscription for partner:', partner.id);
    
    const subscription = supabase
      .channel('partner_orders_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'campus_orders',
        filter: `vendor_id=eq.${partner.id}`
      }, (payload) => {
        console.log('New order received:', payload.new);
        loadOrders();
      })
      .subscribe();

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [partner, loadOrders]);

  useEffect(() => {
    loadOrders();
    const unsubscribe = setupRealtimeSubscription();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [loadOrders, setupRealtimeSubscription]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('campus_orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast.toast({
        title: "Order Updated",
        description: `Order ${newStatus} successfully`,
      });
      
      await loadOrders();
    } catch (error: unknown) {
      console.error('Error updating order:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update order";
      toast.toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'placed': return 'bg-blue-500';
      case 'accepted': return 'bg-yellow-500';
      case 'ready': return 'bg-green-500';
      case 'completed': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusActions = (order: Order) => {
    switch (order.status) {
      case 'placed':
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleStatusChange(order.id, 'accepted')}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleStatusChange(order.id, 'cancelled')}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </div>
        );
      case 'accepted':
        return (
          <Button
            size="sm"
            onClick={() => handleStatusChange(order.id, 'ready')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Mark Ready
          </Button>
        );
      case 'ready':
        return (
          <Button
            size="sm"
            onClick={() => handleStatusChange(order.id, 'completed')}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <QrCode className="h-4 w-4 mr-1" />
            Complete Pickup
          </Button>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-3 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Live Orders</h2>
      {loading ? (
        <div>Loading...</div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Active Orders</h3>
            <p className="text-muted-foreground">New orders will appear here</p>
          </CardContent>
        </Card>
      ) : (
        orders.map((order) => (
          <Card key={order.id} className="mb-4">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Order #{order.id.toString().slice(-6)}</span>
                <Badge style={{ backgroundColor: getStatusColor(order.status) }}>
                  {order.status}
                </Badge>
              </CardTitle>
              <CardDescription>
                {new Date(order.created_at).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {order.campus_order_items.map((item, index) => (
                  <li key={index} className="flex justify-between">
                    <span>{item.products.name} (x{item.quantity})</span>
                    <span>₹{item.subtotal.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>₹{order.total_price.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                className="p-2 border rounded"
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Preparing">Preparing</option>
                <option value="Ready">Ready for Pickup</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <Button onClick={() => handleStatusChange(order.id, "Confirmed")}>
                Confirm
              </Button>
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  );
};

export default LiveOrders;
