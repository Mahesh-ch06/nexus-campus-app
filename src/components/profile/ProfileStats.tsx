
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserProfile } from "@/services/userService";
import { BookOpen, Award, TrendingUp, Users, Calendar, Star, Trophy, Target, Zap } from "lucide-react";

interface ProfileStatsProps {
  profile: UserProfile;
}

export const ProfileStats = ({ profile }: ProfileStatsProps) => {
  const stats = [
    {
      title: "Academic Excellence",
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-gradient-to-br from-blue-500/10 to-blue-600/20",
      borderColor: "border-blue-500/30",
      items: [
        { label: "Department", value: profile.department, icon: "🏛️" },
        { label: "Academic Year", value: profile.academic_year, icon: "📚" },
        { label: "Hall Ticket", value: profile.hall_ticket, icon: "🎫" },
        { label: "Current Semester", value: profile.academic_info?.current_semester || "Not set", icon: "📖" }
      ]
    },
    {
      title: "Engagement & Activity",
      icon: Trophy,
      color: "text-emerald-600",
      bgColor: "bg-gradient-to-br from-emerald-500/10 to-green-600/20",
      borderColor: "border-emerald-500/30",
      items: [
        { label: "Activity Points", value: `${profile.engagement?.activity_points || 0} pts`, icon: "⚡" },
        { label: "Events Attended", value: `${profile.engagement?.events_attended?.length || 0} events`, icon: "🎉" },
        { label: "Feedback Given", value: `${profile.engagement?.feedback_count || 0} times`, icon: "💬" },
        { label: "Badges Earned", value: `${Array.isArray(profile.engagement?.badges) ? profile.engagement.badges.length : 0} badges`, icon: "🏆" }
      ]
    },
    {
      title: "Account & Preferences",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-gradient-to-br from-purple-500/10 to-indigo-600/20",
      borderColor: "border-purple-500/30",
      items: [
        { label: "Theme", value: profile.preferences?.theme || "System", icon: "🎨" },
        { label: "Language", value: profile.preferences?.language || "English", icon: "🌐" },
        { label: "Notifications", value: profile.preferences?.notifications_enabled ? "Enabled" : "Disabled", icon: "🔔" },
        { label: "Member Since", value: new Date(profile.created_at).toLocaleDateString(), icon: "📅" }
      ]
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
      {stats.map((section) => {
        const Icon = section.icon;
        return (
          <Card key={section.title} className={`hover:shadow-2xl transition-all duration-500 hover:scale-105 border-2 ${section.borderColor} ${section.bgColor} backdrop-blur-sm`}>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center text-lg sm:text-xl font-bold">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${section.bgColor} flex items-center justify-center mr-3 sm:mr-4 shadow-lg`}>
                  <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${section.color}`} />
                </div>
                <span className={`${section.color} text-sm sm:text-base lg:text-lg`}>{section.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {section.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-300">
                  <div className="flex items-center min-w-0 flex-1">
                    <span className="text-base sm:text-lg mr-2 sm:mr-3 flex-shrink-0">{item.icon}</span>
                    <span className="text-xs sm:text-sm text-muted-foreground font-semibold truncate">{item.label}</span>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-right max-w-[45%] sm:max-w-[60%] truncate ml-2">
                    {item.value}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
