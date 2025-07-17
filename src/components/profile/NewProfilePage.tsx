import { useUserProfile } from "@/hooks/useUserProfile";
import { CreateProfileForm } from "./CreateProfileForm";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileStats } from "./ProfileStats";
import { ProfileActivity } from "./ProfileActivity";
import { EditProfileForm } from "./EditProfileForm";
import { PointsHistoryCard } from "@/components/points/PointsHistoryCard";
import { usePoints } from "@/hooks/usePoints";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";
import { QrCodeDisplay } from "./QrCodeDisplay";

const ProfileSkeleton = () => (
  <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-4 sm:p-6">
    <div className="relative overflow-hidden rounded-lg sm:rounded-xl">
      <Skeleton className="h-48 sm:h-56 lg:h-64 w-full" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-40 sm:h-48 w-full rounded-lg" />
        </div>
      ))}
    </div>
  </div>
);

export const NewProfilePage = () => {
  const { profile, loading, refetch } = useUserProfile();
  const { pointsHistory, loading: pointsLoading } = usePoints();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return (
      <div className="p-4 sm:p-6">
        <CreateProfileForm onSuccess={refetch} />
      </div>
    );
  }

  const handleUpdateSuccess = () => {
    refetch();
    setIsEditDialogOpen(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 max-w-7xl mx-auto p-4 sm:p-6">
      {/* Profile Header */}
      <ProfileHeader 
        profile={profile} 
        onEditClick={() => setIsEditDialogOpen(true)} 
      />

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="points">Points History</TabsTrigger>
          <TabsTrigger value="id">Digital ID</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ProfileStats profile={profile} />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <ProfileActivity profile={profile} />
        </TabsContent>

        <TabsContent value="points" className="space-y-6">
          <PointsHistoryCard 
            transactions={pointsHistory} 
            loading={pointsLoading}
          />
        </TabsContent>

        <TabsContent value="id" className="space-y-6">
          <QrCodeDisplay value={profile.id} studentName={profile.full_name} />
        </TabsContent>
      </Tabs>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] mx-4">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <EditProfileForm 
            profile={profile} 
            onSuccess={handleUpdateSuccess} 
            setOpen={setIsEditDialogOpen} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
