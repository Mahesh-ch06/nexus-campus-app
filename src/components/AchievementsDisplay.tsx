import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAchievements } from '@/hooks/useAchievements';
import { Coins, Trophy, Star, Zap, MessageSquare, Calendar, Award } from 'lucide-react';

const getAchievementIcon = (category: string, name: string) => {
  switch (category) {
    case 'welcome':
      return <Star className="h-5 w-5 text-yellow-500" />;
    case 'engagement':
      if (name.includes('Active')) return <Zap className="h-5 w-5 text-blue-500" />;
      if (name.includes('Feedback')) return <MessageSquare className="h-5 w-5 text-green-500" />;
      return <Trophy className="h-5 w-5 text-purple-500" />;
    case 'points':
      return <Coins className="h-5 w-5 text-yellow-600" />;
    case 'events':
      return <Calendar className="h-5 w-5 text-red-500" />;
    default:
      return <Award className="h-5 w-5 text-gray-500" />;
  }
};

const getAchievementColor = (category: string) => {
  switch (category) {
    case 'welcome':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'engagement':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'points':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'events':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const AchievementBadge: React.FC<{ 
  name: string; 
  category: string; 
  earned: boolean;
  progress?: number;
}> = ({ name, category, earned, progress = 0 }) => {
  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg border ${
      earned ? getAchievementColor(category) : 'bg-gray-50 text-gray-400 border-gray-200'
    }`}>
      {getAchievementIcon(category, name)}
      <span className="text-sm font-medium">{name}</span>
      {!earned && progress > 0 && (
        <div className="ml-auto text-xs">
          {progress}%
        </div>
      )}
    </div>
  );
};

export const AchievementsGrid: React.FC = () => {
  const { userProgress, stats, loading, error } = useAchievements();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500">Loading achievements...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500">Error loading achievements</div>
        </CardContent>
      </Card>
    );
  }

  const earnedAchievements = userProgress.filter(p => p.earned);
  const inProgressAchievements = userProgress.filter(p => !p.earned && p.progress > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Achievements
        </CardTitle>
        <CardDescription>
          {stats.earned} of {stats.total} achievements unlocked
        </CardDescription>
        <Progress value={(stats.earned / stats.total) * 100} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        {earnedAchievements.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2 text-green-700">Unlocked</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {earnedAchievements.map((achievement) => (
                <AchievementBadge
                  key={achievement.achievement.id}
                  name={achievement.achievement.name}
                  category={achievement.achievement.category}
                  earned={true}
                />
              ))}
            </div>
          </div>
        )}

        {inProgressAchievements.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2 text-blue-700">In Progress</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {inProgressAchievements.map((achievement) => (
                <div key={achievement.achievement.id} className="space-y-1">
                  <AchievementBadge
                    name={achievement.achievement.name}
                    category={achievement.achievement.category}
                    earned={false}
                    progress={achievement.progress}
                  />
                  <Progress value={achievement.progress} className="h-1" />
                </div>
              ))}
            </div>
          </div>
        )}

        {earnedAchievements.length === 0 && inProgressAchievements.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <Trophy className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No achievements yet!</p>
            <p className="text-sm">Start using the app to unlock badges and rewards.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const WelcomeRewardToast: React.FC<{
  coins: number;
  achievements: string[];
}> = ({ coins, achievements }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Coins className="h-5 w-5 text-yellow-500" />
        <span className="font-semibold">+{coins} Coins</span>
      </div>
      {achievements.map((achievement) => (
        <div key={achievement} className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-purple-500" />
          <Badge variant="secondary" className="text-xs">
            {achievement}
          </Badge>
        </div>
      ))}
    </div>
  );
};
