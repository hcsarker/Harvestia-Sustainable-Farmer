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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          requirement_type: string
          requirement_value: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          requirement_type: string
          requirement_value?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          requirement_type?: string
          requirement_value?: number | null
        }
        Relationships: []
      }
      courses: {
        Row: {
          certificate: boolean | null
          created_at: string
          description: string | null
          difficulty: string | null
          duration: string | null
          id: string
          instructor: string | null
          lessons_count: number | null
          quick_facts: string[] | null
          rating: number | null
          students_count: number | null
          title: string
        }
        Insert: {
          certificate?: boolean | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration?: string | null
          id?: string
          instructor?: string | null
          lessons_count?: number | null
          quick_facts?: string[] | null
          rating?: number | null
          students_count?: number | null
          title: string
        }
        Update: {
          certificate?: boolean | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration?: string | null
          id?: string
          instructor?: string | null
          lessons_count?: number | null
          quick_facts?: string[] | null
          rating?: number | null
          students_count?: number | null
          title?: string
        }
        Relationships: []
      }
      mini_games: {
        Row: {
          created_at: string
          description: string | null
          difficulty: string | null
          duration: string | null
          game_type: string
          id: string
          nasa_data_type: string | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration?: string | null
          game_type: string
          id?: string
          nasa_data_type?: string | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration?: string | null
          game_type?: string
          id?: string
          nasa_data_type?: string | null
          title?: string
        }
        Relationships: []
      }
      nasa_data_cache: {
        Row: {
          cached_at: string
          data: Json
          data_type: string
          date_range: unknown | null
          expires_at: string
          id: string
          location: string | null
        }
        Insert: {
          cached_at?: string
          data: Json
          data_type: string
          date_range?: unknown | null
          expires_at?: string
          id?: string
          location?: string | null
        }
        Update: {
          cached_at?: string
          data?: Json
          data_type?: string
          date_range?: unknown | null
          expires_at?: string
          id?: string
          location?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          experience_points: number | null
          farm_type: string | null
          id: string
          join_date: string
          level: number | null
          location: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          experience_points?: number | null
          farm_type?: string | null
          id?: string
          join_date?: string
          level?: number | null
          location?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          experience_points?: number | null
          farm_type?: string | null
          id?: string
          join_date?: string
          level?: number | null
          location?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          correct_answer: string
          explanation: string | null
          id: string
          nasa_data_reference: Json | null
          options: Json
          question: string
          quiz_id: string
        }
        Insert: {
          correct_answer: string
          explanation?: string | null
          id?: string
          nasa_data_reference?: Json | null
          options: Json
          question: string
          quiz_id: string
        }
        Update: {
          correct_answer?: string
          explanation?: string | null
          id?: string
          nasa_data_reference?: Json | null
          options?: Json
          question?: string
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          created_at: string
          difficulty: string | null
          id: string
          nasa_topic: string | null
          questions_count: number | null
          title: string
        }
        Insert: {
          created_at?: string
          difficulty?: string | null
          id?: string
          nasa_topic?: string | null
          questions_count?: number | null
          title: string
        }
        Update: {
          created_at?: string
          difficulty?: string | null
          id?: string
          nasa_topic?: string | null
          questions_count?: number | null
          title?: string
        }
        Relationships: []
      }
      story_chapters: {
        Row: {
          chapter_number: number
          created_at: string
          description: string | null
          duration: string | null
          id: string
          nasa_data_integration: Json | null
          status: string | null
          title: string
        }
        Insert: {
          chapter_number: number
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          nasa_data_integration?: Json | null
          status?: string | null
          title: string
        }
        Update: {
          chapter_number?: number
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          nasa_data_integration?: Json | null
          status?: string | null
          title?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_course_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          course_id: string
          id: string
          progress: number | null
          started_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          course_id: string
          id?: string
          progress?: number | null
          started_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          course_id?: string
          id?: string
          progress?: number | null
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_course_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_game_scores: {
        Row: {
          game_id: string
          high_score: number
          id: string
          last_played: string
          score: number
          times_played: number | null
          user_id: string
        }
        Insert: {
          game_id: string
          high_score?: number
          id?: string
          last_played?: string
          score?: number
          times_played?: number | null
          user_id: string
        }
        Update: {
          game_id?: string
          high_score?: number
          id?: string
          last_played?: string
          score?: number
          times_played?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_game_scores_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "mini_games"
            referencedColumns: ["id"]
          },
        ]
      }
      user_quiz_results: {
        Row: {
          answers: Json | null
          completed_at: string
          id: string
          quiz_id: string
          score: number
          total_questions: number
          user_id: string
        }
        Insert: {
          answers?: Json | null
          completed_at?: string
          id?: string
          quiz_id: string
          score?: number
          total_questions: number
          user_id: string
        }
        Update: {
          answers?: Json | null
          completed_at?: string
          id?: string
          quiz_id?: string
          score?: number
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_quiz_results_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_story_progress: {
        Row: {
          chapter_id: string
          completed: boolean | null
          completed_at: string | null
          id: string
          progress: number | null
          started_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          chapter_id: string
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          progress?: number | null
          started_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          chapter_id?: string
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          progress?: number | null
          started_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_story_progress_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "story_chapters"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_quiz_questions_secure: {
        Args: { quiz_id_param: string }
        Returns: {
          explanation: string
          id: string
          nasa_data_reference: Json
          options: Json
          question: string
          quiz_id: string
        }[]
      }
      submit_quiz_results: {
        Args: { answers_param: Json; quiz_id_param: string }
        Returns: Json
      }
      validate_quiz_answer: {
        Args: { question_id: string; submitted_answer: string }
        Returns: boolean
      }
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
