import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

const ADMIN_EMAIL = "maheshch1094@gmail.com";
const ADMIN_CODE = "CC-500";

interface User {
  id: string;
  email: string;
  full_name: string;
}

export default function AdminPointsPortal() {
  const [adminEmail, setAdminEmail] = useState(ADMIN_EMAIL);
  const [adminCode, setAdminCode] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [points, setPoints] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [users, setUsers] = useState<User[]>([]);

  // Fetch users from Supabase after admin login
  const fetchUsers = async () => {
    setFetchingUsers(true);
    setError("");
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name')
        .order('full_name');

      if (error) {
        console.error('Error fetching users:', error);
        setError("Failed to fetch users from database.");
        return;
      }

      setUsers(data || []);
    } catch (err) {
      console.error('Error:', err);
      setError("Failed to fetch users.");
    } finally {
      setFetchingUsers(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (adminEmail !== ADMIN_EMAIL) {
      setError("Invalid admin email.");
      return;
    }
    
    if (adminCode !== ADMIN_CODE) {
      setError("Invalid admin code.");
      return;
    }
    
    setIsAdmin(true);
    // Fetch users after successful login
    await fetchUsers();
  };

  const handleAddPoints = async () => {
    setLoading(true);
    setSuccess("");
    setError("");

    // Validate input
    if (!selectedUserId || !points || isNaN(Number(points))) {
      setError("Please select a user and enter valid points.");
      setLoading(false);
      return;
    }

    const pointsToAdd = Number(points);
    if (pointsToAdd <= 0) {
      setError("Points must be a positive number.");
      setLoading(false);
      return;
    }

    try {
      // First, check if user has existing engagement record
      const { data: existingEngagement, error: fetchError } = await supabase
        .from('engagement')
        .select('activity_points')
        .eq('user_id', selectedUserId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" which is fine
        console.error('Error fetching engagement:', fetchError);
        setError("Failed to fetch user engagement data.");
        setLoading(false);
        return;
      }

      let result;
      
      if (existingEngagement) {
        // Update existing record
        const newTotal = (existingEngagement.activity_points || 0) + pointsToAdd;
        
        result = await supabase
          .from('engagement')
          .update({ 
            activity_points: newTotal,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', selectedUserId);
      } else {
        // Insert new record
        result = await supabase
          .from('engagement')
          .insert({
            user_id: selectedUserId,
            activity_points: pointsToAdd,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }

      if (result.error) {
        console.error('Error updating points:', result.error);
        setError("Failed to update points in database.");
        setLoading(false);
        return;
      }

      // Find selected user for success message
      const selectedUser = users.find(user => user.id === selectedUserId);
      const userDisplay = selectedUser?.full_name || selectedUser?.email || "user";
      
      setSuccess(`Successfully added ${pointsToAdd} points to ${userDisplay}`);
      setSelectedUserId("");
      setPoints("");
    } catch (err) {
      console.error('Error:', err);
      setError("Failed to update points.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <Card className="max-w-md mx-auto mt-20 p-6">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleAdminLogin}>
            <Input
              id="admin-email"
              name="adminEmail"
              type="email"
              placeholder="Admin Email"
              value={adminEmail}
              onChange={e => setAdminEmail(e.target.value)}
              disabled={false}
            />
            <Input
              id="admin-code"
              name="adminCode"
              type="text"
              placeholder="Enter Auth Code (CC-500)"
              value={adminCode}
              onChange={e => setAdminCode(e.target.value)}
              disabled={false}
            />
            <Button type="submit" disabled={!adminEmail || !adminCode}>
              Login
            </Button>
            {error && <div className="text-red-600 font-semibold">{error}</div>}
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto mt-20 p-6">
      <CardHeader>
        <CardTitle>Admin: Add Activity Points</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {fetchingUsers ? (
            <div className="text-gray-600">Loading users...</div>
          ) : (
            <Select 
              value={selectedUserId} 
              onValueChange={setSelectedUserId}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          <Input
            id="points-input"
            name="points"
            type="number"
            placeholder="Points to Add"
            value={points}
            onChange={e => setPoints(e.target.value)}
            disabled={loading}
            min="1"
          />
          
          <Button 
            onClick={handleAddPoints} 
            disabled={loading || !selectedUserId || !points || fetchingUsers}
          >
            {loading ? "Adding..." : "Add Points"}
          </Button>
          
          {success && <div className="text-green-600 font-semibold">{success}</div>}
          {error && <div className="text-red-600 font-semibold">{error}</div>}
        </div>
      </CardContent>
    </Card>
  );
}