
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePoints } from "@/hooks/usePoints";
import { VoucherCard } from "@/components/points/VoucherCard";
import { PointsHistoryCard } from "@/components/points/PointsHistoryCard";
import { 
  getAvailableVouchers, 
  redeemVoucher, 
  Voucher 
} from "@/services/pointsService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gift, Coins, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Payments() {
  const { user } = useAuth();
  const { currentPoints, pointsHistory, loading: pointsLoading, refetch } = usePoints();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        setLoading(true);
        const vouchersData = await getAvailableVouchers();
        setVouchers(vouchersData);
      } catch (error) {
        console.error('Error fetching vouchers:', error);
        toast({
          title: "Error",
          description: "Failed to load vouchers",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, [toast]);

  const handleRedeemVoucher = async (voucherId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to redeem vouchers",
        variant: "destructive",
      });
      return;
    }

    try {
      setRedeeming(voucherId);

      // Get user's internal ID
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('supabase_uid', user.id)
        .single();

      if (!userData) {
        throw new Error('User not found');
      }

      const result = await redeemVoucher(voucherId, userData.id);

      if (result.success) {
        toast({
          title: "Voucher Redeemed!",
          description: `Your voucher code is: ${result.redemption?.redemption_code}`,
        });
        
        // Refresh points and vouchers
        refetch();
        const updatedVouchers = await getAvailableVouchers();
        setVouchers(updatedVouchers);
      } else {
        toast({
          title: "Redemption Failed",
          description: result.error || "Something went wrong",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error redeeming voucher:', error);
      toast({
        title: "Error",
        description: "Failed to redeem voucher",
        variant: "destructive",
      });
    } finally {
      setRedeeming(null);
    }
  };

  if (!user) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Please log in to access the rewards system
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Rewards & Vouchers</h1>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Coins className="w-5 h-5 text-yellow-500" />
            <span className="text-2xl font-bold">{currentPoints}</span>
            <span className="text-muted-foreground">points</span>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="vouchers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="vouchers" className="flex items-center space-x-2">
            <Gift className="w-4 h-4" />
            <span>Available Vouchers</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <History className="w-4 h-4" />
            <span>Points History</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vouchers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Gift className="w-5 h-5" />
                <span>Redeem Your Points</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-64 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : vouchers.length === 0 ? (
                <div className="text-center py-12">
                  <Gift className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Vouchers Available</h3>
                  <p className="text-muted-foreground">
                    Check back later for new vouchers to redeem with your points!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {vouchers.map((voucher) => (
                    <VoucherCard
                      key={voucher.id}
                      voucher={voucher}
                      currentPoints={currentPoints}
                      onRedeem={handleRedeemVoucher}
                      loading={redeeming === voucher.id}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <PointsHistoryCard 
            transactions={pointsHistory} 
            loading={pointsLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
