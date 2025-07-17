import { useAchievements } from '@/hooks/useAchievements';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface AchievementsDisplayProps {
  showRefresh?: boolean;
  compact?: boolean;
}

export const AchievementsDisplay = ({ showRefresh = true, compact = false }: AchievementsDisplayProps) => {
  const { userAchievements, allAchievements, loading, refreshAchievements } = useAchievements();

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
        </CardContent>
      </Card>
    );
  }

  const unlockedIds = new Set(userAchievements.map(a => a.id));

  if (compact) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Achievements & Badges</h3>
          {showRefresh && (
            <Button variant="outline" size="sm" onClick={refreshAchievements}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {userAchievements.map((achievement) => (
            <Badge key={achievement.id} variant="secondary" className="flex items-center gap-1">
              <span className="text-lg">{achievement.icon}</span>
              <span className="text-xs">{achievement.name}</span>
            </Badge>
          ))}
          {userAchievements.length === 0 && (
            <p className="text-sm text-muted-foreground">No achievements yet. Keep using the app to unlock badges!</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Achievements & Badges</CardTitle>
            <CardDescription>
              {userAchievements.length} of {allAchievements.length} achievements unlocked
            </CardDescription>
          </div>
          {showRefresh && (
            <Button variant="outline" size="sm" onClick={refreshAchievements}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allAchievements.map((achievement) => {
            const isUnlocked = unlockedIds.has(achievement.id);
            const userAchievement = userAchievements.find(a => a.id === achievement.id);
            
            return (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isUnlocked 
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950' 
                    : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{achievement.name}</h4>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    {isUnlocked && userAchievement?.awarded_at && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        Unlocked {new Date(userAchievement.awarded_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {isUnlocked && (
                    <Badge variant="secondary" className="text-xs">
                      ✓
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {userAchievements.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-2">No achievements yet!</p>
            <p className="text-sm text-muted-foreground">
              Start using the app to unlock your first badges.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
