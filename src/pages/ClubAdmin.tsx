import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Users, Calendar, Settings, LogOut, Crown, Shield, User } from "lucide-react";
import NotificationDropdown from "@/components/NotificationDropdown";
import NotifyStudentsDialog from "@/components/NotifyStudentsDialog";

const ClubAdmin = () => {
  const [clubSession, setClubSession] = useState(null);
  const [clubData, setClubData] = useState(null);
  const [members, setMembers] = useState([]);
  const [roles, setRoles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const session = localStorage.getItem('club_admin_session');
    if (!session) {
      navigate('/club-admin-login');
      return;
    }

    const parsedSession = JSON.parse(session);
    setClubSession(parsedSession);
    fetchClubData(parsedSession.clubId);
    fetchMembers(parsedSession.clubId);
    fetchRoles(parsedSession.clubId);
  }, [navigate]);

  const fetchClubData = async (clubId) => {
    try {
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .eq('id', clubId)
        .single();
      
      if (error) throw error;
      setClubData(data);
    } catch (error) {
      console.error('Error fetching club data:', error);
    }
  };

  const fetchMembers = async (clubId) => {
    try {
      const { data, error } = await supabase
        .from('club_memberships')
        .select(`
          id,
          role,
          joined_at,
          users (
            id,
            full_name,
            hall_ticket,
            department
          )
        `)
        .eq('club_id', clubId);
      
      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const fetchRoles = async (clubId) => {
    try {
      const { data, error } = await supabase
        .from('club_roles')
        .select(`
          id,
          role,
          created_at,
          users (
            id,
            full_name,
            hall_ticket,
            department
          )
        `)
        .eq('club_id', clubId);
      
      if (error) throw error;
      setRoles(data || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('club_admin_session');
    navigate('/dashboard');
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'chair': return <Crown className="h-4 w-4" />;
      case 'vice_chair': return <Shield className="h-4 w-4" />;
      case 'core_member': return <User className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'chair': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'vice_chair': return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      case 'core_member': return 'bg-green-500/20 text-green-700 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  if (!clubSession || !clubData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading club admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">{clubData.name}</CardTitle>
                <p className="text-muted-foreground">{clubData.category} Club</p>
                <Badge className={getRoleColor(clubSession.userRole)}>
                  {getRoleIcon(clubSession.userRole)}
                  <span className="ml-1 capitalize">{clubSession.userRole.replace('_', ' ')}</span>
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <NotificationDropdown 
                  clubId={clubSession.clubId} 
                  userId={clubSession.firebaseUid}
                />
                <NotifyStudentsDialog 
                  clubId={clubSession.clubId}
                  clubName={clubData.name}
                  members={members}
                />
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{members.length}</p>
                  <p className="text-sm text-muted-foreground">Total Members</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Upcoming Events</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <Settings className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{clubData.max_members}</p>
                  <p className="text-sm text-muted-foreground">Max Capacity</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Committee Members */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Committee Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {roles.map((role) => (
                <div key={role.id} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center space-x-4">
                    <Badge className={getRoleColor(role.role)}>
                      {getRoleIcon(role.role)}
                      <span className="ml-1 capitalize">{role.role.replace('_', ' ')}</span>
                    </Badge>
                    <div>
                      <p className="font-medium">{role.users.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {role.users.hall_ticket} • {role.users.department}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Since {new Date(role.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Regular Members */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Club Members</CardTitle>
          </CardHeader>
          <CardContent>
            {members.length > 0 ? (
              <div className="space-y-4">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <p className="font-medium">{member.users.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.users.hall_ticket} • {member.users.department}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{member.role}</Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        Joined {new Date(member.joined_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No members have joined yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClubAdmin;
