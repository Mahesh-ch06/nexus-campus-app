
export interface Club {
  id: string;
  name: string;
  description: string;
  category: string;
  max_members: number;
  password: string;
  join_password?: string;
  auth_code?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ClubMembership {
  id: string;
  club_id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

export interface ClubRole {
  id: string;
  club_id: string;
  user_id: string;
  role: 'chair' | 'vice_chair' | 'core_member';
  created_at: string;
  updated_at: string;
}
