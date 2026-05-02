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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        ]
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          actor_id: string | null
          content: string | null
          created_at: string
          id: string
          is_read: boolean
          link: string | null
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
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
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
          locale_source: string | null
          posts_count: number
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
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
          locale_source?: string | null
          posts_count?: number
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
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
          locale_source?: string | null
          posts_count?: number
          updated_at?: string
          username?: string
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
        Relationships: []
      }
      site_visits: {
        Row: {
          first_seen: string
          id: string
          last_seen: string
          path: string | null
          session_id: string
          user_agent: string | null
        }
        Insert: {
          first_seen?: string
          id?: string
          last_seen?: string
          path?: string | null
          session_id: string
          user_agent?: string | null
        }
        Update: {
          first_seen?: string
          id?: string
          last_seen?: string
          path?: string | null
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
        Relationships: []
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
      is_owner: { Args: { _user_id: string }; Returns: boolean }
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
      order_status:
        | "pending"
        | "paid"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "refunded"
      post_type: "post" | "video" | "short" | "story"
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
      app_role: ["admin", "creator", "shopper", "user", "owner", "group_admin"],
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
      post_type: ["post", "video", "short", "story"],
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
