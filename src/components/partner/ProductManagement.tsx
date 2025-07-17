import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Package } from 'lucide-react';
import { usePartnerAuth } from '@/hooks/usePartnerAuth';
import { toast } from 'sonner';

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
  is_active: boolean;
  available_from?: string;
  available_until?: string;
}

export const ProductManagement = () => {
  const { partner } = usePartnerAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addMode, setAddMode] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    discount: '',
    quantity: '',
    category_id: '',
    image_url: '',
    available_from: '09:00',
    available_until: '18:00',
  });
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  const fetchProducts = useCallback(async () => {
    if (!partner) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('vendor_id', partner.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      setProducts(data || []);
      console.log("Fetched products (Partner):", data, error, "PartnerId:", partner.id);
    } finally {
      setLoading(false);
    }
  }, [partner]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('store_categories')
      .select('id,name')
      .eq('active', true)
      .order('display_order');
    if (!error && data) setCategories(data);
    console.log("Fetched categories (Partner):", data, error);
  };

  useEffect(() => {
    if (partner?.id) fetchProducts();
    fetchCategories();
  }, [partner?.id, fetchProducts]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partner?.id) {
      toast.error("Not authorized. Please log in again.");
      return;
    }
    if (!form.name || !form.price || !form.category_id) {
      toast.error("Product name, price, and category are required.");
      return;
    }

    const { error } = await supabase.from('products').insert([{
      name: form.name,
      description: form.description,
      price: Number(form.price),
      discount_percentage: Number(form.discount || 0),
      quantity: Number(form.quantity || 0),
      vendor_id: partner.id,
      category_id: form.category_id,
      is_active: true,
      image_url: form.image_url || null,
      available_from: form.available_from || null,
      available_until: form.available_until || null,
    }]);

    if (error) {
      console.error('Failed to add product:', error);
      toast.error(`Failed to add product: ${error.message}`);
      return;
    }
    
    toast.success("Product added successfully!");
    setAddMode(false);
    setForm({ name: '', description: '', price: '', discount: '', quantity: '', category_id: '', image_url: '', available_from: '09:00', available_until: '18:00' });
    fetchProducts();
  };

  const removeProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    const { error } = await supabase.from('products').update({ is_active: false }).eq('id', id);

    if (error) {
      toast.error(`Failed to delete product: ${error.message}`);
      console.error('Failed to remove product:', error);
      return;
    }

    toast.success("Product removed successfully.");
    fetchProducts();
  };

  const getProductStatus = (product: Product): { text: string; variant: "default" | "secondary" | "destructive" | "outline" | null | undefined } => {
    if (!product.available_from || !product.available_until) {
        return { text: 'Always on', variant: 'secondary' };
    }
    try {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const [fromHour, fromMinute] = product.available_from.split(':').map(Number);
        const fromTime = fromHour * 60 + fromMinute;
        const [untilHour, untilMinute] = product.available_until.split(':').map(Number);
        const untilTime = untilHour * 60 + untilMinute;

        if (currentTime >= fromTime && currentTime <= untilTime) {
            return { text: 'Available', variant: 'default' };
        } else {
            return { text: 'Unavailable', variant: 'destructive' };
        }
    } catch (e) {
        console.error("Error parsing product availability time:", e);
        return { text: 'Invalid Time', variant: 'destructive' };
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Your Products</h3>
        <Button onClick={() => setAddMode(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Product
        </Button>
      </div>
      {addMode && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Product Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                <Input placeholder="Price" type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
              </div>
              <Input placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Discount (%)" type="number" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} />
                <Input placeholder="Quantity" type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} />
              </div>
              <Input placeholder="Image URL" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} />
              <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" required value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
                <option value="">Select Category</option>
                {categories.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <label className="text-sm font-medium text-muted-foreground">Available From</label>
                      <Input type="time" value={form.available_from} onChange={e => setForm(f => ({ ...f, available_from: e.target.value }))} />
                  </div>
                  <div>
                      <label className="text-sm font-medium text-muted-foreground">Available Until</label>
                      <Input type="time" value={form.available_until} onChange={e => setForm(f => ({ ...f, available_until: e.target.value }))} />
                  </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Submit</Button>
                <Button type="button" variant="ghost" onClick={() => setAddMode(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
            <Package className="mx-auto h-12 w-12" />
            <h3 className="mt-2 text-sm font-medium">No products yet.</h3>
            <p className="mt-1 text-sm">Add your first product to get started.</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px] hidden sm:table-cell">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map(p => {
                    const status = getProductStatus(p);
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="hidden sm:table-cell">
                          <img alt={p.name} className="aspect-square rounded-md object-cover bg-muted" height="64" src={p.image_url || `https://via.placeholder.com/64/E0E0E0/000000?text=${p.name.charAt(0)}`} width="64" />
                        </TableCell>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>{p.quantity > 0 ? `${p.quantity} in stock` : 'Out of stock'}</TableCell>
                        <TableCell>
                           <div className="flex flex-col">
                              <span className={p.discount_percentage > 0 ? "line-through text-muted-foreground text-xs" : ""}>
                                  ₹{p.price.toFixed(2)}
                              </span>
                              {p.discount_percentage > 0 && (
                                  <span className="font-semibold">
                                      ₹{(p.price - (p.price * p.discount_percentage / 100)).toFixed(2)}
                                  </span>
                              )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>{status.text}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => removeProduct(p.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
