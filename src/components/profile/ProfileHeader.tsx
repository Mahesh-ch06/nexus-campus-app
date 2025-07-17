
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserProfile } from "@/services/userService";
import { Edit, MapPin, Calendar, Phone, Mail, IdCard, Trophy } from "lucide-react";

interface ProfileHeaderProps {
  profile: UserProfile;
  onEditClick: () => void;
}

export const ProfileHeader = ({ profile, onEditClick }: ProfileHeaderProps) => {
  return (
    <Card className="relative overflow-hidden shadow-2xl">
      {/* Enhanced Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700" />
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/20 via-blue-500/20 to-purple-600/20" />
      
      <CardContent className="relative p-4 sm:p-6 lg:p-8 text-white">
        <div className="flex flex-col items-center gap-4 sm:gap-6 lg:flex-row lg:items-start">
          {/* Enhanced Profile Picture */}
          <div className="relative flex-shrink-0">
            <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full opacity-75 blur-lg"></div>
            <Avatar className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36 border-4 border-white/30 shadow-2xl">
              <AvatarImage src={profile.profile_picture_url || undefined} />
              <AvatarFallback className="bg-white/10 text-white text-2xl sm:text-4xl lg:text-5xl font-bold backdrop-blur-sm">
                {profile.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 sm:border-4 border-white/30 flex items-center justify-center shadow-lg">
              <div className="w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 bg-white rounded-full animate-pulse" />
            </div>
          </div>

          {/* Enhanced Profile Info */}
          <div className="flex-1 text-center lg:text-left space-y-3 sm:space-y-4 lg:space-y-6 w-full">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-1 sm:mb-2 lg:mb-3 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent break-words">
                {profile.full_name}
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-white/90 mb-1 sm:mb-2 font-semibold break-words">{profile.department}</p>
              <p className="text-base sm:text-lg lg:text-xl text-white/80">{profile.academic_year} Student</p>
            </div>

            {/* Enhanced Badges */}
            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center lg:justify-start">
              <Badge variant="secondary" className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-white border-white/30 px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 text-xs sm:text-sm font-semibold backdrop-blur-sm">
                <IdCard className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">ID: </span>{profile.hall_ticket}
              </Badge>
              <Badge variant="secondary" className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-white border-white/30 px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 text-xs sm:text-sm font-semibold backdrop-blur-sm">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                {profile.email_verified ? 'Verified' : 'Unverified'}
              </Badge>
              <Badge variant="secondary" className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border-white/30 px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 text-xs sm:text-sm font-semibold backdrop-blur-sm">
                <Trophy className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                {profile.engagement?.activity_points || 0} Points
              </Badge>
            </div>

            {/* Enhanced Contact Quick View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm text-white/90 w-full">
              <div className="flex items-center gap-2 sm:gap-3 bg-white/10 rounded-lg sm:rounded-xl p-2 sm:p-3 backdrop-blur-sm min-w-0">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300 flex-shrink-0" />
                <span className="truncate text-xs sm:text-sm">{profile.email}</span>
              </div>
              {profile.phone_number && (
                <div className="flex items-center gap-2 sm:gap-3 bg-white/10 rounded-lg sm:rounded-xl p-2 sm:p-3 backdrop-blur-sm">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-green-300 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">{profile.phone_number}</span>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Edit Button */}
          <div className="flex flex-col gap-2 sm:gap-4 w-full lg:w-auto">
            <Button 
              onClick={onEditClick}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm px-4 py-2 sm:px-6 sm:py-2.5 lg:px-8 lg:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 hover:scale-105 w-full lg:w-auto"
              size="default"
            >
              <Edit className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
