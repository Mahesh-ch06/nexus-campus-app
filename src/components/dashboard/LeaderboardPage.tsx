
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy } from "lucide-react";
import { useLeaderboard, LeaderboardUser } from '@/hooks/useLeaderboard';
import { Skeleton } from "@/components/ui/skeleton";

const getRankDisplay = (rank: number) => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
};

const RankBadge = ({ rank }: { rank: number }) => (
  <span className={`flex items-center justify-center w-10 h-10 mx-auto rounded-full text-base font-bold ${
      rank === 1 ? 'bg-yellow-400/20 text-yellow-500' : 
      rank === 2 ? 'bg-gray-400/20 text-gray-500' : 
      rank === 3 ? 'bg-orange-500/20 text-orange-600' :
      'bg-muted text-muted-foreground'
    }`}>
    {getRankDisplay(rank)}
  </span>
);

const LeaderboardRow = ({ user }: { user: LeaderboardUser }) => (
  <TableRow key={user.user_id} className={user.is_current_user ? "bg-primary/10" : ""}>
    <TableCell className="w-[80px] text-center">
      <RankBadge rank={user.rank} />
    </TableCell>
    <TableCell>
      <div className="flex items-center space-x-3 sm:space-x-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.profile_picture_url || undefined} />
          <AvatarFallback className={user.is_current_user ? "bg-primary text-primary-foreground" : "bg-muted"}>
            {user.full_name?.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className={`font-medium ${user.is_current_user ? "text-primary" : ""}`}>
            {user.full_name} {user.is_current_user && '(You)'}
          </p>
          <p className="text-sm text-muted-foreground hidden sm:block">{user.department}</p>
        </div>
      </div>
    </TableCell>
    <TableCell className="text-right">
      <p className={`font-bold text-base sm:text-lg ${user.is_current_user ? "text-primary" : ""}`}>
        {user.activity_points.toLocaleString()}
      </p>
      <p className="text-xs text-muted-foreground">points</p>
    </TableCell>
  </TableRow>
);

const LeaderboardSkeleton = () => (
    <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
            <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
            </div>
        </div>
        <Skeleton className="h-36 w-full rounded-xl" />
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-2">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                        <Skeleton className="h-6 w-16" />
                    </div>
                ))}
            </CardContent>
        </Card>
    </div>
);

export const LeaderboardPage = () => {
    const { leaderboard, currentUserData, currentUserRank, isLoading } = useLeaderboard();

    if (isLoading) {
        return <LeaderboardSkeleton />;
    }

    const userForCard = currentUserData || leaderboard?.find(u => u.is_current_user);

    return (
        <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold">Leaderboard</h2>
                    <p className="text-muted-foreground text-sm sm:text-base">Top students by activity points</p>
                </div>
            </div>

            {userForCard && (
                <Card className="shadow-lg border-primary/20 bg-gradient-to-r from-blue-600 to-purple-600 text-primary-foreground overflow-hidden">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row items-center sm:justify-between space-y-4 sm:space-y-0">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-xl ring-2 ring-white/50">
                                  #{currentUserRank || userForCard.rank}
                                </div>
                                <Avatar className="h-12 w-12 border-2 border-white/50">
                                    <AvatarImage src={userForCard.profile_picture_url || undefined} />
                                    <AvatarFallback className="bg-transparent text-primary-foreground">
                                        {userForCard.full_name?.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-bold text-lg">{userForCard.full_name}</p>
                                    <p className="text-sm text-white/80">{userForCard.department}</p>
                                </div>
                            </div>
                            <div className="text-center sm:text-right">
                                <p className="text-3xl font-bold">{userForCard.activity_points.toLocaleString()}</p>
                                <p className="text-sm text-white/80">Activity Points</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Top 10 Rankings</CardTitle>
                </CardHeader>
                <CardContent>
                    {leaderboard.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[80px] text-center">Rank</TableHead>
                                        <TableHead>Student</TableHead>
                                        <TableHead className="text-right">Points</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {leaderboard.map((user) => (
                                        <LeaderboardRow key={user.user_id} user={user} />
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-muted-foreground">No active users on the leaderboard yet. Be the first!</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
