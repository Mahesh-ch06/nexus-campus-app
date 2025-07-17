
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Package, ShoppingCart, Clock } from 'lucide-react';

export const Analytics = () => {
  // Mock data for demonstration
  const stats = {
    todayRevenue: 1250,
    yesterdayRevenue: 980,
    totalOrders: 45,
    avgOrderValue: 278,
    topProducts: [
      { name: 'Chicken Biryani', orders: 12, revenue: 1440 },
      { name: 'Masala Dosa', orders: 8, revenue: 640 },
      { name: 'Coffee', orders: 15, revenue: 450 },
    ],
    recentTrends: {
      revenueGrowth: 27.5,
      orderGrowth: 15.2,
      avgOrderGrowth: 8.7
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics Dashboard</h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Revenue</p>
                <p className="text-2xl font-bold">₹{stats.todayRevenue}</p>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>+{stats.recentTrends.revenueGrowth}%</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>+{stats.recentTrends.orderGrowth}%</span>
                </div>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Order Value</p>
                <p className="text-2xl font-bold">₹{stats.avgOrderValue}</p>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>+{stats.recentTrends.avgOrderGrowth}%</span>
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Prep Time</p>
                <p className="text-2xl font-bold">18 min</p>
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <TrendingDown className="h-3 w-3" />
                  <span>-2 min</span>
                </div>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.orders} orders</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">₹{product.revenue}</p>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Chart will be implemented with recharts</p>
          </div>
        </CardContent>
      </Card>

      {/* Order Status Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Status Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Completed</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-muted rounded-full">
                    <div className="w-4/5 h-full bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-sm">32</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Pending</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-muted rounded-full">
                    <div className="w-1/4 h-full bg-yellow-500 rounded-full"></div>
                  </div>
                  <span className="text-sm">8</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Cancelled</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-muted rounded-full">
                    <div className="w-1/5 h-full bg-red-500 rounded-full"></div>
                  </div>
                  <span className="text-sm">5</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Peak Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>12:00 - 14:00</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-muted rounded-full">
                    <div className="w-full h-full bg-blue-500 rounded-full"></div>
                  </div>
                  <span className="text-sm">18 orders</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>19:00 - 21:00</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-muted rounded-full">
                    <div className="w-4/5 h-full bg-blue-500 rounded-full"></div>
                  </div>
                  <span className="text-sm">15 orders</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>09:00 - 11:00</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-muted rounded-full">
                    <div className="w-3/5 h-full bg-blue-500 rounded-full"></div>
                  </div>
                  <span className="text-sm">12 orders</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
