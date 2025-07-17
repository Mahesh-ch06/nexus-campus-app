
import { useState, useEffect, useMemo } from 'react';
import { UserProfile, getAllUsers } from '@/services/userService';
import { addPoints } from '@/services/pointsService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Loader2, UserPlus, Award, ArrowLeft } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ManualPointAllocationProps {
    staffPointBalance: number;
    onPointsAllocated: (points: number) => void;
}

export const ManualPointAllocation = ({ staffPointBalance, onPointsAllocated }: ManualPointAllocationProps) => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [points, setPoints] = useState<number>(0);
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            const allUsers = await getAllUsers();
            setUsers(allUsers);
            setLoading(false);
        };
        fetchUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        if (!searchTerm.trim()) {
            return [];
        }
        return users.filter(user =>
            user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.hall_ticket.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, users]);

    const handleSelectUser = (user: UserProfile) => {
        setSelectedUser(user);
        setSearchTerm('');
    };
    
    const handleClearSelection = () => {
        setSelectedUser(null);
        setPoints(0);
        setReason('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser || points <= 0 || points > 50 || !reason) {
            toast.error("Please fill all fields correctly. Points must be between 1 and 50.");
            return;
        }
        
        if (points > staffPointBalance) {
            toast.error("You don't have enough balance to allocate these points.");
            return;
        }

        setIsSubmitting(true);
        const success = await addPoints(selectedUser.id, points, reason, 'earned');
        setIsSubmitting(false);

        if (success) {
            toast.success(`Successfully awarded ${points} points to ${selectedUser.full_name}.`);
            onPointsAllocated(points);
            handleClearSelection();
        } else {
            toast.error("Failed to award points. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="ml-2 text-muted-foreground">Loading students...</p>
            </div>
        );
    }
    
    if (selectedUser) {
        return (
             <Card className="border-dashed">
                <CardHeader>
                    <CardTitle>Award Points to {selectedUser.full_name}</CardTitle>
                    <CardDescription>Hall Ticket: {selectedUser.hall_ticket}</CardDescription>
                </CardHeader>
                <CardContent>
                     <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="points">Points (1-50)</Label>
                            <Input
                                id="points"
                                type="number"
                                value={points === 0 ? '' : points}
                                onChange={(e) => setPoints(Math.max(0, Math.min(50, parseInt(e.target.value) || 0)))}
                                min="1"
                                max="50"
                                placeholder="Enter points"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="reason">Reason for Award</Label>
                             <Textarea
                                id="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="e.g., Volunteering at Tech Fest"
                                required
                            />
                        </div>
                        <div className="flex justify-end space-x-2 pt-2">
                             <Button variant="outline" type="button" onClick={handleClearSelection}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                             </Button>
                             <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Award className="mr-2 h-4 w-4" />}
                                Award Points
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            <Input
                placeholder="Search by name, hall ticket, or email to select a student..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <ScrollArea className="h-72 w-full rounded-md border">
                <div className="p-4">
                    {searchTerm.trim() && filteredUsers.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No students found matching your search.</p>}
                     {searchTerm.trim() && filteredUsers.length > 0 && <h4 className="mb-4 text-sm font-medium leading-none">Matching Students</h4>}
                    {filteredUsers.map(user => (
                        <div
                            key={user.id}
                            className="text-sm flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer transition-colors"
                            onClick={() => handleSelectUser(user)}
                        >
                            <div>
                                <p className="font-medium">{user.full_name}</p>
                                <p className="text-xs text-muted-foreground">{user.hall_ticket} - {user.email}</p>
                            </div>
                            <Button variant="ghost" size="sm" className="text-primary">
                                <UserPlus className="mr-2 h-4 w-4" />
                                Select
                            </Button>
                        </div>
                    ))}
                    {!searchTerm.trim() && (
                        <div className="text-center text-muted-foreground py-10">
                            <p>Start typing to search for a student.</p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};
