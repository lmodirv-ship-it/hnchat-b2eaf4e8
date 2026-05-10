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
      ad_campaigns: {
        Row: {
          budget: number
          clicks: number
          conversions: number
          created_at: string
          description: string | null
          ends_at: string | null
          id: string
          impressions: number
          name: string
          spent: number
          starts_at: string | null
          status: Database["public"]["Enums"]["ad_status"]
          target_audience: Json | null
          thumbnail_url: string | null
          type: Database["public"]["Enums"]["ad_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          budget?: number
          clicks?: number
          conversions?: number
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          impressions?: number
          name: string
          spent?: number
          starts_at?: string | null
          status?: Database["public"]["Enums"]["ad_status"]
          target_audience?: Json | null
          thumbnail_url?: string | null
          type?: Database["public"]["Enums"]["ad_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          budget?: number
          clicks?: number
          conversions?: number
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          impressions?: number
          name?: string
          spent?: number
          starts_at?: string | null
          status?: Database["public"]["Enums"]["ad_status"]
          target_audience?: Json | null
          thumbnail_url?: string | null
          type?: Database["public"]["Enums"]["ad_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_ads_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_conversations: {
        Row: {
          created_at: string
          id: string
          is_archived: boolean
          metadata: Json
          model: string
          system_prompt: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_archived?: boolean
          metadata?: Json
          model?: string
          system_prompt?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_archived?: boolean
          metadata?: Json
          model?: string
          system_prompt?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_ai_conv_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_messages: {
        Row: {
          attachments: Json
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          attachments?: Json
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          attachments?: Json
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_ai_msg_conversation"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_ai_msg_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_tool_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      ai_tools: {
        Row: {
          category_id: string | null
          category_slug: string | null
          cons: string[] | null
          created_at: string
          description: string | null
          features: Json | null
          id: string
          is_featured: boolean | null
          is_free: boolean | null
          logo_url: string | null
          long_description: string | null
          name: string
          pricing_info: string | null
          pros: string[] | null
          rating: number | null
          slug: string
          tags: string[] | null
          updated_at: string
          views_count: number | null
          website_url: string | null
        }
        Insert: {
          category_id?: string | null
          category_slug?: string | null
          cons?: string[] | null
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_featured?: boolean | null
          is_free?: boolean | null
          logo_url?: string | null
          long_description?: string | null
          name: string
          pricing_info?: string | null
          pros?: string[] | null
          rating?: number | null
          slug: string
          tags?: string[] | null
          updated_at?: string
          views_count?: number | null
          website_url?: string | null
        }
        Update: {
          category_id?: string | null
          category_slug?: string | null
          cons?: string[] | null
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_featured?: boolean | null
          is_free?: boolean | null
          logo_url?: string | null
          long_description?: string | null
          name?: string
          pricing_info?: string | null
          pros?: string[] | null
          rating?: number | null
          slug?: string
          tags?: string[] | null
          updated_at?: string
          views_count?: number | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_tools_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ai_tool_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_usage: {
        Row: {
          completion_tokens: number
          cost: number
          created_at: string
          feature: string
          id: string
          prompt_tokens: number
          total_tokens: number
          user_id: string
        }
        Insert: {
          completion_tokens?: number
          cost?: number
          created_at?: string
          feature: string
          id?: string
          prompt_tokens?: number
          total_tokens?: number
          user_id: string
        }
        Update: {
          completion_tokens?: number
          cost?: number
          created_at?: string
          feature?: string
          id?: string
          prompt_tokens?: number
          total_tokens?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_ai_usage_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          created_at: string
          description: string | null
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      app_versions: {
        Row: {
          changes: Json
          created_at: string
          created_by: string | null
          description: string | null
          files_changed: Json
          id: string
          name: string
          updated_at: string
          version: string
        }
        Insert: {
          changes?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          files_changed?: Json
          id?: string
          name: string
          updated_at?: string
          version: string
        }
        Update: {
          changes?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          files_changed?: Json
          id?: string
          name?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      article_bookmarks: {
        Row: {
          article_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          article_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          article_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_bookmarks_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      article_categories: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          name_ar: string | null
          name_fr: string | null
          slug: string
          sort_order: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          name_ar?: string | null
          name_fr?: string | null
          slug: string
          sort_order?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          name_ar?: string | null
          name_fr?: string | null
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      article_comments: {
        Row: {
          article_id: string
          content: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          article_id: string
          content: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          article_id?: string
          content?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_comments_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      article_likes: {
        Row: {
          article_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          article_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          article_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_likes_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author_id: string
          category_id: string | null
          category_slug: string | null
          content: string | null
          created_at: string
          external_id: string | null
          featured_image: string | null
          id: string
          language: string
          likes_count: number
          published_at: string | null
          reading_time: number | null
          seo_description: string | null
          seo_title: string | null
          short_description: string | null
          slug: string
          source_project: string | null
          source_url: string | null
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          video_url: string | null
          views_count: number
        }
        Insert: {
          author_id: string
          category_id?: string | null
          category_slug?: string | null
          content?: string | null
          created_at?: string
          external_id?: string | null
          featured_image?: string | null
          id?: string
          language?: string
          likes_count?: number
          published_at?: string | null
          reading_time?: number | null
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          slug: string
          source_project?: string | null
          source_url?: string | null
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          video_url?: string | null
          views_count?: number
        }
        Update: {
          author_id?: string
          category_id?: string | null
          category_slug?: string | null
          content?: string | null
          created_at?: string
          external_id?: string | null
          featured_image?: string | null
          id?: string
          language?: string
          likes_count?: number
          published_at?: string | null
          reading_time?: number | null
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          slug?: string
          source_project?: string | null
          source_url?: string | null
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          video_url?: string | null
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "article_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          added_at: string
          id: string
          product_id: string
          quantity: number
          user_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          product_id: string
          quantity?: number
          user_id: string
        }
        Update: {
          added_at?: string
          id?: string
          product_id?: string
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_cart_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_cart_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_items: {
        Row: {
          category: string | null
          created_at: string
          created_by: string | null
          currency: string
          description: string | null
          downloads_count: number
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          link_url: string | null
          metadata: Json
          price: number | null
          rating: number | null
          sort_order: number
          title: string
          type: Database["public"]["Enums"]["catalog_item_type"]
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          downloads_count?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          link_url?: string | null
          metadata?: Json
          price?: number | null
          rating?: number | null
          sort_order?: number
          title: string
          type: Database["public"]["Enums"]["catalog_item_type"]
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          downloads_count?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          link_url?: string | null
          metadata?: Json
          price?: number | null
          rating?: number | null
          sort_order?: number
          title?: string
          type?: Database["public"]["Enums"]["catalog_item_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_catalog_creator"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_invitations: {
        Row: {
          created_at: string
          id: string
          receiver_id: string
          sender_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          receiver_id: string
          sender_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          receiver_id?: string
          sender_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_comments_post"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_comments_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_cp_conversation"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_cp_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          is_group: boolean
          last_message_at: string
          name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_group?: boolean
          last_message_at?: string
          name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_group?: boolean
          last_message_at?: string
          name?: string | null
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          description: string | null
          enabled: boolean
          key: string
          rollout_percent: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          description?: string | null
          enabled?: boolean
          key: string
          rollout_percent?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          description?: string | null
          enabled?: boolean
          key?: string
          rollout_percent?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_follows_follower"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_follows_following"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_gm_group"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_gm_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_posts: {
        Row: {
          comments_count: number
          content: string | null
          country_code: string | null
          created_at: string
          group_id: string
          id: string
          is_hidden: boolean
          is_pinned: boolean
          language_code: string | null
          likes_count: number
          media_urls: string[] | null
          user_id: string
        }
        Insert: {
          comments_count?: number
          content?: string | null
          country_code?: string | null
          created_at?: string
          group_id: string
          id?: string
          is_hidden?: boolean
          is_pinned?: boolean
          language_code?: string | null
          likes_count?: number
          media_urls?: string[] | null
          user_id: string
        }
        Update: {
          comments_count?: number
          content?: string | null
          country_code?: string | null
          created_at?: string
          group_id?: string
          id?: string
          is_hidden?: boolean
          is_pinned?: boolean
          language_code?: string | null
          likes_count?: number
          media_urls?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_gp_group"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_gp_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_posts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          country_code: string | null
          cover_url: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_private: boolean
          language_code: string | null
          member_count: number
          name: string
          post_count: number
          slug: string
          updated_at: string
        }
        Insert: {
          country_code?: string | null
          cover_url?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_private?: boolean
          language_code?: string | null
          member_count?: number
          name: string
          post_count?: number
          slug: string
          updated_at?: string
        }
        Update: {
          country_code?: string | null
          cover_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_private?: boolean
          language_code?: string | null
          member_count?: number
          name?: string
          post_count?: number
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_groups_creator"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_likes_post"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_likes_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      live_stream_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          stream_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          stream_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          stream_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_lsm_stream"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "live_streams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_lsm_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_stream_messages_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "live_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      live_streams: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          ended_at: string | null
          id: string
          is_private: boolean
          likes_count: number
          peak_viewers: number
          playback_url: string | null
          started_at: string | null
          status: string
          stream_url: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
          viewer_count: number
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          ended_at?: string | null
          id?: string
          is_private?: boolean
          likes_count?: number
          peak_viewers?: number
          playback_url?: string | null
          started_at?: string | null
          status?: string
          stream_url?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
          viewer_count?: number
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          ended_at?: string | null
          id?: string
          is_private?: boolean
          likes_count?: number
          peak_viewers?: number
          playback_url?: string | null
          started_at?: string | null
          status?: string
          stream_url?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          viewer_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_live_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mail_labels: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_mail_labels_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mail_message_labels: {
        Row: {
          created_at: string
          label_id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          label_id: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          label_id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_mml_label"
            columns: ["label_id"]
            isOneToOne: false
            referencedRelation: "mail_labels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mml_message"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "mail_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mml_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mail_message_labels_label_id_fkey"
            columns: ["label_id"]
            isOneToOne: false
            referencedRelation: "mail_labels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mail_message_labels_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "mail_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      mail_messages: {
        Row: {
          archived_by_recipient: boolean
          archived_by_sender: boolean
          attachments: Json
          bcc_ids: string[]
          body: string
          cc_ids: string[]
          created_at: string
          id: string
          is_draft: boolean
          is_important: boolean
          is_read: boolean
          is_starred_by_recipient: boolean
          is_starred_by_sender: boolean
          read_at: string | null
          recipient_id: string | null
          reply_to: string | null
          sender_id: string
          sent_at: string | null
          spam_by_recipient: boolean
          subject: string
          thread_id: string
          trashed_by_recipient: boolean
          trashed_by_sender: boolean
          updated_at: string
        }
        Insert: {
          archived_by_recipient?: boolean
          archived_by_sender?: boolean
          attachments?: Json
          bcc_ids?: string[]
          body?: string
          cc_ids?: string[]
          created_at?: string
          id?: string
          is_draft?: boolean
          is_important?: boolean
          is_read?: boolean
          is_starred_by_recipient?: boolean
          is_starred_by_sender?: boolean
          read_at?: string | null
          recipient_id?: string | null
          reply_to?: string | null
          sender_id: string
          sent_at?: string | null
          spam_by_recipient?: boolean
          subject?: string
          thread_id?: string
          trashed_by_recipient?: boolean
          trashed_by_sender?: boolean
          updated_at?: string
        }
        Update: {
          archived_by_recipient?: boolean
          archived_by_sender?: boolean
          attachments?: Json
          bcc_ids?: string[]
          body?: string
          cc_ids?: string[]
          created_at?: string
          id?: string
          is_draft?: boolean
          is_important?: boolean
          is_read?: boolean
          is_starred_by_recipient?: boolean
          is_starred_by_sender?: boolean
          read_at?: string | null
          recipient_id?: string | null
          reply_to?: string | null
          sender_id?: string
          sent_at?: string | null
          spam_by_recipient?: boolean
          subject?: string
          thread_id?: string
          trashed_by_recipient?: boolean
          trashed_by_sender?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_mail_recipient"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mail_sender"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: Json | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          attachments?: Json | null
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          attachments?: Json | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_messages_conversation"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_messages_sender"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean
          source: string | null
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean
          source?: string | null
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean
          source?: string | null
          subscribed_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          actor_id: string | null
          content: string | null
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          title: string | null
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title?: string | null
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          actor_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title?: string | null
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_notifications_actor"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_notifications_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          currency: string
          id: string
          image_url: string | null
          order_id: string
          product_id: string
          quantity: number
          seller_id: string
          subtotal: number
          title: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          currency?: string
          id?: string
          image_url?: string | null
          order_id: string
          product_id: string
          quantity?: number
          seller_id: string
          subtotal: number
          title: string
          unit_price: number
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          image_url?: string | null
          order_id?: string
          product_id?: string
          quantity?: number
          seller_id?: string
          subtotal?: number
          title?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_oi_order"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_oi_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_oi_seller"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json | null
          buyer_id: string
          created_at: string
          currency: string
          delivered_at: string | null
          id: string
          notes: string | null
          paid_at: string | null
          payment_method: string | null
          payment_reference: string | null
          placed_at: string
          seller_id: string | null
          shipped_at: string | null
          shipping_address: Json | null
          status: Database["public"]["Enums"]["order_status"]
          total_amount: number
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          billing_address?: Json | null
          buyer_id: string
          created_at?: string
          currency?: string
          delivered_at?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          placed_at?: string
          seller_id?: string | null
          shipped_at?: string | null
          shipping_address?: Json | null
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          billing_address?: Json | null
          buyer_id?: string
          created_at?: string
          currency?: string
          delivered_at?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          placed_at?: string
          seller_id?: string | null
          shipped_at?: string | null
          shipping_address?: Json | null
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_orders_buyer"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_orders_seller"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_audit_logs: {
        Row: {
          action: string
          actor_id: string
          created_at: string
          id: string
          ip_address: string | null
          metadata: Json | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_audit_actor"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_settings: {
        Row: {
          ai_enabled: boolean
          created_at: string
          id: string
          maintenance_mode: boolean
          owner_id: string
          platform_name: string
          registration_enabled: boolean
          updated_at: string
        }
        Insert: {
          ai_enabled?: boolean
          created_at?: string
          id?: string
          maintenance_mode?: boolean
          owner_id: string
          platform_name?: string
          registration_enabled?: boolean
          updated_at?: string
        }
        Update: {
          ai_enabled?: boolean
          created_at?: string
          id?: string
          maintenance_mode?: boolean
          owner_id?: string
          platform_name?: string
          registration_enabled?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_owner_settings_owner"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          comments_count: number
          content: string | null
          created_at: string
          id: string
          likes_count: number
          media_urls: string[] | null
          type: Database["public"]["Enums"]["post_type"]
          updated_at: string
          user_id: string
          views_count: number
        }
        Insert: {
          comments_count?: number
          content?: string | null
          created_at?: string
          id?: string
          likes_count?: number
          media_urls?: string[] | null
          type?: Database["public"]["Enums"]["post_type"]
          updated_at?: string
          user_id: string
          views_count?: number
        }
        Update: {
          comments_count?: number
          content?: string | null
          created_at?: string
          id?: string
          likes_count?: number
          media_urls?: string[] | null
          type?: Database["public"]["Enums"]["post_type"]
          updated_at?: string
          user_id?: string
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_posts_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          currency: string
          description: string | null
          id: string
          images: string[] | null
          is_active: boolean
          price: number
          seller_id: string
          stock: number
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean
          price: number
          seller_id: string
          stock?: number
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean
          price?: number
          seller_id?: string
          stock?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_products_seller"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_privacy_settings: {
        Row: {
          created_at: string
          id: string
          show_bio: boolean
          show_follow_button: boolean
          show_followers_count: boolean
          show_following_count: boolean
          show_groups: boolean
          show_join_date: boolean
          show_last_active: boolean
          show_media: boolean
          show_message_button: boolean
          show_online_status: boolean
          show_posts: boolean
          show_posts_count: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          show_bio?: boolean
          show_follow_button?: boolean
          show_followers_count?: boolean
          show_following_count?: boolean
          show_groups?: boolean
          show_join_date?: boolean
          show_last_active?: boolean
          show_media?: boolean
          show_message_button?: boolean
          show_online_status?: boolean
          show_posts?: boolean
          show_posts_count?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          show_bio?: boolean
          show_follow_button?: boolean
          show_followers_count?: boolean
          show_following_count?: boolean
          show_groups?: boolean
          show_join_date?: boolean
          show_last_active?: boolean
          show_media?: boolean
          show_message_button?: boolean
          show_online_status?: boolean
          show_posts?: boolean
          show_posts_count?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_privacy_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bg_color: string | null
          bio: string | null
          btn_color: string | null
          country_code: string | null
          cover_url: string | null
          created_at: string
          followers_count: number
          following_count: number
          full_name: string | null
          id: string
          is_online: boolean
          is_verified: boolean
          language_code: string | null
          last_seen: string | null
          locale_source: string | null
          member_id: string | null
          posts_count: number
          referral_code: string | null
          status: string
          text_color: string | null
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bg_color?: string | null
          bio?: string | null
          btn_color?: string | null
          country_code?: string | null
          cover_url?: string | null
          created_at?: string
          followers_count?: number
          following_count?: number
          full_name?: string | null
          id: string
          is_online?: boolean
          is_verified?: boolean
          language_code?: string | null
          last_seen?: string | null
          locale_source?: string | null
          member_id?: string | null
          posts_count?: number
          referral_code?: string | null
          status?: string
          text_color?: string | null
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bg_color?: string | null
          bio?: string | null
          btn_color?: string | null
          country_code?: string | null
          cover_url?: string | null
          created_at?: string
          followers_count?: number
          following_count?: number
          full_name?: string | null
          id?: string
          is_online?: boolean
          is_verified?: boolean
          language_code?: string | null
          last_seen?: string | null
          locale_source?: string | null
          member_id?: string | null
          posts_count?: number
          referral_code?: string | null
          status?: string
          text_color?: string | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      public_chat_messages: {
        Row: {
          attachment_type: string | null
          attachment_url: string | null
          content: string | null
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          attachment_type?: string | null
          attachment_url?: string | null
          content?: string | null
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          attachment_type?: string | null
          attachment_url?: string | null
          content?: string | null
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string | null
          created_at: string
          device_name: string | null
          device_type: string | null
          endpoint: string
          id: string
          is_active: boolean
          last_used_at: string | null
          p256dh: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth?: string | null
          created_at?: string
          device_name?: string | null
          device_type?: string | null
          endpoint: string
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          p256dh?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth?: string | null
          created_at?: string
          device_name?: string | null
          device_type?: string | null
          endpoint?: string
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          p256dh?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_push_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          referral_code: string
          referred_id: string | null
          referrer_id: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referral_code: string
          referred_id?: string | null
          referrer_id: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referral_code?: string
          referred_id?: string | null
          referrer_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_referrals_referred"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_referrals_referrer"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          id: string
          reason: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          target_id: string
          target_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          target_id: string
          target_type: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          target_id?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_reports_reporter"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_reports_reviewer"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_chats: {
        Row: {
          created_at: string
          id: string
          messages: Json
          share_id: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          messages?: Json
          share_id?: string
          title?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          messages?: Json
          share_id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_shared_chats_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      site_visits: {
        Row: {
          country: string | null
          device_type: string | null
          first_seen: string
          id: string
          ip_address: string | null
          last_seen: string
          path: string | null
          referrer: string | null
          session_id: string
          user_agent: string | null
        }
        Insert: {
          country?: string | null
          device_type?: string | null
          first_seen?: string
          id?: string
          ip_address?: string | null
          last_seen?: string
          path?: string | null
          referrer?: string | null
          session_id: string
          user_agent?: string | null
        }
        Update: {
          country?: string | null
          device_type?: string | null
          first_seen?: string
          id?: string
          ip_address?: string | null
          last_seen?: string
          path?: string | null
          referrer?: string | null
          session_id?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      stories: {
        Row: {
          caption: string | null
          created_at: string
          expires_at: string
          id: string
          media_url: string
          user_id: string
          views_count: number
        }
        Insert: {
          caption?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          media_url: string
          user_id: string
          views_count?: number
        }
        Update: {
          caption?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          media_url?: string
          user_id?: string
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_stories_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          plan: string
          started_at: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan?: string
          started_at?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan?: string
          started_at?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_subscriptions_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string
          id: string
          priority: string
          resolved_at: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description?: string
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_tickets_assigned"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tickets_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      trade_offers: {
        Row: {
          accepted_at: string | null
          cash_amount: number
          completed_at: string | null
          created_at: string
          currency: string
          expires_at: string | null
          id: string
          initiator_id: string
          message: string | null
          offered_items: Json
          recipient_id: string
          requested_items: Json
          status: Database["public"]["Enums"]["trade_status"]
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          cash_amount?: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          expires_at?: string | null
          id?: string
          initiator_id: string
          message?: string | null
          offered_items?: Json
          recipient_id: string
          requested_items?: Json
          status?: Database["public"]["Enums"]["trade_status"]
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          cash_amount?: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          expires_at?: string | null
          id?: string
          initiator_id?: string
          message?: string | null
          offered_items?: Json
          recipient_id?: string
          requested_items?: Json
          status?: Database["public"]["Enums"]["trade_status"]
          updated_at?: string
        }
        Relationships: []
      }
      usage_logs: {
        Row: {
          cost: number
          created_at: string
          id: string
          metadata: Json
          model: string | null
          request_path: string | null
          service: string
          tokens_used: number
          user_id: string
        }
        Insert: {
          cost?: number
          created_at?: string
          id?: string
          metadata?: Json
          model?: string | null
          request_path?: string | null
          service?: string
          tokens_used?: number
          user_id: string
        }
        Update: {
          cost?: number
          created_at?: string
          id?: string
          metadata?: Json
          model?: string | null
          request_path?: string | null
          service?: string
          tokens_used?: number
          user_id?: string
        }
        Relationships: []
      }
      user_bookmarks: {
        Row: {
          created_at: string
          folder: string
          id: string
          item_id: string
          item_type: string
          note: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          folder?: string
          id?: string
          item_id: string
          item_type: string
          note?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          folder?: string
          id?: string
          item_id?: string
          item_type?: string
          note?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_channels: {
        Row: {
          channel_avatar: string | null
          channel_id: string | null
          channel_name: string | null
          channel_url: string
          created_at: string
          id: string
          last_synced_at: string | null
          last_video_id: string | null
          platform: string
          updated_at: string
          user_id: string
        }
        Insert: {
          channel_avatar?: string | null
          channel_id?: string | null
          channel_name?: string | null
          channel_url: string
          created_at?: string
          id?: string
          last_synced_at?: string | null
          last_video_id?: string | null
          platform?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          channel_avatar?: string | null
          channel_id?: string | null
          channel_name?: string | null
          channel_url?: string
          created_at?: string
          id?: string
          last_synced_at?: string | null
          last_video_id?: string | null
          platform?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_metrics: {
        Row: {
          dimension: string | null
          id: string
          metric_key: string
          recorded_at: string
          user_id: string
          value: number
        }
        Insert: {
          dimension?: string | null
          id?: string
          metric_key: string
          recorded_at?: string
          user_id: string
          value?: number
        }
        Update: {
          dimension?: string | null
          id?: string
          metric_key?: string
          recorded_at?: string
          user_id?: string
          value?: number
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
      voice_room_participants: {
        Row: {
          id: string
          is_muted: boolean
          joined_at: string
          left_at: string | null
          role: string
          room_id: string
          user_id: string
        }
        Insert: {
          id?: string
          is_muted?: boolean
          joined_at?: string
          left_at?: string | null
          role?: string
          room_id: string
          user_id: string
        }
        Update: {
          id?: string
          is_muted?: boolean
          joined_at?: string
          left_at?: string | null
          role?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_room_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "voice_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_rooms: {
        Row: {
          created_at: string
          description: string | null
          ended_at: string | null
          host_id: string
          id: string
          is_active: boolean
          is_private: boolean
          max_participants: number
          participant_count: number
          started_at: string
          title: string
          topic: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          ended_at?: string | null
          host_id: string
          id?: string
          is_active?: boolean
          is_private?: boolean
          max_participants?: number
          participant_count?: number
          started_at?: string
          title: string
          topic?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          ended_at?: string | null
          host_id?: string
          id?: string
          is_active?: boolean
          is_private?: boolean
          max_participants?: number
          participant_count?: number
          started_at?: string
          title?: string
          topic?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_notification: {
        Args: {
          _actor_id: string
          _content: string
          _link?: string
          _type: Database["public"]["Enums"]["notification_type"]
          _user_id: string
        }
        Returns: undefined
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      generate_member_id: { Args: never; Returns: string }
      get_stream_ingest_url: { Args: { _stream_id: string }; Returns: string }
      get_visitor_stats: {
        Args: never
        Returns: {
          online_count: number
          total_count: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_article_views: {
        Args: { _article_id: string }
        Returns: undefined
      }
      increment_tool_views: { Args: { _tool_id: string }; Returns: undefined }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_conversation_participant: {
        Args: { _conversation_id: string; _user_id: string }
        Returns: boolean
      }
      is_group_admin: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
      is_group_member: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
      is_moderator: { Args: { _user_id: string }; Returns: boolean }
      is_owner: { Args: { _user_id: string }; Returns: boolean }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      write_owner_audit: {
        Args: {
          _action: string
          _metadata?: Json
          _target_id?: string
          _target_type?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      ad_status: "draft" | "active" | "paused" | "ended"
      ad_type: "video" | "banner" | "story" | "product" | "sponsored_post"
      app_role:
        | "admin"
        | "creator"
        | "shopper"
        | "user"
        | "owner"
        | "group_admin"
        | "moderator"
      catalog_item_type:
        | "app"
        | "game"
        | "shop_product"
        | "ad_template"
        | "push_template"
        | "email_template"
        | "ai_tool"
        | "live_stream"
        | "voice_room"
        | "page"
      notification_type:
        | "like"
        | "comment"
        | "follow"
        | "mention"
        | "message"
        | "system"
        | "new_post"
      order_status:
        | "pending"
        | "paid"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "refunded"
      post_type: "post" | "video" | "short" | "story" | "article"
      trade_status:
        | "pending"
        | "accepted"
        | "rejected"
        | "completed"
        | "cancelled"
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
      ad_status: ["draft", "active", "paused", "ended"],
      ad_type: ["video", "banner", "story", "product", "sponsored_post"],
      app_role: [
        "admin",
        "creator",
        "shopper",
        "user",
        "owner",
        "group_admin",
        "moderator",
      ],
      catalog_item_type: [
        "app",
        "game",
        "shop_product",
        "ad_template",
        "push_template",
        "email_template",
        "ai_tool",
        "live_stream",
        "voice_room",
        "page",
      ],
      notification_type: [
        "like",
        "comment",
        "follow",
        "mention",
        "message",
        "system",
        "new_post",
      ],
      order_status: [
        "pending",
        "paid",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      post_type: ["post", "video", "short", "story", "article"],
      trade_status: [
        "pending",
        "accepted",
        "rejected",
        "completed",
        "cancelled",
      ],
    },
  },
} as const
