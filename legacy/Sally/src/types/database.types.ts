export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      heritage_dna: {
        Row: {
          id: string;
          user_id: string;
          completed_at: string | null;
          answers: Json;
          summary: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          completed_at?: string | null;
          answers: Json;
          summary?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          completed_at?: string | null;
          answers?: Json;
          summary?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          convergence_completed: boolean;
          limbic_trust: number;
          limbic_warmth: number;
          limbic_arousal: number;
          limbic_valence: number;
          posture: string;
          emotional_state: string | null;
          memory_vector_count: number;
          memory_working_count: number;
          dream_cycle_last_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          convergence_completed?: boolean;
          limbic_trust?: number;
          limbic_warmth?: number;
          limbic_arousal?: number;
          limbic_valence?: number;
          posture?: string;
          emotional_state?: string | null;
          memory_vector_count?: number;
          memory_working_count?: number;
          dream_cycle_last_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          convergence_completed?: boolean;
          limbic_trust?: number;
          limbic_warmth?: number;
          limbic_arousal?: number;
          limbic_valence?: number;
          posture?: string;
          emotional_state?: string | null;
          memory_vector_count?: number;
          memory_working_count?: number;
          dream_cycle_last_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      streak_history: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          streak_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          streak_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          streak_count?: number;
          created_at?: string;
        };
      };
    };
  };
}

export type HeritageDna = Database["public"]["Tables"]["heritage_dna"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
