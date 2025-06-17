export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      academic_info: {
        Row: {
          cgpa: number | null
          created_at: string | null
          current_semester: number | null
          id: string
          mentor_email: string | null
          mentor_name: string | null
          subjects_enrolled: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cgpa?: number | null
          created_at?: string | null
          current_semester?: number | null
          id?: string
          mentor_email?: string | null
          mentor_name?: string | null
          subjects_enrolled?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cgpa?: number | null
          created_at?: string | null
          current_semester?: number | null
          id?: string
          mentor_email?: string | null
          mentor_name?: string | null
          subjects_enrolled?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_info_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_allocations: {
        Row: {
          allocated_at: string | null
          allocated_by: string | null
          club_id: string | null
          id: string
          points: number
          reason: string | null
          student_id: string | null
        }
        Insert: {
          allocated_at?: string | null
          allocated_by?: string | null
          club_id?: string | null
          id?: string
          points: number
          reason?: string | null
          student_id?: string | null
        }
        Update: {
          allocated_at?: string | null
          allocated_by?: string | null
          club_id?: string | null
          id?: string
          points?: number
          reason?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_allocations_allocated_by_fkey"
            columns: ["allocated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_allocations_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_allocations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_points_history: {
        Row: {
          created_at: string
          id: string
          points: number
          reason: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          points: number
          reason: string
          transaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          points?: number
          reason?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_points_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_applications: {
        Row: {
          approved_at: string | null
          business_name: string
          category: string
          created_at: string
          description: string
          email: string
          full_name: string
          id: string
          phone_number: string
          rejected_at: string | null
          rejection_reason: string | null
          status: string
        }
        Insert: {
          approved_at?: string | null
          business_name: string
          category: string
          created_at?: string
          description: string
          email: string
          full_name: string
          id?: string
          phone_number: string
          rejected_at?: string | null
          rejection_reason?: string | null
          status?: string
        }
        Update: {
          approved_at?: string | null
          business_name?: string
          category?: string
          created_at?: string
          description?: string
          email?: string
          full_name?: string
          id?: string
          phone_number?: string
          rejected_at?: string | null
          rejection_reason?: string | null
          status?: string
        }
        Relationships: []
      }
      campus_order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string | null
          product_id: string | null
          quantity: number
          subtotal: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity: number
          subtotal: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity?: number
          subtotal?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "campus_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "campus_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campus_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      campus_orders: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          payment_method: string
          pickup_deadline: string | null
          qr_code: string | null
          service_fee: number
          status: string
          student_id: string | null
          total_price: number
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_method?: string
          pickup_deadline?: string | null
          qr_code?: string | null
          service_fee: number
          status?: string
          student_id?: string | null
          total_price: number
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_method?: string
          pickup_deadline?: string | null
          qr_code?: string | null
          service_fee?: number
          status?: string
          student_id?: string | null
          total_price?: number
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campus_orders_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campus_orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      club_memberships: {
        Row: {
          club_id: string | null
          id: string
          joined_at: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          club_id?: string | null
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          club_id?: string | null
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "club_memberships_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      club_roles: {
        Row: {
          club_id: string | null
          created_at: string | null
          id: string
          role: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          club_id?: string | null
          created_at?: string | null
          id?: string
          role: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          club_id?: string | null
          created_at?: string | null
          id?: string
          role?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "club_roles_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      clubs: {
        Row: {
          auth_code: string | null
          category: string | null
          chair_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          join_password: string | null
          max_members: number | null
          name: string
          password: string
          updated_at: string | null
        }
        Insert: {
          auth_code?: string | null
          category?: string | null
          chair_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          join_password?: string | null
          max_members?: number | null
          name: string
          password: string
          updated_at?: string | null
        }
        Update: {
          auth_code?: string | null
          category?: string | null
          chair_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          join_password?: string | null
          max_members?: number | null
          name?: string
          password?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clubs_chair_id_fkey"
            columns: ["chair_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clubs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          description: string
          id: string
          priority: string
          resolved_at: string | null
          status: string
          subject: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          description: string
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          description?: string
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaints_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string | null
          doc_type: string
          doc_url: string
          file_name: string
          id: string
          updated_at: string | null
          user_id: string
          verified_by_admin: boolean | null
        }
        Insert: {
          created_at?: string | null
          doc_type: string
          doc_url: string
          file_name: string
          id?: string
          updated_at?: string | null
          user_id: string
          verified_by_admin?: boolean | null
        }
        Update: {
          created_at?: string | null
          doc_type?: string
          doc_url?: string
          file_name?: string
          id?: string
          updated_at?: string | null
          user_id?: string
          verified_by_admin?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      engagement: {
        Row: {
          activity_points: number | null
          badges: Json | null
          created_at: string | null
          events_attended: string[] | null
          feedback_count: number | null
          id: string
          last_login: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          activity_points?: number | null
          badges?: Json | null
          created_at?: string | null
          events_attended?: string[] | null
          feedback_count?: number | null
          id?: string
          last_login?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          activity_points?: number | null
          badges?: Json | null
          created_at?: string | null
          events_attended?: string[] | null
          feedback_count?: number | null
          id?: string
          last_login?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "engagement_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          event_date: string
          id: string
          location: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          event_date: string
          id?: string
          location?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          event_date?: string
          id?: string
          location?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          club_id: string | null
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          club_id?: string | null
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          club_id?: string | null
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          decline_reason: string | null
          estimated_pickup: string | null
          id: string
          items: Json
          payment_method: string
          service_type: string
          status: string
          subtotal: number
          surge_fee: number
          total: number
          updated_at: string
          user_email: string
          user_id: string
          user_name: string
        }
        Insert: {
          created_at?: string
          decline_reason?: string | null
          estimated_pickup?: string | null
          id?: string
          items: Json
          payment_method?: string
          service_type: string
          status?: string
          subtotal: number
          surge_fee?: number
          total: number
          updated_at?: string
          user_email: string
          user_id: string
          user_name: string
        }
        Update: {
          created_at?: string
          decline_reason?: string | null
          estimated_pickup?: string | null
          id?: string
          items?: Json
          payment_method?: string
          service_type?: string
          status?: string
          subtotal?: number
          surge_fee?: number
          total?: number
          updated_at?: string
          user_email?: string
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      pickup_confirmations: {
        Row: {
          confirmed_at: string | null
          confirmed_by: string | null
          id: string
          notes: string | null
          order_id: string | null
          qr_code: string
        }
        Insert: {
          confirmed_at?: string | null
          confirmed_by?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          qr_code: string
        }
        Update: {
          confirmed_at?: string | null
          confirmed_by?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          qr_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "pickup_confirmations_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pickup_confirmations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "campus_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      preferences: {
        Row: {
          created_at: string | null
          id: string
          language: string | null
          notifications_enabled: boolean | null
          theme: Database["public"]["Enums"]["theme_type"] | null
          updated_at: string | null
          user_id: string
          widgets_enabled: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          language?: string | null
          notifications_enabled?: boolean | null
          theme?: Database["public"]["Enums"]["theme_type"] | null
          updated_at?: string | null
          user_id: string
          widgets_enabled?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          language?: string | null
          notifications_enabled?: boolean | null
          theme?: Database["public"]["Enums"]["theme_type"] | null
          updated_at?: string | null
          user_id?: string
          widgets_enabled?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          available_from: string | null
          available_until: string | null
          category_id: string | null
          created_at: string | null
          description: string | null
          discount_percentage: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          price: number
          quantity: number | null
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          available_from?: string | null
          available_until?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          price: number
          quantity?: number | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          available_from?: string | null
          available_until?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          price?: number
          quantity?: number | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "store_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_offers: {
        Row: {
          created_at: string | null
          description: string | null
          discount_type: string
          discount_value: number
          end_time: string
          id: string
          is_active: boolean | null
          product_id: string | null
          start_time: string
          title: string
          vendor_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          discount_type: string
          discount_value: number
          end_time: string
          id?: string
          is_active?: boolean | null
          product_id?: string | null
          start_time: string
          title: string
          vendor_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          end_time?: string
          id?: string
          is_active?: boolean | null
          product_id?: string | null
          start_time?: string
          title?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promo_offers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promo_offers_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_wallets: {
        Row: {
          created_at: string
          id: string
          points_balance: number
          staff_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          points_balance?: number
          staff_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          points_balance?: number
          staff_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_wallets_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      store_categories: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      store_items: {
        Row: {
          available: boolean
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          available?: boolean
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          available?: boolean
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          academic_year: string
          created_at: string | null
          department: string
          email: string
          email_verified: boolean | null
          firebase_uid: string
          full_name: string
          hall_ticket: string
          id: string
          is_active: boolean | null
          phone_number: string
          profile_picture_url: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          academic_year: string
          created_at?: string | null
          department: string
          email: string
          email_verified?: boolean | null
          firebase_uid: string
          full_name: string
          hall_ticket: string
          id?: string
          is_active?: boolean | null
          phone_number: string
          profile_picture_url?: string | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          academic_year?: string
          created_at?: string | null
          department?: string
          email?: string
          email_verified?: boolean | null
          firebase_uid?: string
          full_name?: string
          hall_ticket?: string
          id?: string
          is_active?: boolean | null
          phone_number?: string
          profile_picture_url?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      vendors: {
        Row: {
          approved_at: string | null
          business_name: string
          category: string
          created_at: string | null
          description: string | null
          firebase_uid: string
          id: string
          rejected_at: string | null
          rejection_reason: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          business_name: string
          category: string
          created_at?: string | null
          description?: string | null
          firebase_uid: string
          id?: string
          rejected_at?: string | null
          rejection_reason?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          business_name?: string
          category?: string
          created_at?: string | null
          description?: string | null
          firebase_uid?: string
          id?: string
          rejected_at?: string | null
          rejection_reason?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_email_exists: {
        Args: { p_email: string }
        Returns: boolean
      }
      check_hall_ticket_exists: {
        Args: { p_hall_ticket: string }
        Returns: boolean
      }
      get_current_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_rank: {
        Args: { p_user_id: string }
        Returns: {
          rank: number
        }[]
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      theme_type: "Light" | "Dark" | "System"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      theme_type: ["Light", "Dark", "System"],
    },
  },
} as const
