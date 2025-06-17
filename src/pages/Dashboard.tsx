import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { 
  User, ShoppingBag, Calendar, CreditCard, FileText, Store, MessageSquare, Users,
  TrendingUp, BookOpen, Target, Newspaper, MessageCircle, Bot, Briefcase, Shield,
  Settings, LogOut, Bell, Clock, Zap, Menu, X, Package, Trophy, UserCog, IdCard, RotateCcw
} from "lucide-react";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { NewProfilePage } from "@/components/profile/NewProfilePage";
import { EventsAndClubsPage } from "@/components/events/EventsAndClubsPage";
import { IdCardPage } from "@/components/id-card/IdCardPage";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { LeaderboardPage } from "@/components/dashboard/LeaderboardPage";
import { CampusStorePage } from "@/components/store/CampusStorePage";

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { profile } = useUserProfile();
  const { user, signOut, cleanupAndReload, supabaseSession } = useAuth();
  const navigate = useNavigate();
  const { currentUserRank, currentUserData } = useLeaderboard();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleProfileClick = () => {
    setActiveSection("profile");
  };

  const dashboardSections = [
    { id: "overview", label: "Dashboard", icon: TrendingUp },
    { id: "profile", label: "Profile", icon: User },
    { id: "id-card", label: "Digital ID Card", icon: IdCard },
    { id: "orders", label: "My Orders", icon: Package },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
    { id: "services", label: "Services", icon: ShoppingBag },
    { id: "events", label: "Events & Clubs", icon: Calendar },
    { id: "club-admin", label: "Club Admin", icon: UserCog },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "forms", label: "Forms", icon: FileText },
    { id: "store", label: "Campus Store", icon: Store },
    { id: "feedback", label: "Feedback", icon: MessageSquare },
    { id: "mentor", label: "Mentor", icon: Users },
  ];

  const advancedFeatures = [
    { id: "progress", label: "Academic Progress", icon: TrendingUp },
    { id: "notes", label: "Notes & Planner", icon: BookOpen },
    { id: "gamification", label: "Achievements", icon: Target },
    { id: "news", label: "Campus News", icon: Newspaper },
    { id: "connect", label: "Peer Connect", icon: MessageCircle },
    { id: "ai", label: "AI Assistant", icon: Bot },
    { id: "career", label: "Career Hub", icon: Briefcase },
    { id: "vault", label: "Document Vault", icon: Shield },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-950 dark:to-blue-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const handleSectionSelect = (section: string) => {
    if (section === "club-admin") {
      navigate("/club-admin-login");
      return;
    }
    setActiveSection(section);
    setIsSidebarOpen(false);
  };
  
  const handleMobileSignOut = () => {
    handleSignOut();
    setIsSidebarOpen(false);
  }

  const handleLeaderboardClick = () => {
    setActiveSection("leaderboard");
    setIsSidebarOpen(false);
  };

  // Get current date and format it as "Month DD, YYYY"
  const todayStr = format(new Date(), "MMMM d, yyyy");

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden h-8 w-8 sm:h-10 sm:w-10" 
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="sr-only">Open Menu</span>
            </Button>
            <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CampusConnect
            </h1>
            <Badge variant="outline" className="hidden sm:inline-flex text-primary border-primary/30 text-xs">
              Student Portal
            </Badge>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-4">
            <Button variant="ghost" size="icon" className="relative h-8 w-8 sm:h-10 sm:w-10">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="absolute -top-1 -right-1 h-2 w-2 sm:h-3 sm:w-3 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground">
                3
              </span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full p-0">
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                    <AvatarImage src={profile?.profile_picture_url || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">
                      {profile?.full_name?.split(' ').map(n => n[0]).join('') || user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium text-sm">
                      {profile?.full_name || user.displayName || user.email?.split('@')[0]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {profile?.hall_ticket || 'CS21B0001'}
                    </p>
                    <div className="text-xs text-muted-foreground mt-1">
                      Session: {supabaseSession ? '✓ Active' : '✗ Missing'}
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleProfileClick}>
                  <User className="mr-2 h-4 w-4" />
                  <span>My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={cleanupAndReload}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  <span>Fix Auth Issues</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium truncate max-w-32 lg:max-w-none">
                {profile?.full_name || user.displayName || user.email?.split('@')[0]}
              </p>
              <p className="text-xs text-muted-foreground">{profile?.hall_ticket || 'CS21B0001'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}
        
        <aside className={`fixed top-0 left-0 z-50 w-80 sm:w-72 h-screen bg-card/98 backdrop-blur-xl border-r border-border transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between p-4 border-b border-border lg:hidden flex-shrink-0">
            <h2 className="text-lg font-semibold">Menu</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close Menu</span>
            </Button>
          </div>
          
          <div className="h-full lg:h-screen flex flex-col">
            <div className="flex-1 p-4 lg:p-6 lg:pt-6 pt-0 min-h-0">
              <SidebarNav
                activeSection={activeSection}
                setActiveSection={handleSectionSelect}
                handleSignOut={handleMobileSignOut}
              />
            </div>
          </div>
        </aside>

        {/* Main Content - Mobile Optimized */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 min-h-screen">
          {activeSection === "profile" && <NewProfilePage />}
          {activeSection === "events" && <EventsAndClubsPage />}
          {activeSection === "id-card" && <IdCardPage />}
          {activeSection === "store" && <CampusStorePage />}
          
          {activeSection === "orders" && (
            <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold">My Orders</h2>
                  <p className="text-muted-foreground text-sm sm:text-base">Track and manage your orders</p>
                </div>
                <Button className="bg-primary hover:bg-primary/90 text-sm sm:text-base">
                  <Package className="h-4 w-4 mr-2" />
                  New Order
                </Button>
              </div>

              <div className="text-center py-12 sm:py-20">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Package className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-2">No Orders Yet</h3>
                <p className="text-muted-foreground mb-6 text-sm sm:text-base px-4">
                  You haven't placed any orders yet. Start by exploring our services and campus store.
                </p>
                <Button className="bg-primary hover:bg-primary/90">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Browse Services
                </Button>
              </div>
            </div>
          )}

          {activeSection === "leaderboard" && <LeaderboardPage />}
          
          {activeSection === "overview" && (
            <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">
                      👋 Welcome back, {profile?.full_name?.split(' ')[0] || user.displayName?.split(' ')[0] || 'Student'}!
                    </h2>
                    <p className="text-white/80 text-sm sm:text-base lg:text-lg">Ready to make your campus life easier?</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-white/80 text-sm">Today's Date</p>
                    <p className="text-lg sm:text-xl font-semibold">{todayStr}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 lg:space-x-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto sm:mx-0">
                        <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-500" />
                      </div>
                      <div className="text-center sm:text-left">
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold">0</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Total Orders</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 lg:space-x-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:w-12 rounded-xl lg:rounded-2xl bg-purple-500/20 flex items-center justify-center mx-auto sm:mx-0">
                        <Calendar className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-purple-500" />
                      </div>
                      <div className="text-center sm:text-left">
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold">0</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Events Today</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:bg-primary/5"
                  onClick={handleLeaderboardClick}
                >
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 lg:space-x-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-yellow-500/20 flex items-center justify-center mx-auto sm:mx-0">
                        <Trophy className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-yellow-500" />
                      </div>
                      <div className="text-center sm:text-left">
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold">#{currentUserRank || '...'}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Leaderboard</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 lg:space-x-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto sm:mx-0">
                        <Target className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-emerald-500" />
                      </div>
                      <div className="text-center sm:text-left">
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold">{currentUserData?.activity_points.toLocaleString() || profile?.engagement?.activity_points.toLocaleString() || 0}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Activity Points</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                <Card className="shadow-lg">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="flex items-center text-base sm:text-lg">
                      <Zap className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <Button className="w-full justify-start bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/20 text-sm">
                      <ShoppingBag className="h-4 w-4 mr-2 sm:mr-3" />
                      Order Food from Campus
                    </Button>
                    <Button className="w-full justify-start bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 border border-purple-500/20 text-sm">
                      <FileText className="h-4 w-4 mr-2 sm:mr-3" />
                      Submit Assignment
                    </Button>
                    <Button 
                      className="w-full justify-start bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20 text-sm"
                      onClick={() => setActiveSection("events")}
                    >
                      <Calendar className="h-4 w-4 mr-2 sm:mr-3" />
                      Join Clubs & Events
                    </Button>
                  </CardContent>
                </Card>

                <Card className="shadow-lg">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="flex items-center text-base sm:text-lg">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-muted-foreground" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <div className="flex items-center space-x-3 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-card border">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium truncate">Food order delivered</p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-card border">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium truncate">Joined study group</p>
                        <p className="text-xs text-muted-foreground">Yesterday</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-card border">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium truncate">Form submitted</p>
                        <p className="text-xs text-muted-foreground">2 days ago</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                <Card className="lg:col-span-2 shadow-lg">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="flex items-center text-base sm:text-lg">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary" />
                      Upcoming Events
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl border border-border">
                        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl sm:rounded-2xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-500" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-sm sm:text-base truncate">Tech Club Meeting</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">Discussion on AI trends</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className="text-xs sm:text-sm font-medium">Today</p>
                          <p className="text-xs text-muted-foreground">4:00 PM</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl border border-border">
                        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl sm:rounded-2xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-purple-500" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-sm sm:text-base truncate">Assignment Deadline</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">Data Structures project</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className="text-xs sm:text-sm font-medium">Tomorrow</p>
                          <p className="text-xs text-muted-foreground">11:59 PM</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="flex items-center text-base sm:text-lg">
                      <Bell className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-orange-500" />
                      Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <p className="text-xs sm:text-sm font-medium text-blue-500">New service request approved</p>
                        <p className="text-xs text-muted-foreground mt-1">Your printing request is ready</p>
                      </div>
                      
                      <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-purple-500/10 border border-purple-500/20">
                        <p className="text-xs sm:text-sm font-medium text-purple-500">Resume deadline reminder</p>
                        <p className="text-xs text-muted-foreground mt-1">3 days left to submit</p>
                      </div>
                      
                      <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-green-500/10 border border-green-500/20">
                        <p className="text-xs sm:text-sm font-medium text-green-500">New club invitation</p>
                        <p className="text-xs text-muted-foreground mt-1">Photography club wants you!</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeSection !== "overview" && activeSection !== "profile" && activeSection !== "orders" && activeSection !== "leaderboard" && activeSection !== "events" && activeSection !== "id-card" && activeSection !== "store" && (
            <div className="text-center py-12 sm:py-20 animate-fade-in">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 rounded-xl sm:rounded-2xl bg-primary/20 flex items-center justify-center">
                {(() => {
                  const section = [...dashboardSections, ...advancedFeatures].find(s => s.id === activeSection);
                  const Icon = section?.icon || FileText;
                  return <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />;
                })()}
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2">
                {[...dashboardSections, ...advancedFeatures].find(s => s.id === activeSection)?.label}
              </h3>
              <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base px-4">
                This section is coming soon! We're working hard to bring you amazing features.
              </p>
              <Button onClick={() => setActiveSection("overview")} className="text-sm sm:text-base">
                Back to Dashboard
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
