
-- Remove the old insert RLS policy for students on campus_orders
DROP POLICY IF EXISTS "Students can create orders" ON public.campus_orders;

-- Add a correct insert RLS policy: student may insert only their own order
CREATE POLICY "Students can create orders if student_id=auth.uid()" ON public.campus_orders
  FOR INSERT
  WITH CHECK (student_id = auth.uid());
