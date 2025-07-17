
-- Enable RLS on vendors table if not already enabled
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to create their own vendor records
CREATE POLICY "Users can create their own vendor records" 
  ON public.vendors 
  FOR INSERT 
  TO authenticated
  WITH CHECK (firebase_uid = auth.uid()::text);

-- Policy to allow users to view their own vendor records
CREATE POLICY "Users can view their own vendor records" 
  ON public.vendors 
  FOR SELECT 
  TO authenticated
  USING (firebase_uid = auth.uid()::text);

-- Policy to allow users to update their own vendor records
CREATE POLICY "Users can update their own vendor records" 
  ON public.vendors 
  FOR UPDATE 
  TO authenticated
  USING (firebase_uid = auth.uid()::text);

-- Policy to allow users to delete their own vendor records
CREATE POLICY "Users can delete their own vendor records" 
  ON public.vendors 
  FOR DELETE 
  TO authenticated
  USING (firebase_uid = auth.uid()::text);
