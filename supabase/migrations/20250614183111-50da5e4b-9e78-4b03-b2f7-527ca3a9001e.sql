
-- Update the test club insertion to handle the foreign key constraint properly
-- First, let's try to insert with a NULL created_by since we don't have a valid user ID
INSERT INTO public.clubs (
  name,
  description,
  category,
  password,
  join_password,
  max_members,
  created_by
) VALUES (
  'Tech Innovation Club',
  'A club dedicated to exploring cutting-edge technologies, organizing hackathons, and fostering innovation among students. Join us to collaborate on exciting projects and learn from industry experts.',
  'Technology',
  'admin123',
  'mahesh',
  30,
  NULL
)
ON CONFLICT DO NOTHING;
