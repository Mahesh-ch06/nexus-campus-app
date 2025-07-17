
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Plus, ArrowLeft, ArrowRight, Eye, EyeOff, Users, Shield, Key, Lock, UserCog } from "lucide-react";

const CreateClub = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { profile } = useUserProfile();

  // Form data
  const [clubName, setClubName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [maxMembers, setMaxMembers] = useState("50");
  const [adminPassword, setAdminPassword] = useState("");
  const [joinPassword, setJoinPassword] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showJoinPassword, setShowJoinPassword] = useState(false);

  const categories = [
    "Technical", "Cultural", "Sports", "Academic", "Social Service", 
    "Arts", "Music", "Dance", "Drama", "Photography", "Literature", "Other"
  ];

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        return clubName.trim() && description.trim() && category;
      case 2:
        return maxMembers && parseInt(maxMembers) > 0;
      case 3:
        return adminPassword.trim() && joinPassword.trim() && authCode.trim() && authCode.startsWith('CC-');
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!profile?.id) {
      setError("Please log in to create a club");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error: insertError } = await supabase
        .from('clubs')
        .insert({
          name: clubName,
          description,
          category,
          max_members: parseInt(maxMembers),
          password: adminPassword,
          join_password: joinPassword,
          auth_code: authCode,
          created_by: profile.id
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Create club role for the creator as chair
      const { error: roleError } = await supabase
        .from('club_roles')
        .insert({
          club_id: data.id,
          user_id: profile.id,
          role: 'chair'
        });

      if (roleError) throw roleError;

      // Create club membership for the creator
      const { error: membershipError } = await supabase
        .from('club_memberships')
        .insert({
          club_id: data.id,
          user_id: profile.id,
          role: 'chair'
        });

      if (membershipError) throw membershipError;

      setSuccess(true);
      setTimeout(() => {
        navigate('/club-admin-login');
      }, 2000);
    } catch (error) {
      console.error('Club creation error:', error);
      setError(error.message || "Failed to create club. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = (step / 3) * 100;

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-950 dark:to-green-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-2xl border-0">
          <CardContent className="pt-12 pb-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
              <Plus className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Club Created Successfully!
            </h2>
            <p className="text-muted-foreground mb-4">
              Your club "{clubName}" has been created. You'll be redirected to the admin login page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-950 dark:to-blue-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Plus className="h-8 w-8 text-white" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Create New Club
              </CardTitle>
              <p className="text-muted-foreground">Set up your campus club in 3 easy steps</p>
            </div>
            <div className="w-full">
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">Step {step} of 3</p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clubName" className="text-sm font-medium">Club Name *</Label>
                  <Input
                    id="clubName"
                    value={clubName}
                    onChange={(e) => setClubName(e.target.value)}
                    placeholder="Enter your club name"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your club's purpose and activities"
                    className="min-h-[100px] resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium">Category *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select club category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="maxMembers" className="text-sm font-medium">Maximum Members</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="maxMembers"
                      type="number"
                      value={maxMembers}
                      onChange={(e) => setMaxMembers(e.target.value)}
                      placeholder="50"
                      min="1"
                      max="500"
                      className="h-11 pl-10"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Set the maximum number of members for your club (1-500)
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <UserCog className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Club Core Committee Structure</h3>
                      <p className="text-sm text-muted-foreground">Understanding your club's leadership hierarchy</p>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
                          <Shield className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Club Chair</h4>
                          <p className="text-sm text-blue-700 dark:text-blue-200 leading-relaxed">
                            The primary leader and decision-maker. Has full administrative access, can manage all members, 
                            assign roles, and oversee club activities. You'll be automatically assigned as Chair upon creation.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border border-purple-200 dark:border-purple-800">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0 mt-1">
                          <UserCog className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Vice Chair</h4>
                          <p className="text-sm text-purple-700 dark:text-purple-200 leading-relaxed">
                            Second-in-command with administrative privileges. Can help manage members, organize events, 
                            and assist with club operations. You can assign this role after club creation.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border border-green-200 dark:border-green-800">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-1">
                          <Users className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">Core Members</h4>
                          <p className="text-sm text-green-700 dark:text-green-200 leading-relaxed">
                            Active contributors with special responsibilities. They help organize events, mentor new members, 
                            and support club initiatives. Can be promoted from regular members.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center flex-shrink-0 mt-1">
                          <Users className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Regular Members</h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            General club participants who attend events, engage in activities, and contribute to the club community. 
                            They join using the club join password.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert>
                  <UserCog className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Role Management:</strong> After creating your club, you can assign Vice Chairs and Core Members 
                    through the admin dashboard. Role assignments help distribute responsibilities and ensure smooth club operations.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="adminPassword" className="text-sm font-medium">Admin Password *</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="adminPassword"
                      type={showAdminPassword ? "text" : "password"}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Create admin password"
                      className="h-11 pl-10 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-11 w-10 px-2"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                    >
                      {showAdminPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This password will be used by club admins to access the management dashboard
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="joinPassword" className="text-sm font-medium">Club Join Password *</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="joinPassword"
                      type={showJoinPassword ? "text" : "password"}
                      value={joinPassword}
                      onChange={(e) => setJoinPassword(e.target.value)}
                      placeholder="Create join password"
                      className="h-11 pl-10 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-11 w-10 px-2"
                      onClick={() => setShowJoinPassword(!showJoinPassword)}
                    >
                      {showJoinPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Students will use this password to join your club
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="authCode" className="text-sm font-medium">Auth Code *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="authCode"
                      value={authCode}
                      onChange={(e) => setAuthCode(e.target.value)}
                      placeholder="CC-XXXXXXXX"
                      className="h-11 pl-10 font-mono"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Contact CampusConnect team at <strong>CampusConnect@mahesh.contact</strong> to get your auth code
                  </p>
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Security:</strong> Keep both passwords secure. The admin password grants 
                    management access, while the join password allows students to join your club.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              {step > 1 && (
                <Button variant="outline" onClick={handlePrevious} className="flex-1">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
              )}
              
              {step < 3 ? (
                <Button 
                  onClick={handleNext} 
                  disabled={!validateStep()}
                  className="flex-1"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={!validateStep() || loading}
                  className="flex-1"
                >
                  {loading ? "Creating Club..." : "Create Club"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateClub;
