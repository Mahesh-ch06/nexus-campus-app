
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Voucher } from "@/services/pointsService";
import { Gift, Clock, Users, CheckCircle } from "lucide-react";

interface VoucherCardProps {
  voucher: Voucher;
  currentPoints: number;
  onRedeem: (voucherId: string) => void;
  loading?: boolean;
}

export const VoucherCard = ({ voucher, currentPoints, onRedeem, loading }: VoucherCardProps) => {
  const canRedeem = currentPoints >= voucher.points_required && voucher.current_redemptions < voucher.max_redemptions;
  const isExpired = voucher.valid_until && new Date() > new Date(voucher.valid_until);

  const getCategoryColor = (category: string) => {
    const colors = {
      'Shopping': 'bg-blue-500/10 text-blue-700',
      'Food': 'bg-orange-500/10 text-orange-700',
      'Coffee': 'bg-amber-500/10 text-amber-700',
      'Education': 'bg-green-500/10 text-green-700',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500/10 text-gray-700';
  };

  return (
    <Card className={`hover:shadow-lg transition-all duration-300 ${!canRedeem || isExpired ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold mb-2">{voucher.title}</CardTitle>
            <Badge className={getCategoryColor(voucher.category)}>
              {voucher.category}
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">${voucher.value}</div>
            <div className="text-sm text-muted-foreground">Value</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {voucher.description && (
          <p className="text-sm text-muted-foreground">{voucher.description}</p>
        )}
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1">
            <Gift className="w-4 h-4 text-primary" />
            <span className="font-semibold">{voucher.points_required} points</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {voucher.current_redemptions}/{voucher.max_redemptions} claimed
            </span>
          </div>
        </div>

        {voucher.valid_until && (
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Valid until {new Date(voucher.valid_until).toLocaleDateString()}</span>
          </div>
        )}

        {voucher.terms_conditions && (
          <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
            <strong>Terms:</strong> {voucher.terms_conditions}
          </div>
        )}

        <Button 
          onClick={() => onRedeem(voucher.id)}
          disabled={!canRedeem || isExpired || loading}
          className="w-full"
          variant={canRedeem && !isExpired ? "default" : "outline"}
        >
          {loading ? (
            "Processing..."
          ) : isExpired ? (
            "Expired"
          ) : voucher.current_redemptions >= voucher.max_redemptions ? (
            "Sold Out"
          ) : currentPoints < voucher.points_required ? (
            `Need ${voucher.points_required - currentPoints} more points`
          ) : (
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Redeem Now</span>
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
