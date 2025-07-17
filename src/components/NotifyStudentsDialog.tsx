
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NotifyStudentsDialogProps {
  clubId: string;
  clubName: string;
  members: Array<{ users: { id: string } }>;
}

const NotifyStudentsDialog = ({ clubId, clubName, members }: NotifyStudentsDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendNotificationToAllMembers = async () => {
    if (!title.trim() || !message.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both title and message.",
        variant: "destructive"
      });
      return;
    }

    if (!members || members.length === 0) {
      toast({
        title: "Error",
        description: "No members found to notify.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Sending notifications to members:', members);
      console.log('Club ID:', clubId);
      console.log('Notification content:', { title: title.trim(), message: message.trim() });
      
      // Create notifications for all club members
      const notifications = members.map(member => ({
        user_id: member.users.id,
        club_id: clubId,
        title: title.trim(),
        message: message.trim(),
        read: false
      }));

      console.log('Notifications to insert:', notifications);

      const { data, error } = await supabase
        .from('notifications')
        .insert(notifications)
        .select();

      if (error) {
        console.error('Error inserting notifications:', error);
        throw error;
      }

      console.log('Successfully inserted notifications:', data);

      toast({
        title: "Notifications sent!",
        description: `Successfully notified ${members.length} club members.`
      });

      // Reset form and close dialog
      setTitle('');
      setMessage('');
      setIsOpen(false);
    } catch (error) {
      console.error('Error sending notifications:', error);
      toast({
        title: "Error",
        description: "Failed to send notifications. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Bell className="h-4 w-4" />
          Notify All Members
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Notification to All Members</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            This will send a notification to all {members.length} members of {clubName}.
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">Headline</Label>
            <Input
              id="title"
              placeholder="Enter notification headline..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              rows={4}
            />
            <div className="text-xs text-muted-foreground text-right">
              {message.length}/500 characters
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={sendNotificationToAllMembers}
              disabled={isLoading || !title.trim() || !message.trim()}
            >
              {isLoading ? "Sending..." : "Send Notification"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotifyStudentsDialog;
