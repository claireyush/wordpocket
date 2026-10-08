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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      card_states: {
        Row: {
          card_id: string
          due_date: string
          ease_factor: number
          id: string
          interval: number
          lapse_count: number
          last_reviewed_at: string | null
          status: string
          step_index: number
          updated_at: string
          user_id: string
        }
        Insert: {
          card_id: string
          due_date?: string
          ease_factor?: number
          id?: string
          interval?: number
          lapse_count?: number
          last_reviewed_at?: string | null
          status?: string
          step_index?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          card_id?: string
          due_date?: string
          ease_factor?: number
          id?: string
          interval?: number
          lapse_count?: number
          last_reviewed_at?: string | null
          status?: string
          step_index?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_states_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          created_at: string
          deck_id: string
          example: string | null
          id: string
          meaning: string
          pronunciation: string | null
          synonyms: string[] | null
          tags: string[] | null
          updated_at: string
          word: string
        }
        Insert: {
          created_at?: string
          deck_id: string
          example?: string | null
          id?: string
          meaning: string
          pronunciation?: string | null
          synonyms?: string[] | null
          tags?: string[] | null
          updated_at?: string
          word: string
        }
        Update: {
          created_at?: string
          deck_id?: string
          example?: string | null
          id?: string
          meaning?: string
          pronunciation?: string | null
          synonyms?: string[] | null
          tags?: string[] | null
          updated_at?: string
          word?: string
        }
        Relationships: [
          {
            foreignKeyName: "cards_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "decks"
            referencedColumns: ["id"]
          },
        ]
      }
      decks: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          folder_id: string | null
          id: string
          name: string
          sort_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          folder_id?: string | null
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          folder_id?: string | null
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "decks_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
      }
      folders: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          sort_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          nickname: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id: string
          nickname?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nickname?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      review_logs: {
        Row: {
          card_id: string
          ease_after: number
          ease_before: number
          id: string
          interval_after: number
          interval_before: number
          rating: string
          review_duration: number | null
          reviewed_at: string
          user_id: string
        }
        Insert: {
          card_id: string
          ease_after?: number
          ease_before?: number
          id?: string
          interval_after?: number
          interval_before?: number
          rating: string
          review_duration?: number | null
          reviewed_at?: string
          user_id: string
        }
        Update: {
          card_id?: string
          ease_after?: number
          ease_before?: number
          id?: string
          interval_after?: number
          interval_before?: number
          rating?: string
          review_duration?: number | null
          reviewed_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_logs_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          easy_interval: number
          graduating_interval: number
          id: string
          learning_steps: number[]
          leech_threshold: number
          max_interval: number
          new_cards_per_day: number
          updated_at: string
          user_id: string
        }
        Insert: {
          easy_interval?: number
          graduating_interval?: number
          id?: string
          learning_steps?: number[]
          leech_threshold?: number
          max_interval?: number
          new_cards_per_day?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          easy_interval?: number
          graduating_interval?: number
          id?: string
          learning_steps?: number[]
          leech_threshold?: number
          max_interval?: number
          new_cards_per_day?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_deck_progress: {
        Args: never
        Returns: {
          deck_id: string
          deck_name: string
          due_today: number
          folder_id: string
          learning_count: number
          memorized_count: number
          suspended_count: number
          total_cards: number
          unknown_count: number
          upcoming_count: number
        }[]
      }
      get_folder_review_queue: {
        Args: { p_folder_id: string; p_limit?: number }
        Returns: {
          card_id: string
          due_date: string
          ease_factor: number
          example: string
          interval: number
          lapse_count: number
          last_reviewed_at: string
          meaning: string
          pronunciation: string
          queue_type: string
          status: string
          step_index: number
          synonyms: string[]
          tags: string[]
          word: string
        }[]
      }
      get_heatmap_data: {
        Args: { p_days?: number }
        Returns: {
          date: string
          review_count: number
        }[]
      }
      get_memorized_weekly: {
        Args: never
        Returns: {
          date: string
          memorized_count: number
        }[]
      }
      get_range_review_queue: {
        Args: { p_deck_ids: string[]; p_limit?: number }
        Returns: {
          card_id: string
          due_date: string
          ease_factor: number
          example: string
          interval: number
          lapse_count: number
          last_reviewed_at: string
          meaning: string
          pronunciation: string
          queue_type: string
          status: string
          step_index: number
          synonyms: string[]
          tags: string[]
          word: string
        }[]
      }
      get_streak: { Args: never; Returns: Json }
      set_card_suspended: {
        Args: { p_card_id: string; p_suspended: boolean }
        Returns: undefined
      }
      get_study_queue: {
        Args: { p_deck_id: string; p_limit?: number }
        Returns: {
          card_id: string
          due_date: string
          ease_factor: number
          example: string
          interval: number
          lapse_count: number
          last_reviewed_at: string
          meaning: string
          pronunciation: string
          queue_type: string
          status: string
          step_index: number
          synonyms: string[]
          tags: string[]
          word: string
        }[]
      }
      get_today_stats: { Args: never; Returns: Json }
      search_cards: {
        Args: { p_query: string }
        Returns: {
          card_id: string
          deck_id: string
          deck_name: string
          folder_name: string
          meaning: string
          status: string
          word: string
        }[]
      }
      study_day_end: { Args: never; Returns: string }
      study_day_start: { Args: never; Returns: string }
      submit_review: {
        Args: {
          p_card_id: string
          p_rating: string
          p_review_duration?: number
        }
        Returns: Json
      }
      submit_reviews_batch: { Args: { p_reviews: Json }; Returns: Json }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
