
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Bell, Check, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  club_id?: string;
}

interface NotificationDropdownProps {
  clubId?: string;
  userId: string;
}

const NotificationDropdown = ({ clubId, userId }: NotificationDropdownProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log('NotificationDropdown mounted with:', { clubId, userId });
    fetchNotifications();
  }, [clubId, userId]);

  const fetchNotifications = async () => {
    if (!userId) {
      console.log('No userId provided, skipping fetch');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('Fetching notifications for Firebase UID:', userId, 'club:', clubId);
      
      // Get the current user's internal ID - use explicit typing
      const userQuery = supabase
        .from('users')
        .select('id')
        .eq('firebase_uid', userId)
        .maybeSingle();

      const userResult = await userQuery;

      if (userResult.error) {
        console.error('Error fetching user data:', userResult.error);
        toast({
          title: "Error",
          description: "Failed to fetch user data for notifications.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      if (!userResult.data?.id) {
        console.error('No user found with firebase_uid:', userId);
        setIsLoading(false);
        return;
      }

      console.log('Found internal user ID:', userResult.data.id);

      // Build notification query without complex chaining
      let notificationQuery = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userResult.data.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Apply club filter if provided - avoid reassigning the query
      if (clubId) {
        console.log('Filtering notifications for club:', clubId);
        notificationQuery = notificationQuery.eq('club_id', clubId);
      }

      const notificationResult = await notificationQuery;
      
      if (notificationResult.error) {
        console.error('Error fetching notifications:', notificationResult.error);
        toast({
          title: "Error",
          description: "Failed to load notifications.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      console.log('Fetched notifications:', notificationResult.data);
      
      const notifications = notificationResult.data || [];
      setNotifications(notifications);
      setUnreadCount(notifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Unexpected error fetching notifications:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading notifications.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      console.log('Marking notification as read:', notificationId);
      
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        throw error;
      }
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      console.log('Successfully marked notification as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read.",
        variant: "destructive"
      });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      console.log('Deleting notification:', notificationId);
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Error deleting notification:', error);
        throw error;
      }
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => {
        const notification = notifications.find(n => n.id === notificationId);
        return notification && !notification.read ? prev - 1 : prev;
      });
      
      toast({
        title: "Notification deleted",
        description: "The notification has been removed."
      });
      
      console.log('Successfully deleted notification');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: "Error",
        description: "Failed to delete notification.",
        variant: "destructive"
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto" align="end">
        <div className="p-2 font-semibold text-sm border-b bg-background">
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 text-xs text-muted-foreground">
              ({unreadCount} unread)
            </span>
          )}
        </div>
        
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No notifications yet
          </div>
        ) : (
          notifications.map((notification) => (
            <div key={notification.id}>
              <DropdownMenuItem 
                className={`flex flex-col items-start p-3 cursor-pointer ${
                  !notification.read ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
                }`}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <div className="flex items-start justify-between w-full">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{notification.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </div>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
