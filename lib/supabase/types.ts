export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      credits: {
        Row: {
          id: string
          user_id: string
          amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      add_credits: {
        Args: {
          add_amount: number
          user_id: string
        }
        Returns: void
      }
      deduct_credits: {
        Args: {
          deduct_amount: number
          user_id: string
        }
        Returns: void
      }
    }
  }
}