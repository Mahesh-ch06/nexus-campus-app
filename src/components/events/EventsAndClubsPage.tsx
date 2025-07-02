import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, Users, Search, Plus, Lock, UserCheck, LogOut, MapPin, Clock, Star, TrendingUp } from "lucide-react";

export const EventsAndClubsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [clubs, setClubs] = useState([]);
  const [myClubs, setMyClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);
  const [clubPassword, setClubPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { profile } = useUserProfile();
  const { user } = useAuth();

  useEffect(() => {
    fetchClubs();
    fetchMyClubs();
    fetchEvents();
  }, [profile]);

  const fetchClubs = async () => {
    try {
      const { data, error } = await supabase
        .from('clubs')
        .select(`
          id,
          name,
          description,
          category,
          max_members,
          created_at,
          club_memberships (count)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setClubs(data || []);
    } catch (error) {
      console.error('Error fetching clubs:', error);
    }
  };

  const fetchMyClubs = async () => {
    if (!profile?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('club_memberships')
        .select(`
          id,
          role,
          joined_at,
          clubs (
            id,
            name,
            description,
            category
          )
        `)
        .eq('user_id', profile.id);
      
      if (error) throw error;
      setMyClubs(data || []);
    } catch (error) {
      console.error('Error fetching my clubs:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true });
      
      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleJoinClub = async () => {
    if (!selectedClub || !profile?.id || !user) {
      setError("User not properly authenticated or profile not loaded");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      console.log("Attempting to join club with:", {
        clubId: selectedClub.id,
        userId: profile.id,
        firebaseUid: user.id,
        profileData: profile
      });

      // Check if user has already reached the 3 club limit
      if (myClubs.length >= 3) {
        throw new Error("You can only join up to 3 clubs");
      }

      // Check if user is already a member
      const existingMembership = myClubs.find(
        membership => membership.clubs.id === selectedClub.id
      );
      if (existingMembership) {
        throw new Error("You are already a member of this club");
      }

      // Verify club join password
      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .select('join_password')
        .eq('id', selectedClub.id)
        .single();

      if (clubError) {
        console.error("Error fetching club data:", clubError);
        throw clubError;
      }

      if (clubData.join_password !== clubPassword) {
        throw new Error("Incorrect club password");
      }

      console.log("About to insert membership with data:", {
        club_id: selectedClub.id,
        user_id: profile.id,
        role: 'member'
      });

      // Join the club
      const { error: joinError, data: insertData } = await supabase
        .from('club_memberships')
        .insert({
          club_id: selectedClub.id,
          user_id: profile.id,
          role: 'member'
        })
        .select();

      if (joinError) {
        console.error("Error joining club - detailed:", {
          error: joinError,
          code: joinError.code,
          message: joinError.message,
          details: joinError.details,
          hint: joinError.hint
        });
        throw joinError;
      }

      console.log("Successfully joined club:", insertData);

      // Refresh data
      await fetchMyClubs();
      setJoinDialogOpen(false);
      setClubPassword("");
      setSelectedClub(null);
      
      alert('Successfully joined the club!');
    } catch (error) {
      console.error('Error joining club:', error);
      setError(error.message || 'Failed to join club. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveClub = async (clubId) => {
    if (!profile?.id) return;
    
    try {
      const { error } = await supabase
        .from('club_memberships')
        .delete()
        .eq('club_id', clubId)
        .eq('user_id', profile.id);

      if (error) throw error;

      await fetchMyClubs();
      alert('Successfully left the club!');
    } catch (error) {
      console.error('Error leaving club:', error);
      alert('Failed to leave club. Please try again.');
    }
  };

  const filteredClubs = clubs.filter(club =>
    club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add debugging info to help identify the issue
  console.log("EventsAndClubsPage debug info:", {
    user: user?.id,
    profile: profile?.id,
    profileData: profile
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:to-blue-950/30">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
            <Users className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Events & Clubs
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover amazing clubs, connect with like-minded students, and participate in exciting campus events
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Search clubs and events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg focus:shadow-xl transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* Debug info for troubleshooting */}
        {(!user || !profile) && (
          <Alert>
            <AlertDescription>
              Debug: User authenticated: {user ? 'Yes' : 'No'}, Profile loaded: {profile ? 'Yes' : 'No'}
              {user && !profile && ' - Profile is still loading...'}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Available Clubs</p>
                  <p className="text-3xl font-bold">{clubs.length}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 text-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">My Clubs</p>
                  <p className="text-3xl font-bold">{myClubs.length}/3</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <UserCheck className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 text-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Upcoming Events</p>
                  <p className="text-3xl font-bold">{events.length}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="clubs" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="grid w-full max-w-md grid-cols-3 h-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg">
                <TabsTrigger value="clubs" className="text-sm font-medium">All Clubs</TabsTrigger>
                <TabsTrigger value="my-clubs" className="text-sm font-medium">My Clubs</TabsTrigger>
                <TabsTrigger value="events" className="text-sm font-medium">Events</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="clubs" className="space-y-6">
              {filteredClubs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredClubs.map((club) => {
                    const memberCount = club.club_memberships?.[0]?.count || 0;
                    const isJoined = myClubs.some(membership => membership.clubs.id === club.id);
                    
                    return (
                      <Card key={club.id} className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-2">
                              <CardTitle className="text-lg font-bold group-hover:text-blue-600 transition-colors">
                                {club.name}
                              </CardTitle>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300">
                                  {club.category}
                                </Badge>
                                {club.name === 'Tech Innovation Club' && (
                                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-950/50 dark:text-yellow-300">
                                    <Star className="h-3 w-3 mr-1" />
                                    Featured
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {isJoined && (
                              <Badge className="bg-green-100 text-green-700 border-green-300 dark:bg-green-950/50 dark:text-green-300">
                                <UserCheck className="h-3 w-3 mr-1" />
                                Joined
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                            {club.description}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Users className="h-4 w-4 mr-2 text-blue-500" />
                              <span className="font-medium">{memberCount}/{club.max_members}</span>
                              <span className="ml-1">members</span>
                            </div>
                            {club.name === 'Tech Innovation Club' && (
                              <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                                <TrendingUp className="h-4 w-4 mr-1" />
                                <span className="font-medium">Active</span>
                              </div>
                            )}
                          </div>

                          {!isJoined ? (
                            <Dialog open={joinDialogOpen && selectedClub?.id === club.id} onOpenChange={setJoinDialogOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                  onClick={() => setSelectedClub(club)}
                                  disabled={myClubs.length >= 3}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  {myClubs.length >= 3 ? "Club Limit Reached" : "Join Club"}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                  <DialogTitle className="text-xl font-bold">Join {club.name}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm font-medium">Club Join Password</Label>
                                    <div className="relative">
                                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                      <Input
                                        id="password"
                                        type="password"
                                        placeholder="Enter club join password"
                                        value={clubPassword}
                                        onChange={(e) => setClubPassword(e.target.value)}
                                        className="pl-10 h-11"
                                      />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      Contact the club administrators to get the join password
                                    </p>
                                  </div>
                                  
                                  {error && (
                                    <Alert variant="destructive">
                                      <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                  )}
                                  
                                  <div className="flex gap-3">
                                    <Button 
                                      variant="outline" 
                                      onClick={() => {
                                        setJoinDialogOpen(false);
                                        setClubPassword("");
                                        setError("");
                                      }}
                                      className="flex-1"
                                    >
                                      Cancel
                                    </Button>
                                    <Button 
                                      onClick={handleJoinClub}
                                      disabled={loading || !clubPassword}
                                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                                    >
                                      {loading ? "Joining..." : "Join Club"}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          ) : (
                            <Button
                              variant="outline"
                              className="w-full hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/20 dark:hover:text-red-400"
                              onClick={() => {
                                if (confirm('Are you sure you want to leave this club?')) {
                                  handleLeaveClub(club.id);
                                }
                              }}
                            >
                              <LogOut className="h-4 w-4 mr-2" />
                              Leave Club
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950/50 dark:to-purple-950/50 flex items-center justify-center">
                    <Users className="h-12 w-12 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No clubs found</h3>
                  <p className="text-muted-foreground mb-6">Try adjusting your search criteria or check back later</p>
                  <Button variant="outline" onClick={() => setSearchTerm("")}>
                    <Search className="h-4 w-4 mr-2" />
                    Clear Search
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="my-clubs" className="space-y-6">
              {myClubs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myClubs.map((membership) => (
                    <Card key={membership.id} className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                      <div className="h-2 bg-gradient-to-r from-green-500 to-blue-500"></div>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <CardTitle className="text-lg font-bold">{membership.clubs.name}</CardTitle>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300">
                              {membership.clubs.category}
                            </Badge>
                          </div>
                          <Badge className="bg-primary/10 text-primary border-primary/30">
                            {membership.role}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {membership.clubs.description}
                        </p>
                        
                        <div className="text-sm text-muted-foreground bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                          <p className="font-medium">Joined on {new Date(membership.joined_at).toLocaleDateString()}</p>
                        </div>

                        <Button
                          variant="outline"
                          className="w-full hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/20 dark:hover:text-red-400"
                          onClick={() => {
                            if (confirm('Are you sure you want to leave this club?')) {
                              handleLeaveClub(membership.clubs.id);
                            }
                          }}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Leave Club
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950/50 dark:to-purple-950/50 flex items-center justify-center">
                    <Users className="h-12 w-12 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No clubs joined yet</h3>
                  <p className="text-muted-foreground mb-6">You can join up to 3 clubs. Explore and find ones that interest you!</p>
                  <Button 
                    onClick={() => setSearchTerm("")}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Browse All Clubs
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="events" className="space-y-6">
              {filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map((event) => (
                    <Card key={event.id} className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden">
                      <div className="h-2 bg-gradient-to-r from-green-500 to-teal-600"></div>
                      <CardHeader>
                        <CardTitle className="text-lg font-bold group-hover:text-green-600 transition-colors">
                          {event.title}
                        </CardTitle>
                        {event.category && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-300 w-fit">
                            {event.category}
                          </Badge>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {event.description}
                        </p>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center text-muted-foreground">
                            <Clock className="h-4 w-4 mr-2 text-green-500" />
                            <span>
                              {new Date(event.event_date).toLocaleDateString()} at{' '}
                              {new Date(event.event_date).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          {event.location && (
                            <div className="flex items-center text-muted-foreground">
                              <MapPin className="h-4 w-4 mr-2 text-green-500" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>

                        <Button className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                          <Calendar className="h-4 w-4 mr-2" />
                          Register for Event
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-950/50 dark:to-teal-950/50 flex items-center justify-center">
                    <Calendar className="h-12 w-12 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No upcoming events</h3>
                  <p className="text-muted-foreground">Check back later for new events and activities</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
