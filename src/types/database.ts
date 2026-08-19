/**
 * VibeForge database types — auto-generated schema mirror.
 *
 * These types provide end-to-end type safety when using the Supabase
 * client with `createClient<Database>()`.
 */

// ----------------------------------------------------------------
// Simulation status union
// ----------------------------------------------------------------
export type SimulationStatus = 'pending' | 'processing' | 'completed' | 'failed'

// ----------------------------------------------------------------
// Row types (what you GET back from the database)
// ----------------------------------------------------------------
export interface Simulation {
  id: string
  user_id: string
  title: string
  input_data: Record<string, unknown>
  paths: Record<string, unknown>[]
  action_plan: Record<string, unknown>
  media: Record<string, unknown>
  status: SimulationStatus
  created_at: string
  updated_at: string
}

export interface Embedding {
  id: string
  user_id: string
  simulation_id: string
  content: string
  embedding: number[]
  metadata: Record<string, unknown>
  created_at: string
}

// ----------------------------------------------------------------
// Insert types (what you SEND to create a row)
// ----------------------------------------------------------------
export interface SimulationInsert {
  id?: string
  user_id: string
  title: string
  input_data?: Record<string, unknown>
  paths?: Record<string, unknown>[]
  action_plan?: Record<string, unknown>
  media?: Record<string, unknown>
  status?: SimulationStatus
  created_at?: string
  updated_at?: string
}

export interface EmbeddingInsert {
  id?: string
  user_id: string
  simulation_id: string
  content: string
  embedding: number[]
  metadata?: Record<string, unknown>
  created_at?: string
}

// ----------------------------------------------------------------
// Update types (partial — only fields you want to change)
// ----------------------------------------------------------------
export interface SimulationUpdate {
  title?: string
  input_data?: Record<string, unknown>
  paths?: Record<string, unknown>[]
  action_plan?: Record<string, unknown>
  media?: Record<string, unknown>
  status?: SimulationStatus
  updated_at?: string
}

// ----------------------------------------------------------------
// Supabase Database type (used with createClient<Database>())
// ----------------------------------------------------------------
export interface Database {
  public: {
    Tables: {
      simulations: {
        Row: Simulation
        Insert: SimulationInsert
        Update: SimulationUpdate
        Relationships: [
          {
            foreignKeyName: 'simulations_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      embeddings: {
        Row: Embedding
        Insert: EmbeddingInsert
        Update: never
        Relationships: [
          {
            foreignKeyName: 'embeddings_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'embeddings_simulation_id_fkey'
            columns: ['simulation_id']
            referencedRelation: 'simulations'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      match_embeddings: {
        Args: {
          query_embedding: number[]
          match_threshold?: number
          match_count?: number
          filter_user_id?: string
        }
        Returns: {
          id: string
          simulation_id: string
          content: string
          metadata: Record<string, unknown>
          similarity: number
        }[]
      }
    }
    Enums: {
      simulation_status: SimulationStatus
    }
    CompositeTypes: Record<string, never>
  }
}
