export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      analytics_sessions: {
        Row: {
          city: string | null
          country: string | null
          country_name: string | null
          created_at: string
          device_type: string | null
          ended_at: string | null
          id: string
          referrer: string | null
          session_id: string
          started_at: string
          total_duration_seconds: number | null
          user_agent: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          visitor_fingerprint: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          country_name?: string | null
          created_at?: string
          device_type?: string | null
          ended_at?: string | null
          id?: string
          referrer?: string | null
          session_id: string
          started_at?: string
          total_duration_seconds?: number | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          visitor_fingerprint?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          country_name?: string | null
          created_at?: string
          device_type?: string | null
          ended_at?: string | null
          id?: string
          referrer?: string | null
          session_id?: string
          started_at?: string
          total_duration_seconds?: number | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          visitor_fingerprint?: string | null
        }
        Relationships: []
      }
      artwork_cursor_tracking: {
        Row: {
          artwork_id: string
          created_at: string | null
          id: string
          session_id: string
          viewport_height: number
          viewport_width: number
          x_position: number
          y_position: number
        }
        Insert: {
          artwork_id: string
          created_at?: string | null
          id?: string
          session_id: string
          viewport_height: number
          viewport_width: number
          x_position: number
          y_position: number
        }
        Update: {
          artwork_id?: string
          created_at?: string | null
          id?: string
          session_id?: string
          viewport_height?: number
          viewport_width?: number
          x_position?: number
          y_position?: number
        }
        Relationships: [
          {
            foreignKeyName: "artwork_cursor_tracking_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
        ]
      }
      artwork_images: {
        Row: {
          alt_text: string | null
          artwork_id: string
          caption: string | null
          created_at: string | null
          dimensions: string | null
          display_order: number
          id: string
          image_url: string
          is_catalog_visible: boolean
          is_detail: boolean
          is_main: boolean | null
          materials: string | null
          title: string | null
          year: string | null
        }
        Insert: {
          alt_text?: string | null
          artwork_id: string
          caption?: string | null
          created_at?: string | null
          dimensions?: string | null
          display_order?: number
          id?: string
          image_url: string
          is_catalog_visible?: boolean
          is_detail?: boolean
          is_main?: boolean | null
          materials?: string | null
          title?: string | null
          year?: string | null
        }
        Update: {
          alt_text?: string | null
          artwork_id?: string
          caption?: string | null
          created_at?: string | null
          dimensions?: string | null
          display_order?: number
          id?: string
          image_url?: string
          is_catalog_visible?: boolean
          is_detail?: boolean
          is_main?: boolean | null
          materials?: string | null
          title?: string | null
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artwork_images_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
        ]
      }
      artwork_views: {
        Row: {
          artwork_id: string
          clicked_detail: boolean | null
          created_at: string
          ended_at: string | null
          hovered: boolean | null
          id: string
          series_id: string | null
          session_id: string
          started_at: string
          view_duration_seconds: number | null
        }
        Insert: {
          artwork_id: string
          clicked_detail?: boolean | null
          created_at?: string
          ended_at?: string | null
          hovered?: boolean | null
          id?: string
          series_id?: string | null
          session_id: string
          started_at?: string
          view_duration_seconds?: number | null
        }
        Update: {
          artwork_id?: string
          clicked_detail?: boolean | null
          created_at?: string
          ended_at?: string | null
          hovered?: boolean | null
          id?: string
          series_id?: string | null
          session_id?: string
          started_at?: string
          view_duration_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "artwork_views_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artwork_views_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
      artworks: {
        Row: {
          created_at: string
          description: string | null
          dimensions: string | null
          display_order: number
          edition: string | null
          id: string
          image_detail_url: string | null
          image_url: string
          is_visible: boolean
          location: string | null
          materials: string | null
          medium_type: string | null
          notes: string | null
          series_id: string
          size_category: string | null
          status: string | null
          title: string
          updated_at: string
          year: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          dimensions?: string | null
          display_order?: number
          edition?: string | null
          id?: string
          image_detail_url?: string | null
          image_url: string
          is_visible?: boolean
          location?: string | null
          materials?: string | null
          medium_type?: string | null
          notes?: string | null
          series_id: string
          size_category?: string | null
          status?: string | null
          title: string
          updated_at?: string
          year?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          dimensions?: string | null
          display_order?: number
          edition?: string | null
          id?: string
          image_detail_url?: string | null
          image_url?: string
          is_visible?: boolean
          location?: string | null
          materials?: string | null
          medium_type?: string | null
          notes?: string | null
          series_id?: string
          size_category?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artworks_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
      bio_cv_entries: {
        Row: {
          created_at: string
          display_order: number
          id: string
          link: string | null
          section: string
          title: string
          updated_at: string
          venue: string | null
          year: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          link?: string | null
          section: string
          title: string
          updated_at?: string
          venue?: string | null
          year: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          link?: string | null
          section?: string
          title?: string
          updated_at?: string
          venue?: string | null
          year?: string
        }
        Relationships: []
      }
      bio_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      page_views: {
        Row: {
          created_at: string
          id: string
          page_name: string | null
          page_path: string
          session_id: string
          time_on_page_seconds: number | null
          viewed_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          page_name?: string | null
          page_path: string
          session_id: string
          time_on_page_seconds?: number | null
          viewed_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          page_name?: string | null
          page_path?: string
          session_id?: string
          time_on_page_seconds?: number | null
          viewed_at?: string
        }
        Relationships: []
      }
      pricelist_items: {
        Row: {
          artwork_id: string
          created_at: string
          display_order: number
          id: string
          is_visible: boolean
          price: string
          price_brl: string | null
          price_eur: string | null
          price_usd: string | null
          pricelist_id: string
          updated_at: string
        }
        Insert: {
          artwork_id: string
          created_at?: string
          display_order?: number
          id?: string
          is_visible?: boolean
          price?: string
          price_brl?: string | null
          price_eur?: string | null
          price_usd?: string | null
          pricelist_id?: string
          updated_at?: string
        }
        Update: {
          artwork_id?: string
          created_at?: string
          display_order?: number
          id?: string
          is_visible?: boolean
          price?: string
          price_brl?: string | null
          price_eur?: string | null
          price_usd?: string | null
          pricelist_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricelist_items_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: true
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricelist_items_pricelist_id_fkey"
            columns: ["pricelist_id"]
            isOneToOne: false
            referencedRelation: "pricelists"
            referencedColumns: ["id"]
          },
        ]
      }
      pricelists: {
        Row: {
          active_currency: string | null
          created_at: string
          id: string
          name: string
          password: string
          series_name: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          active_currency?: string | null
          created_at?: string
          id?: string
          name: string
          password?: string
          series_name?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          active_currency?: string | null
          created_at?: string
          id?: string
          name?: string
          password?: string
          series_name?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      series: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_visible: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_visible?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_visible?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      series_interactions: {
        Row: {
          artworks_viewed_count: number | null
          created_at: string
          expanded_description: boolean | null
          id: string
          series_id: string
          session_id: string
          viewed_at: string
        }
        Insert: {
          artworks_viewed_count?: number | null
          created_at?: string
          expanded_description?: boolean | null
          id?: string
          series_id: string
          session_id: string
          viewed_at?: string
        }
        Update: {
          artworks_viewed_count?: number | null
          created_at?: string
          expanded_description?: boolean | null
          id?: string
          series_id?: string
          session_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "series_interactions_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
      studio_images: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          image_url: string
          series_id: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url: string
          series_id?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string
          series_id?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "studio_images_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "studio_series"
            referencedColumns: ["id"]
          },
        ]
      }
      studio_scroll_tracking: {
        Row: {
          created_at: string
          id: string
          scrolled_at: string
          series_id: string
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          scrolled_at?: string
          series_id: string
          session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          scrolled_at?: string
          series_id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "studio_scroll_tracking_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "studio_series"
            referencedColumns: ["id"]
          },
        ]
      }
      studio_series: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_visible: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_visible?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_visible?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          session_id: string
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          session_id: string
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          session_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
