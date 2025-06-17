
-- RBAC System Implementation: Phase 1
-- This script sets up the core tables for a new Role-Based Access Control system.

-- Step 1: Create the core RBAC tables

CREATE TABLE public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.roles IS 'Stores user roles, e.g., student, admin, partner_vendor.';

CREATE TABLE public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE, -- e.g., 'users:create', 'events:delete'
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.permissions IS 'Stores specific permissions that can be assigned to roles.';

CREATE TABLE public.role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (role_id, permission_id)
);
COMMENT ON TABLE public.role_permissions IS 'Assigns permissions to roles.';

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, role_id)
);
COMMENT ON TABLE public.user_roles IS 'Assigns roles to users.';

-- Step 2: Add trigger for 'updated_at' timestamp on the roles table
CREATE TRIGGER handle_updated_at_roles BEFORE UPDATE ON public.roles
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Step 3: Populate with initial data

-- Insert core roles
INSERT INTO public.roles (name, description) VALUES
('student', 'Default role for all registered students.'),
('admin', 'Super administrator with full access to the system.'),
('partner', 'For campus store vendors or service providers.'),
('club_admin', 'Administrator for a specific student club.');

-- Insert core permissions
INSERT INTO public.permissions (name, description) VALUES
('dashboard:view', 'Can view the main user dashboard.'),
('profile:edit:own', 'Can edit their own profile.'),
('store:purchase', 'Can make purchases from the campus store.'),
('admin:manage_all', 'Grants unrestricted access to all admin functionalities.'),
('partner:manage_store', 'Allows a partner to manage their products and view orders.'),
('club_admin:manage_members', 'Allows a club admin to manage club members and activities.');


-- Step 4: Link roles to permissions
DO $$
DECLARE
    student_role_id UUID;
    admin_role_id UUID;
    partner_role_id UUID;
    club_admin_role_id UUID;
    
    dashboard_view_perm_id UUID;
    profile_edit_perm_id UUID;
    store_purchase_perm_id UUID;
    admin_manage_perm_id UUID;
    partner_manage_perm_id UUID;
    club_admin_manage_perm_id UUID;
BEGIN
    -- Get Role IDs
    SELECT id INTO student_role_id FROM public.roles WHERE name = 'student';
    SELECT id INTO admin_role_id FROM public.roles WHERE name = 'admin';
    SELECT id INTO partner_role_id FROM public.roles WHERE name = 'partner';
    SELECT id INTO club_admin_role_id FROM public.roles WHERE name = 'club_admin';

    -- Get Permission IDs
    SELECT id INTO dashboard_view_perm_id FROM public.permissions WHERE name = 'dashboard:view';
    SELECT id INTO profile_edit_perm_id FROM public.permissions WHERE name = 'profile:edit:own';
    SELECT id INTO store_purchase_perm_id FROM public.permissions WHERE name = 'store:purchase';
    SELECT id INTO admin_manage_perm_id FROM public.permissions WHERE name = 'admin:manage_all';
    SELECT id INTO partner_manage_perm_id FROM public.permissions WHERE name = 'partner:manage_store';
    SELECT id INTO club_admin_manage_perm_id FROM public.permissions WHERE name = 'club_admin:manage_members';

    -- Assign permissions to roles
    -- Student
    INSERT INTO public.role_permissions (role_id, permission_id) VALUES
    (student_role_id, dashboard_view_perm_id),
    (student_role_id, profile_edit_perm_id),
    (student_role_id, store_purchase_perm_id);

    -- Admin (gets all permissions for this example)
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT admin_role_id, id FROM public.permissions;

    -- Partner
    INSERT INTO public.role_permissions (role_id, permission_id) VALUES
    (partner_role_id, partner_manage_perm_id);

    -- Club Admin
    INSERT INTO public.role_permissions (role_id, permission_id) VALUES
    (club_admin_role_id, club_admin_manage_perm_id);

END $$;

-- Step 5: Automate role assignment for new users

CREATE OR REPLACE FUNCTION public.assign_default_role_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_student_role_id UUID;
BEGIN
  -- Find the UUID for the 'student' role.
  SELECT id INTO v_student_role_id FROM public.roles WHERE name = 'student';

  -- If the role exists, insert a record into user_roles for the new user.
  IF v_student_role_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (NEW.id, v_student_role_id);
  END IF;

  RETURN NEW;
END;
$$;
COMMENT ON FUNCTION public.assign_default_role_on_signup() IS 'Assigns the default ''student'' role to a newly created user.';

-- Attach the trigger to the users table
CREATE TRIGGER on_user_created_assign_default_role
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE PROCEDURE public.assign_default_role_on_signup();

-- Step 6: Enable RLS and define policies
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read access to roles" ON public.roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access to permissions" ON public.permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access to role_permissions" ON public.role_permissions FOR SELECT TO authenticated USING (true);

-- Users should only be able to see their own role assignments.
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (
    (SELECT u.firebase_uid FROM public.users u WHERE u.id = user_id) = auth.uid()::text
  );

-- We also need a function to check user permissions, which will be the cornerstone of the new system.
CREATE OR REPLACE FUNCTION public.user_has_permission(p_user_id UUID, p_permission_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role_id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = p_user_id AND p.name = p_permission_name
  );
END;
$$;
COMMENT ON FUNCTION public.user_has_permission(UUID, TEXT) IS 'Checks if a user has a specific permission through their assigned roles.';

