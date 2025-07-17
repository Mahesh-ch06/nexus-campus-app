
-- Create notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  club_id uuid REFERENCES public.clubs(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid()::text IN (
    SELECT firebase_uid FROM public.users WHERE id = notifications.user_id
  ));

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid()::text IN (
    SELECT firebase_uid FROM public.users WHERE id = notifications.user_id
  ));

CREATE POLICY "Users can delete their own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid()::text IN (
    SELECT firebase_uid FROM public.users WHERE id = notifications.user_id
  ));

-- Allow club admins to insert notifications for their club members
CREATE POLICY "Club admins can create notifications for members"
  ON public.notifications FOR INSERT
  WITH CHECK (
    auth.uid()::text IN (
      SELECT u.firebase_uid 
      FROM public.users u
      JOIN public.club_roles cr ON u.id = cr.user_id
      WHERE cr.club_id = notifications.club_id 
      AND cr.role IN ('chair', 'vice_chair', 'core_member')
    )
  );

-- Create trigger to update updated_at column
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
