
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PointsTransaction } from "@/services/pointsService";
import { ArrowUpRight, ArrowDownRight, Gift, Calendar } from "lucide-react";

interface PointsHistoryCardProps {
  transactions: PointsTransaction[];
  loading?: boolean;
}

export const PointsHistoryCard = ({ transactions, loading }: PointsHistoryCardProps) => {
  const getTransactionIcon = (type: string, points: number) => {
    if (type === 'redeemed') return <Gift className="w-4 h-4" />;
    return points > 0 ? 
      <ArrowUpRight className="w-4 h-4 text-green-500" /> : 
      <ArrowDownRight className="w-4 h-4 text-red-500" />;
  };

  const getTransactionColor = (type: string, points: number) => {
    if (type === 'redeemed') return 'text-purple-600';
    return points > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getTransactionBadge = (type: string) => {
    const badgeMap = {
      earned: { variant: 'default' as const, label: 'Earned' },
      spent: { variant: 'destructive' as const, label: 'Spent' },
      redeemed: { variant: 'secondary' as const, label: 'Redeemed' }
    };
    return badgeMap[type as keyof typeof badgeMap] || badgeMap.earned;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Points History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Points History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No transaction history yet</p>
              <p className="text-sm">Start earning points by participating in activities!</p>
            </div>
          ) : (
            transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    {getTransactionIcon(transaction.transaction_type, transaction.points)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{transaction.reason}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge {...getTransactionBadge(transaction.transaction_type)}>
                        {getTransactionBadge(transaction.transaction_type).label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={`font-bold text-lg ${getTransactionColor(transaction.transaction_type, transaction.points)}`}>
                  {transaction.points > 0 ? '+' : ''}{transaction.points}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
