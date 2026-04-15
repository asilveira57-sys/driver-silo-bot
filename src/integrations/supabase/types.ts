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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          categoria: string
          conteudo: string
          created_at: string
          id: string
          imagem_url: string | null
          meta_description: string | null
          meta_keywords: string | null
          meta_title: string | null
          publicado: boolean
          resumo: string | null
          slug: string
          titulo: string
          updated_at: string
        }
        Insert: {
          categoria?: string
          conteudo: string
          created_at?: string
          id?: string
          imagem_url?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          publicado?: boolean
          resumo?: string | null
          slug: string
          titulo: string
          updated_at?: string
        }
        Update: {
          categoria?: string
          conteudo?: string
          created_at?: string
          id?: string
          imagem_url?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          publicado?: boolean
          resumo?: string | null
          slug?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      download_logs: {
        Row: {
          created_at: string
          driver_id: string | null
          id: string
          user_ip: string | null
        }
        Insert: {
          created_at?: string
          driver_id?: string | null
          id?: string
          user_ip?: string | null
        }
        Update: {
          created_at?: string
          driver_id?: string | null
          id?: string
          user_ip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "download_logs_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          ativo: boolean
          conteudo: string | null
          created_at: string
          data_publicacao: string
          id: string
          link_download: string
          marca: string
          meta_description: string | null
          meta_keywords: string | null
          meta_title: string | null
          modelo: string
          nome: string
          sistema_operacional: string
          versao: string
        }
        Insert: {
          ativo?: boolean
          conteudo?: string | null
          created_at?: string
          data_publicacao?: string
          id?: string
          link_download: string
          marca: string
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          modelo: string
          nome: string
          sistema_operacional: string
          versao: string
        }
        Update: {
          ativo?: boolean
          conteudo?: string | null
          created_at?: string
          data_publicacao?: string
          id?: string
          link_download?: string
          marca?: string
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          modelo?: string
          nome?: string
          sistema_operacional?: string
          versao?: string
        }
        Relationships: []
      }
      materials: {
        Row: {
          categoria: string
          conteudo: string | null
          created_at: string
          descricao: string | null
          id: string
          imagem_url: string | null
          link_produto: string | null
          meta_description: string | null
          meta_keywords: string | null
          meta_title: string | null
          nome: string
          slug: string | null
        }
        Insert: {
          categoria: string
          conteudo?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          link_produto?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          nome: string
          slug?: string | null
        }
        Update: {
          categoria?: string
          conteudo?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          link_produto?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          nome?: string
          slug?: string | null
        }
        Relationships: []
      }
      printers: {
        Row: {
          conteudo: string | null
          created_at: string
          descricao: string | null
          id: string
          imagem_url: string | null
          imagens: string[] | null
          marca: string
          meta_description: string | null
          meta_keywords: string | null
          meta_title: string | null
          modelo: string
        }
        Insert: {
          conteudo?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          imagens?: string[] | null
          marca: string
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          modelo: string
        }
        Update: {
          conteudo?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          imagens?: string[] | null
          marca?: string
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          modelo?: string
        }
        Relationships: []
      }
      softwares: {
        Row: {
          conteudo: string | null
          created_at: string
          descricao: string | null
          id: string
          link_download: string
          meta_description: string | null
          meta_keywords: string | null
          meta_title: string | null
          nome: string
          versao: string
        }
        Insert: {
          conteudo?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          link_download: string
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          nome: string
          versao: string
        }
        Update: {
          conteudo?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          link_download?: string
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          nome?: string
          versao?: string
        }
        Relationships: []
      }
      tutorials: {
        Row: {
          categoria: string
          conteudo: string
          created_at: string
          id: string
          imagem_url: string | null
          meta_description: string | null
          meta_keywords: string | null
          meta_title: string | null
          slug: string
          titulo: string
        }
        Insert: {
          categoria: string
          conteudo: string
          created_at?: string
          id?: string
          imagem_url?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          slug: string
          titulo: string
        }
        Update: {
          categoria?: string
          conteudo?: string
          created_at?: string
          id?: string
          imagem_url?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          slug?: string
          titulo?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
