import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserProfile } from "@/services/userService";
import { Activity, Calendar, MessageSquare, Award, TrendingUp, Users, ArrowUpRight, ArrowDownRight, Gift, Coins } from "lucide-react";
import { usePoints } from "@/hooks/usePoints";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface ProfileActivityProps {
  profile: UserProfile;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}

interface TransactionItemProps {
  transaction: {
    id: string;
    transaction_type: string;
    points: number;
    reason: string;
    created_at: string;
  };
  index: number;
}

const TransactionItem = ({ transaction, index }: TransactionItemProps) => {
  const getTransactionIcon = (type: string, points: number) => {
    if (type === 'redeemed') return <Gift className="w-4 h-4 text-purple-500" />;
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

  return (
    <div 
      className="flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50 border border-gray-200/30 dark:border-gray-700/30 hover:scale-102 transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center space-x-3 min-w-0 flex-1">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          {getTransactionIcon(transaction.transaction_type, transaction.points)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-xs sm:text-sm truncate">{transaction.reason}</p>
          <div className="flex items-center space-x-2 mt-1">
            <Badge {...getTransactionBadge(transaction.transaction_type)} className="text-xs">
              {getTransactionBadge(transaction.transaction_type).label}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {new Date(transaction.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>
      </div>
      <div className={`font-bold text-sm sm:text-lg ${getTransactionColor(transaction.transaction_type, transaction.points)} flex-shrink-0`}>
        {transaction.points > 0 ? '+' : ''}{transaction.points}
      </div>
    </div>
  );
};

export const ProfileActivity = ({ profile }: ProfileActivityProps) => {
  const { pointsHistory, loading: pointsLoading } = usePoints();
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchActivity = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('activity_points_history')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        setActivity(data as unknown as Activity[]);
      } catch (error) {
        console.error("Error fetching activity:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [profile.id]);

  const recentActivities = [
    {
      type: "event",
      title: "Joined Tech Workshop",
      description: "Participated in AI & Machine Learning workshop",
      date: "2 days ago",
      icon: "🎯",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      type: "feedback",
      title: "Submitted Feedback",
      description: "Provided valuable feedback for campus services",
      date: "5 days ago",
      icon: "💬",
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      type: "achievement",
      title: "Earned New Badge",
      description: "Active Participant badge unlocked",
      date: "1 week ago",
      icon: "🏆",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    }
  ];

  const badges = Array.isArray(profile.engagement?.badges) ? profile.engagement.badges : [];
  const defaultBadges = [
    { name: "Early Adopter", icon: "🌟", description: "First 100 users" },
    { name: "Active Student", icon: "⚡", description: "Regular app usage" },
    { name: "Feedback Hero", icon: "💬", description: "Submitted 5+ feedbacks" }
  ];

  const displayBadges = badges.length > 0 ? badges : defaultBadges;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
      {/* Recent Activity */}
      <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 animate-scale-in">
        <CardHeader>
          <CardTitle className="flex items-center text-lg sm:text-xl">
            <Activity className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          {recentActivities.map((activity, index) => (
            <div 
              key={index} 
              className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50 border border-gray-200/30 dark:border-gray-700/30 hover:scale-102 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${activity.bgColor} flex items-center justify-center flex-shrink-0`}>
                <span className="text-lg sm:text-xl">{activity.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm sm:text-base mb-1 truncate">{activity.title}</h4>
                <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2">{activity.description}</p>
                <span className="text-xs text-muted-foreground">{activity.date}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Points History & Transactions */}
      <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 animate-scale-in">
        <CardHeader>
          <CardTitle className="flex items-center text-lg sm:text-xl">
            <Coins className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-yellow-500" />
            Points History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {/* Points Overview Stats */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="text-center p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/20 border border-blue-500/20 animate-fade-in">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{profile.engagement?.activity_points || 0}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Total Points</div>
            </div>
            <div className="text-center p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/20 border border-emerald-500/20 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="text-xl sm:text-2xl font-bold text-emerald-600">{pointsHistory.length}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Transactions</div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div>
            <h5 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
              Recent Transactions
            </h5>
            <div className="space-y-2 sm:space-y-3 max-h-64 sm:max-h-80 overflow-y-auto">
              {pointsLoading ? (
                // Loading skeleton for transactions
                [...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <Skeleton className="h-16 sm:h-20 w-full rounded-lg" />
                  </div>
                ))
              ) : pointsHistory.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-muted-foreground animate-fade-in">
                  <Calendar className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                  <p className="text-sm sm:text-base">No transactions yet</p>
                  <p className="text-xs sm:text-sm">Start earning points by participating!</p>
                </div>
              ) : (
                pointsHistory.slice(0, 5).map((transaction, index) => (
                  <TransactionItem key={transaction.id} transaction={transaction} index={index} />
                ))
              )}
            </div>
            {pointsHistory.length > 5 && (
              <div className="mt-3 sm:mt-4 text-center">
                <span className="text-xs sm:text-sm text-muted-foreground">
                  Showing 5 of {pointsHistory.length} transactions
                </span>
              </div>
            )}
          </div>

          {/* Progress Indicator */}
          <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/20 border border-purple-500/20 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs sm:text-sm font-semibold">Progress to Next Level</span>
              <span className="text-xs sm:text-sm text-muted-foreground">Level {Math.floor((profile.engagement?.activity_points || 0) / 100) + 1}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 sm:h-3">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 sm:h-3 rounded-full transition-all duration-1000 animate-scale-in"
                style={{ 
                  width: `${((profile.engagement?.activity_points || 0) % 100)}%`,
                  animationDelay: '500ms'
                }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements & Badges - Full Width on Mobile */}
      <Card className="lg:col-span-2 shadow-xl hover:shadow-2xl transition-all duration-300 animate-scale-in" style={{ animationDelay: '200ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center text-lg sm:text-xl">
            <Award className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-yellow-500" />
            Achievements & Badges
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {/* Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            {displayBadges.slice(0, 6).map((badge, index) => (
              <div 
                key={index} 
                className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/20 border border-yellow-500/20 hover:scale-105 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${(index + 3) * 100}ms` }}
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg flex-shrink-0">
                  <span className="text-sm sm:text-base">{typeof badge === 'object' ? badge.icon : '🏆'}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-xs sm:text-sm truncate">
                    {typeof badge === 'object' ? badge.name : badge}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {typeof badge === 'object' ? badge.description : 'Achievement earned'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
