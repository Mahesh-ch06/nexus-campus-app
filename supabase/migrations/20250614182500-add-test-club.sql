
-- Insert a test club for demonstration (without created_by to avoid foreign key constraint)
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
);
